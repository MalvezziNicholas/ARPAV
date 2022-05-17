import json
import os,binascii

def pad_id(id):
    hex_id = id.encode().hex()
    return hex_id + "0" * (24 - len(hex_id))

def random_id():
    return binascii.hexlify(os.urandom(12)).decode()

def fix_data():
    with open("misurazioni.json", "r", encoding="utf-8") as f:
        misurazioni = json.load(f)

    fixed_misurazioni = []
    misurazioni_lookup = {}
    for misurazione in misurazioni["stazioni"]:
        tmp_id = misurazione["codseqst"]
        del misurazione["codseqst"]
        misurazione["stazione"] = pad_id(tmp_id)
        tmp_mis = misurazione["misurazioni"]
        del misurazione["misurazioni"]
        for mis in tmp_mis:
            for tipoInquinante, misurazioni_inquinante in mis.items():
                for ril in misurazioni_inquinante:
                    misurazione_copy = misurazione.copy()
                    misurazione_copy["tipoInquinante"] = tipoInquinante
                    misurazione_copy["mis"] = float(ril["mis"]) if ril["mis"] != "" else 0.0
                    misurazione_copy["data"] = ril["data"]
                    misurazione_copy["_id"] = random_id()
                    fixed_misurazioni.append(misurazione_copy)
                    if pad_id(tmp_id) not in misurazioni_lookup:
                        misurazioni_lookup[pad_id(tmp_id)] = []
                    misurazioni_lookup[pad_id(tmp_id)].append(misurazione_copy["_id"])

    with open("misurazioni_collection.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(fixed_misurazioni, indent=4))

    with open("coords.json", "r", encoding="utf-8") as f:
        coords = json.load(f)
        
    fixed_coords = {}
    for c in coords["coordinate"]:
        fixed_coords[c["codseqst"]] = c

    with open("stats.json", "r", encoding="utf-8") as f:
        stats = json.load(f)
        
    fixed_stats = []
    for stazione in stats["stazioni"]:
        fixed_stazione = stazione
        if stazione["codseqst"] in fixed_coords:
            fixed_stazione["lat"] = float(fixed_coords[stazione["codseqst"]]["lat"])
            fixed_stazione["lon"] = float(fixed_coords[stazione["codseqst"]]["lon"])
        else:
            fixed_stazione["lat"] = None
            fixed_stazione["lon"] = None
        tmp_id = fixed_stazione["codseqst"]
        del fixed_stazione["codseqst"]
        fixed_stazione["_id"] = pad_id(tmp_id)
        if fixed_stazione["_id"] in misurazioni_lookup:
            fixed_stazione["misurazioni"] = misurazioni_lookup[fixed_stazione["_id"]]
        else:
            fixed_stazione["misurazioni"] = []
        fixed_stats.append(fixed_stazione)
        
    with open("stazioni_collection.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(fixed_stats, indent=4))

def main():
    fix_data()

if __name__ == "__main__":
    main()
