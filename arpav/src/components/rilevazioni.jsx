import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
} from "@mui/material";

import { useTokenVerify, refreshToken } from "../utils/token";

import axios from "axios";

function fetchRilevazione(token, url) {
  return axios.post(url, null, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

async function doRefreshToken() {
  let resp = await refreshToken(sessionStorage.getItem("refreshToken"));
  if (300 <= resp.status || resp.status < 200) {
    return;
  }
  sessionStorage.setItem("accessToken", resp.data.accessToken);
  return resp.data.accessToken;
}

async function fetchRilevazioni(token) {
  try {
    const config = await (await fetch("config.json")).json();
    var resp = await axios.post(config.restServer + "rilevazioni", null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    // if resp.status is not ok try to refreshToken
    if (300 <= resp.status || resp.status < 200) {
      token = await doRefreshToken();
      // if refreshToken fails return
      if (token === undefined) {
        return [];
      }
      resp = await axios.post(config.restServer + "rilevazioni", null, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
    }
    let awaitRilevazioni = [];
    for (const url in resp.data.rilevazioni) {
      awaitRilevazioni.push(fetchRilevazione(token, url));
    }
    let rilevazioni = [];
    // wait to fetch all rilevazioni
    for (const rilevazione in await Promise.all(awaitRilevazioni)) {
      if (300 <= rilevazione.status || rilevazione.status < 200) {
        token = await doRefreshToken();
        // if refreshToken fails return
        if (token === undefined) {
          return [];
        }
        // else retry
        return fetchRilevazioni(token);
      }
      rilevazioni.push(rilevazione.data);
    }
    return rilevazioni;
  } catch {
    alert("An error occured");
    return [];
  }
}

const Rilevazioni = ({ style }) => {
  const token = sessionStorage.getItem("accessToken");
  useTokenVerify(token);

  const [rilevazioni, setRilevazioni] = useState([]);
  const [id, setId] = useState("");
  const [data, setData] = useState("");
  const [tipoInquinante, setTipoInquinante] = useState("");
  const [valore, setValore] = useState("");

  fetchRilevazioni(token)
    .then((resp) => {
      setRilevazioni(resp);
    })
    .catch(() => alert("An err occured"));

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
        <Typography fontWeight={600}>FILTER BY</Typography>
        {/*
        <TextField
          onChange={(e) => setSite(e.target.value)}
          label="site"
          placeholder="Filter by site"
          fullWidth
          style={inputStyle}
        ></TextField>
  */}
      </Paper>
      <TableContainer component={Paper} style={tableStyle} elevation={10}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell style={headerCellStyle}>RILEVAZIONE ID</TableCell>
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
            {rilevazioni.map(
              (rilevazione) =>
                true && (
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
                )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default Rilevazioni;
