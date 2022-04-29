create DATABASE arpav;

CREATE table stazioni(
    codseqst int(10) PRIMARY KEY AUTO_INCREMENT, 
    nome varchar(32) not null,
    localita varchar(32) not null,
    comune varchar(32) not null,
    provincia varchar(32) not null,
    lat float(3,2) not null,
    lon float(3,2) not null
)

CREATE table rilevazioni(
    codseqst int(10) PRIMARY KEY AUTO_INCREMENT, 
    data date not null,
    tipoInquinante varchar(32) not null,
    valore int not null,
    FOREIGN KEY(codseqst) REFERENCES stazioni(codseqst)
		ON UPDATE CASCADE ON DELETE CASCADE
)