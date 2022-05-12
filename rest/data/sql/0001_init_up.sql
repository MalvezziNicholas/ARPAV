create DATABASE arpav;

use arpav;

CREATE table stazioni(
    id char(9) PRIMARY KEY, 
    nome varchar(64) not null,
    localita varchar(64) not null,
    comune varchar(64) not null,
    provincia varchar(64) not null,
    lat float(12, 10),
    lon float(12, 10)
) CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE table rilevazioni(
    id char(9), 
    data datetime,
    tipoInquinante varchar(16),
    valore int not null,
	PRIMARY KEY (id, data, tipoInquinante), 
    FOREIGN KEY(id) REFERENCES stazioni(id)
		ON UPDATE CASCADE ON DELETE CASCADE
) CHARACTER SET utf8 COLLATE utf8_general_ci;