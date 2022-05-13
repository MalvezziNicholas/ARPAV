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

async function fetchRilevazioni(token) {
  const config = await (await fetch("config.json")).json();
  var resp = await axios.post(config.restServer + "rilevazioni", null, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  // if resp.status is not ok try to refreshToken
  if (isInvalidTokenStatus(resp.status)) {
    token = await doRefreshToken();
    // retry
    resp = await axios.post(config.restServer + "rilevazioni", null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (isInvalidTokenStatus(resp.status))
      throw new InvalidTokenError("Your token is invalid");
  }
  let awaitRilevazioni = [];
  for (const url in resp.data.rilevazioni) {
    awaitRilevazioni.push(
      axios.post(url, null, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
    );
  }
  let rilevazioni = [];
  // wait to fetch all rilevazioni
  for (const rilevazione in await Promise.all(awaitRilevazioni)) {
    if (isInvalidTokenStatus(rilevazione.status)) {
      token = await doRefreshToken();
      // retry
      return fetchRilevazioni(token);
    }
    rilevazioni.push(rilevazione.data);
  }
  return rilevazioni;
}

function isEqualOrNull(value, v) {
  return value === "" || value === undefined || value === null || value === v;
}

function containsOrNull(arr, v) {
  return arr === undefined || arr === null || arr.inclused(v);
}

const Rilevazioni = ({ style }) => {
  const navigate = useNavigate();

  const [rilevazioni, setRilevazioni] = useState([]);
  const [id, setId] = useState("");
  const [tipiInquinanti, setTipiInquinanti] = useState();
  const [valore, setValore] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetchRilevazioni(token)
      .then((resp) => {
        setRilevazioni(resp);
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
          label="ID rilevazione"
          placeholder="Filtra per id"
          fullWidth
          style={inputStyle}
        ></TextField>
        <TextField
          onChange={(e) => {
            setTipiInquinanti(e.target.value.replace(/\s/g, "").split(","));
          }}
          label="Tipi inquinanti"
          placeholder="separati da ,"
          fullWidth
          style={inputStyle}
        ></TextField>
      </Paper>
      <TableContainer component={Paper} style={tableStyle} elevation={10}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell style={headerCellStyle}>ID RILEVAZIONE</TableCell>
              <TableCell style={headerCellStyle} align="right">
                DATA
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                INQUINANTE
              </TableCell>
              <TableCell style={headerCellStyle} align="right">
                VALORE
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rilevazioni
              .filter((rilevazione) => {
                return (
                  isEqualOrNull(id, rilevazione.id) &&
                  containsOrNull(tipiInquinanti, rilevazione.tipoInquinante) &&
                  isEqualOrNull(valore, rilevazione.valore)
                );
              })
              .map((rilevazione) => (
                <TableRow
                  key={rilevazione.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell style={bodyCellStyle} component="th" scope="row">
                    {rilevazione.id}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {rilevazione.data}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {rilevazione.tipoInquinante}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {rilevazione.valore}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default Rilevazioni;
