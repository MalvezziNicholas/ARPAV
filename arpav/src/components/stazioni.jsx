import React, { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

async function fetchStazione(token, _id) {
  const config = await (await fetch("config.json")).json();
  var resp = await axios.get(
    config.restServer + "stazioni/" + _id,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  // if resp.status is not ok try to refreshToken
  if (isInvalidTokenStatus(resp.status)) {
    token = await doRefreshToken();
    // retry
    resp = await axios.get(
      config.restServer + "stazioni/" + _id,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (isInvalidTokenStatus(resp.status))
      throw new InvalidTokenError("Your token is invalid");
  }
  return resp.data;
}

async function fetchStazioni(token, _id) {
  if (!isNotDefined(_id)) return [await fetchStazione(token, _id)];
  const config = await (await fetch("config.json")).json();
  var resp = await axios.get(
    config.restServer + "stazioni",
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  // if resp.status is not ok try to refreshToken
  if (isInvalidTokenStatus(resp.status)) {
    token = await doRefreshToken();
    // retry
    resp = await axios.get(
      config.restServer + "stazioni",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (isInvalidTokenStatus(resp.status))
      throw new InvalidTokenError("Your token is invalid");
  }
  let awaitStazioni = [];
  for (const url of resp.data) {
    awaitStazioni.push(
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
  }
  let stazioni = [];
  // wait to fetch all stazioni
  for (const stazione of await Promise.all(awaitStazioni)) {
    if (isInvalidTokenStatus(stazione.status)) {
      token = await doRefreshToken();
      // retry
      return fetchStazioni(token);
    }
    stazioni.push(stazione.data);
  }
  return stazioni;
}

function isNotDefined(v) {
  return v === undefined || v === null || v === "";
}

function isEqualOrNull(value, v) {
  return isNotDefined(value) || value === v;
}

function containsOrNull(arr, v) {
  return (
    arr === undefined || arr === null || arr.length === 0 || arr.includes(v)
  );
}

function parseComune(comune) {
  if (comune.length > 23) return comune.substring(0, 20) + "...";
  return comune;
}

const Stazioni = ({ style }) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const search_id = searchParams.get("_id");

  const [stazioni, setStazioni] = useState([]);
  const [id, setId] = useState();
  const [nomi, setNomi] = useState([]);
  const [localita, setLocalita] = useState([]);
  const [comuni, setComuni] = useState([]);
  const [province, setProvince] = useState([]);
  const [tipizona, setTipizona] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetchStazioni(token, search_id)
      .then((resp) => {
        setStazioni(resp);
      })
      .catch((err) => {
        if (err instanceof InvalidTokenError) return navigate("/");
        //alert("An err occured");
      });
  }, [navigate, search_id]);
  console.log(stazioni);

  const tableStyle = {
    padding: 20,
    width: "95%",
    backgroundColor: "#243142",
    margin: "auto",
  };
  const paperStyle = {
    padding: 20,
    width: "95%",
    backgroundColor: "#ffffff",
    margin: "auto",
  };
  const inputStyle = {
    backgroundColor: "#ffffff",
    width: 150,
    margin: 10,
  };

  const headerCellStyle = { fontSize: 20, color: "#ffffff" };
  const bodyCellStyle = { color: "#ffffff" };

  return (
    <Grid container style={style}>
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
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell style={headerCellStyle}>ID STAZIONE</TableCell>
              <TableCell style={headerCellStyle} align="right">
                NOME
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                LOCALITÀ
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                COMUNE
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                PROVINCIA
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                TIPO ZONA
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                LATITUDINE
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                LONGITUDINE
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stazioni
              .filter((stazione) => {
                return (
                  isEqualOrNull(id, stazione._id) &&
                  containsOrNull(nomi, stazione.nome) &&
                  containsOrNull(localita, stazione.localita) &&
                  containsOrNull(comuni, stazione.comune) &&
                  containsOrNull(province, stazione.provincia) &&
                  containsOrNull(tipizona, stazione.tipozona)
                );
              })
              .map((stazione) => (
                <TableRow
                  key={stazione._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/misurazioni?stazione=" + stazione._id)
                  }
                >
                  <TableCell style={bodyCellStyle} component="th" scope="row">
                    {stazione._id}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.nome}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.localita}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {parseComune(stazione.comune)}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.provincia}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.tipozona}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.lat}
                    {!stazione.lat && "unknown"}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.lon}
                    {!stazione.lon && "unknown"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default Stazioni;
