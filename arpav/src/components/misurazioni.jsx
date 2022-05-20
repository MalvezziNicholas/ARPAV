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

async function awaitMisurazioni(misurazioniToAwait, setMisurazioni) {
  let misurazioni = [];
  for (const misurazione of await Promise.all(misurazioniToAwait)) {
    if (isInvalidTokenStatus(misurazione.status)) {
      throw new InvalidTokenError("Your token is invalid");
    }
    misurazioni.push(misurazione.data);
  }
  setMisurazioni(misurazioni);
  return new Promise((r) => setTimeout(r, 1000));
}

async function fetchMisurazioni(
  token,
  searchStazioneId,
  setMisurazioni,
  attemts
) {
  try {
    const config = await (await fetch("config.json")).json();
    let uri = config.restServer + "misurazioni";
    if (!isNotDefined(searchStazioneId)) {
      uri += `?$where={"stazione":"${searchStazioneId}"}`;
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
    let misurazioniToAwait = [];
    let i = 0;
    for (const url of resp.data) {
      misurazioniToAwait.push(
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
        // wait to fetch all misurazioni
        await awaitMisurazioni(misurazioniToAwait, setMisurazioni);
        i = 0;
      }
    }
    if (i) {
      // fetch remaining
      await awaitMisurazioni(misurazioniToAwait, setMisurazioni);
    }
  } catch (err) {
    if (err instanceof InvalidTokenError && !attemts) {
      token = doRefreshToken();
      setMisurazioni([]);
      return fetchMisurazioni(token, searchStazioneId, setMisurazioni, 1);
    }
  }
}

function isNotDefined(v) {
  return v === undefined || v === null || v === "";
}

function isBetweenOrNull(min, max, v) {
  if (isNotDefined(min)) {
    if (isNotDefined(max)) {
      return true;
    }
    return v <= max;
  } else if (isNotDefined(max)) {
    return min <= v;
  }
  return min <= v && v <= max;
}

function isEqualOrNull(value, v) {
  return isNotDefined(value) || value === v;
}

function containsOrNull(arr, v) {
  return (
    arr === undefined || arr === null || arr.length === 0 || arr.includes(v)
  );
}

const Misurazioni = (props) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const searchStazioneId = searchParams.get("stazione");

  const [misurazioni, setMisurazioni] = useState([]);
  const [filteredMisurazioni, setFilteredMisurazioni] = useState([]);
  const [id, setId] = useState("");
  const [stazioneId, setStazioneId] = useState("");
  const [tipiInquinanti, setTipiInquinanti] = useState();
  const [valoreMin, setValoreMin] = useState();
  const [valoreMax, setValoreMax] = useState();
  const [anno, setAnno] = useState();
  const [mese, setMese] = useState();

  useEffect(() => {
    setFilteredMisurazioni(
      misurazioni.filter((misurazione) => {
        return (
          isEqualOrNull(id, misurazione._id) &&
          isEqualOrNull(stazioneId, misurazione.stazione) &&
          containsOrNull(tipiInquinanti, misurazione.tipoInquinante) &&
          isBetweenOrNull(valoreMin, valoreMax, misurazione.mis) &&
          isEqualOrNull(
            anno,
            new Date(misurazione.data).getFullYear().toString()
          ) &&
          isEqualOrNull(
            mese,
            (new Date(misurazione.data).getMonth() + 1).toString()
          )
        );
      })
    );
  }, [
    misurazioni,
    id,
    stazioneId,
    tipiInquinanti,
    valoreMin,
    valoreMax,
    anno,
    mese,
  ]);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetchMisurazioni(token, searchStazioneId, setMisurazioni, 0).catch(
      (err) => {
        if (err instanceof InvalidTokenError) return navigate("/login");
        alert("An err occured");
      }
    );
  }, [navigate, searchStazioneId]);

  const headerHeight = 48;
  const rowHeight = 48;

  const header = [
    {
      width: 600,
      label: "ID MISURAZIONE",
      dataKey: "_id",
    },

    {
      width: 600,
      label: "DATA",
      dataKey: "data",
      numeric: true,
    },
    {
      width: 600,
      label: "INQUINANTE",
      dataKey: "tipoInquinante",
      numeric: true,
    },
    {
      width: 600,
      label: "MISURAZIONE",
      dataKey: "mis",
      numeric: true,
    },
    {
      width: 600,
      label: "ID STAZIONE",
      dataKey: "stazione",
      numeric: true,
    },
  ];

  const cellRenderer = ({ cellData, columnIndex }) => {
    let style = {
      fontSize: 15,
      color: "#000000",
      flex: 1,
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",
    };
    let onClick = () => {};
    if (header[columnIndex].dataKey === "stazione") {
      style.cursor = "pointer";
      onClick = () => {
        navigate("/stazioni?id=" + cellData);
      };
    }
    return (
      <TableCell
        component="div"
        variant="body"
        style={style}
        align={
          columnIndex != null && header[columnIndex].numeric ? "right" : "left"
        }
        onClick={onClick}
      >
        {cellData}
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
          label="ID misurazione"
          placeholder="Filtra per id"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setTipiInquinanti(
              e.target.value
                .split(",")
                .map((inq) => inq.trim())
                .filter((inq) => inq !== "")
            );
          }}
          label="Tipi inquinanti"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setStazioneId(e.target.value);
          }}
          label="ID stazione"
          placeholder="Filtra per id"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          type="number"
          onChange={(e) => {
            setValoreMin(e.target.value);
          }}
          label="Valore min"
          placeholder="Filtra per valore"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          type="number"
          onChange={(e) => {
            setValoreMax(e.target.value);
          }}
          label="Valore max"
          placeholder="Filtra per valore"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          type="number"
          onChange={(e) => {
            setAnno(e.target.value);
          }}
          label="Anno"
          placeholder="Filtra per anno"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          type="number"
          onChange={(e) => {
            setMese(e.target.value);
          }}
          label="Numero mese"
          placeholder="Filtra per mese"
          fullWidth
          style={inputStyle}
        ></TextField>
      </Paper>
      <TableContainer component={Paper} style={tableStyle} elevation={10}>
        <AutoSizer>
          {({ height, width }) => (
            <Table
              rowCount={filteredMisurazioni.length}
              rowGetter={({ index }) => filteredMisurazioni[index]}
              height={height}
              width={width}
              rowHeight={rowHeight}
              gridStyle={{
                direction: "inherit",
              }}
              headerHeight={headerHeight}
              rowStyle={{
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                flex: 1,
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

export default Misurazioni;
