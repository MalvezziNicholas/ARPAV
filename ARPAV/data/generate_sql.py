import json

def generate_sql():
    with open("fixed_stats.json", "r") as f:
        fixed_stats = json.load(f)

    with open("rilevazioni.json", "r") as f:
        fixed_ril = json.load(f)

    sql_stazioni = "INSERT INTO stazioni (id, nome, localita, comune, provincia, lat, lon) VALUES "
    for i, stazione in enumerate(fixed_stats["stazioni"]):
        sql_stazioni += f"\n{stazione['codseqst'], stazione['nome'], stazione['localita'], stazione['comune'], stazione['provincia'], stazione['lat'], stazione['lon']}"
        if i + 1 < len(fixed_stats["stazioni"]):
            sql_stazioni += ","
    sql_stazioni += ";"
    sql_stazioni = sql_stazioni.replace("None", "null")

    sql_rilevazioni = "INSERT INTO rilevazioni (id, data, tipoInquinante, valore) VALUES "
    for i, ril in enumerate(fixed_ril["stazioni"]):
        id_ril = ril["codseqst"]
        for misurazioni in ril["misurazioni"]:
            for inq, mis_inq in misurazioni.items():
                for mis in mis_inq:
                    sql_rilevazioni += f"\n{id_ril, mis['data'], inq, float(mis['mis']) if mis['mis'] != '' else 0.0},"
    sql_rilevazioni = sql_rilevazioni[:-1]
    sql_rilevazioni += ";"
    
    with open("populate.sql", "w") as f:
        f.write("-- POPULATE STAZIONI --\n")
        f.write(sql_stazioni)
        f.write("\n\n\n")
        f.write("-- POPULATE RILEVAZIONI --\n")
        f.write(sql_rilevazioni)
    
def fix_data():
    with open("coords.json", "r") as f:
        coords = json.load(f)
        
    fixed_coords = {}
    for c in coords["coordinate"]:
        fixed_coords[c["codseqst"]] = c

    with open("stats.json", "r") as f:
        stats = json.load(f)
        
    fixed_stats = {"stazioni": []}
    for stazione in stats["stazioni"]:
        fixed_stazione = stazione
        if stazione["codseqst"] in fixed_coords:
            fixed_stazione["lat"] = float(fixed_coords[stazione["codseqst"]]["lat"])
            fixed_stazione["lon"] = float(fixed_coords[stazione["codseqst"]]["lon"])
        else:
            fixed_stazione["lat"] = None
            fixed_stazione["lon"] = None
        fixed_stats["stazioni"].append(stazione)
        
    with open("fixed_stats.json", "w") as f:
        f.write(json.dumps(fixed_stats, indent=4))

def main():
    fix_data()
    generate_sql()

if __name__ == "__main__":
    main()
