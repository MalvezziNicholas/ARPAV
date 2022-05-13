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

import { useNavigate } from "react-router-dom";

async function fetchStazioni(token) {
  const config = await (await fetch("config.json")).json();
  var resp = await axios.post(config.restServer + "stazioni", null, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  // if resp.status is not ok try to refreshToken
  if (isInvalidTokenStatus(resp.status)) {
    token = await doRefreshToken();
    // retry
    resp = await axios.post(config.restServer + "stazioni", null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (isInvalidTokenStatus(resp.status))
      throw new InvalidTokenError("Your token is invalid");
  }
  let awaitStazioni = [];
  for (const url in resp.data.stazioni) {
    awaitStazioni.push(
      axios.post(url, null, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
    );
  }
  let stazioni = [];
  // wait to fetch all stazioni
  for (const stazione in await Promise.all(awaitStazioni)) {
    if (isInvalidTokenStatus(stazione.status)) {
      token = await doRefreshToken();
      // retry
      return fetchStazioni(token);
    }
    stazioni.push(stazione.data);
  }
  return stazioni;
}

function isEqualOrNull(value, v) {
  return value === "" || value === undefined || value === null || value === v;
}

function containsOrNull(arr, v) {
  return arr === undefined || arr === null || arr.inclused(v);
}

const Stazioni = ({ style }) => {
  const navigate = useNavigate();

  const [stazioni, setStazioni] = useState([]);
  const [id, setId] = useState("");
  const [nomi, setNomi] = useState([]);
  const [localita, setLocalita] = useState([]);
  const [comuni, setComuni] = useState([]);
  const [province, setProvince] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetchStazioni(token)
      .then((resp) => {
        setStazioni(resp);
      })
      .catch((err) => {
        if (err instanceof InvalidTokenError) return navigate("/");
        //alert("An err occured");
      });
  }, [navigate]);

  const tableStyle = {
    padding: 20,
    width: "90%",
    backgroundColor: "#243142",
    margin: "auto",
  };
  const paperStyle = {
    padding: 20,
    width: "90%",
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
            setNomi(e.target.value.replace(/\s/g, "").split(","));
          }}
          label="Nomi"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setLocalita(e.target.value.replace(/\s/g, "").split(","));
          }}
          label="località"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setComuni(e.target.value.replace(/\s/g, "").split(","));
          }}
          label="comuni"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setProvince(e.target.value.replace(/\s/g, "").split(","));
          }}
          label="province"
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
                  isEqualOrNull(id, stazione.id) &&
                  containsOrNull(nomi, stazione.nome) &&
                  containsOrNull(localita, stazione.localita) &&
                  containsOrNull(comuni, stazione.comune) &&
                  containsOrNull(province, stazione.provincia)
                );
              })
              .map((stazione) => (
                <TableRow
                  key={stazione.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell style={bodyCellStyle} component="th" scope="row">
                    {stazione.id}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.nome}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.localita}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.comune}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.provincia}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.lat}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {stazione.lon}
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
