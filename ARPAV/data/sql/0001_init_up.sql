create DATABASE arpav;

use arpav;

CREATE table stazioni(
    id char(9) PRIMARY KEY, 
    nome varchar(32) not null,
    localita varchar(32) not null,
    comune varchar(32) not null,
    provincia varchar(32) not null,
    lat float(3, 2),
    lon float(3, 2)
);

CREATE table rilevazioni(
    id char(9), 
    data date,
    tipoInquinante varchar(32),
    valore int not null,
	PRIMARY KEY (id, data, tipoInquinante), 
    FOREIGN KEY(id) REFERENCES stazioni(id)
		ON UPDATE CASCADE ON DELETE CASCADE
);