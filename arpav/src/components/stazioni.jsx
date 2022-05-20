import React, { useState, useEffect } from "react";
import { AutoSizer, Column, Table } from "react-virtualized";

import "react-virtualized/styles.css";

import {
  TableCell,
  TableContainer,
  Paper,
  Grid,
  TextField,
} from "@mui/material";

import {
  doRefreshToken,
  InvalidTokenError,
  isInvalidTokenStatus,
} from "../utils/token";

import axios from "axios";

import { useNavigate, useSearchParams } from "react-router-dom";

async function awaitStazioni(stazioniToAwait, setStazioni) {
  let stazioni = [];
  for (const stazione of await Promise.all(stazioniToAwait)) {
    if (isInvalidTokenStatus(stazione.status)) {
      throw new InvalidTokenError("Your token is invalid");
    }
    stazioni.push(stazione.data);
  }
  setStazioni(stazioni);
  return new Promise((r) => setTimeout(r, 1000));
}

async function fetchStazioni(token, searchId, setStazioni, attemts) {
  try {
    const config = await (await fetch("config.json")).json();
    let uri = config.restServer + "stazioni";
    if (!isNotDefined(searchId)) {
      uri += `?$where={"_id":"${searchId}"}`;
    }
    var resp = await axios.get(
      uri,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (isInvalidTokenStatus(resp.status)) {
      throw new InvalidTokenError("Your token is invalid");
    }
    let stazioniToAwait = [];
    let i = 0;
    for (const url of resp.data) {
      stazioniToAwait.push(
        axios.get(
          url,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        )
      );
      if (++i === 300) {
        // wait to fetch all stazioni
        await awaitStazioni(stazioniToAwait, setStazioni);
        i = 0;
      }
    }
    if (i) {
      // fetch remaining
      await awaitStazioni(stazioniToAwait, setStazioni);
    }
  } catch (err) {
    if (err instanceof InvalidTokenError && !attemts) {
      token = doRefreshToken();
      setStazioni([]);
      return fetchStazioni(token, searchId, setStazioni, 1);
    }
  }
}

function isNotDefined(v) {
  return v === undefined || v === null || v === "";
}

function containsOrNull(arr, v) {
  return (
    arr === undefined || arr === null || arr.length === 0 || arr.includes(v)
  );
}
function parseCellData(cellData) {
  if (cellData.length > 24) return cellData.substring(0, 21) + "...";
  return cellData;
}

const Stazioni = (props) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const searchId = searchParams.get("id");

  const [stazioni, setStazioni] = useState([]);
  const [filteredStazioni, setFilteredStazioni] = useState([]);
  const [id, setId] = useState();
  const [nomi, setNomi] = useState([]);
  const [localita, setLocalita] = useState([]);
  const [comuni, setComuni] = useState([]);
  const [province, setProvince] = useState([]);
  const [tipizona, setTipizona] = useState([]);

  useEffect(() => {
    setFilteredStazioni(
      stazioni.filter((rilevazione) => {
        return (
          containsOrNull(id, rilevazione._id) &&
          containsOrNull(nomi, rilevazione.nome) &&
          containsOrNull(localita, rilevazione.localita) &&
          containsOrNull(province, rilevazione.provincia) &&
          containsOrNull(comuni, rilevazione.comune) &&
          containsOrNull(tipizona, rilevazione.tipozona)
        );
      })
    );
  }, [stazioni, id, nomi, localita, comuni, province, tipizona]);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetchStazioni(token, searchId, setStazioni, 0).catch((err) => {
      if (err instanceof InvalidTokenError) return navigate("/login");
      alert("An err occured");
    });
  }, [navigate, searchId]);

  const headerHeight = 48;
  const rowHeight = 48;

  const header = [
    {
      width: 600,
      label: "ID STAZIONE",
      dataKey: "_id",
    },

    {
      width: 600,
      label: "NOME",
      dataKey: "nome",
      numeric: true,
    },
    {
      width: 600,
      label: "LOCALITA",
      dataKey: "localita",
      numeric: true,
    },
    {
      width: 600,
      label: "COMUNE",
      dataKey: "comune",
      numeric: true,
    },
    {
      width: 600,
      label: "PROVINCIA",
      dataKey: "provincia",
      numeric: true,
    },
    {
      width: 600,
      label: "TIPOZONA",
      dataKey: "tipozona",
      numeric: true,
    },
  ];

  const cellRenderer = ({ cellData, columnIndex }) => {
    return (
      <TableCell
        component="div"
        variant="body"
        style={{
          fontSize: 15,
          color: "#000000",
          flex: 1,
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}
        align={
          columnIndex != null && header[columnIndex].numeric ? "right" : "left"
        }
      >
        {parseCellData(cellData)}
      </TableCell>
    );
  };

  const headerRenderer = ({ label, columnIndex }) => {
    return (
      <TableCell
        component="div"
        variant="head"
        style={{
          fontWeight: 600,
          fontSize: 17,
          color: "#000000",
          flex: 1,
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}
        align={header[columnIndex].numeric ? "right" : "left"}
      >
        {label}
      </TableCell>
    );
  };

  const paperStyle = {
    padding: 15,
    width: "100%",
    backgroundColor: "#ffffff",
    margin: "auto",
  };

  const tableStyle = {
    padding: 20,
    width: "100%",
    backgroundColor: "#fb5b21",
    margin: "auto",
    height: 600,
  };

  const inputStyle = {
    backgroundColor: "#ffffff",
    width: 150,
    margin: 10,
  };

  return (
    <Grid container style={props.style}>
      <Paper style={paperStyle}>
        <TextField
          onChange={(e) => {
            setId(e.target.value);
          }}
          label="ID stazione"
          placeholder="Filtra per id"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setNomi(
              e.target.value
                .split(",")
                .map((nome) => nome.trim())
                .filter((nome) => nome !== "")
            );
          }}
          label="Nomi"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setLocalita(
              e.target.value
                .split(",")
                .map((loc) => loc.trim())
                .filter((loc) => loc !== "")
            );
          }}
          label="località"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setComuni(
              e.target.value
                .split(",")
                .map((com) => com.trim())
                .filter((com) => com !== "")
            );
          }}
          label="comuni"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setProvince(
              e.target.value
                .split(",")
                .map((prov) => prov.trim())
                .filter((prov) => prov !== "")
            );
          }}
          label="province"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setTipizona(
              e.target.value
                .split(",")
                .map((zona) => zona.trim())
                .filter((zona) => zona !== "")
            );
          }}
          label="tipi zona"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
      </Paper>
      <TableContainer component={Paper} style={tableStyle} elevation={10}>
        <AutoSizer>
          {({ height, width }) => (
            <Table
              rowCount={filteredStazioni.length}
              rowGetter={({ index }) => filteredStazioni[index]}
              height={height}
              width={width}
              rowHeight={rowHeight}
              gridStyle={{
                direction: "inherit",
              }}
              headerHeight={headerHeight}
              rowStyle={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                flex: 1,
              }}
              onRowClick={({ index }) => {
                navigate(
                  "/misurazioni?stazione=" + filteredStazioni[index]._id
                );
              }}
            >
              {header.map(({ dataKey, ...other }, index) => {
                return (
                  <Column
                    key={dataKey}
                    headerRenderer={(headerProps) =>
                      headerRenderer({
                        ...headerProps,
                        columnIndex: index,
                      })
                    }
                    cellRenderer={cellRenderer}
                    dataKey={dataKey}
                    {...other}
                  />
                );
              })}
            </Table>
          )}
        </AutoSizer>
      </TableContainer>
    </Grid>
  );
};

export default Stazioni;
