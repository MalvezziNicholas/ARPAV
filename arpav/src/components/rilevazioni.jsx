import React, { useEffect, useState } from "react";

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
  TextField,
} from "@mui/material";

import useTokenVerify from "../utils/tokenVerify";

import axios from "axios";

function queryFromVals(vals) {
  let query = "?";
  let i = 0;
  for (const v in vals) {
    query += v;
    if (i && i < vals.keys.length - 1) query += "&";
    i++;
  }
}

const fetchData = async (token, query) => {
  return fetch("config.json")
    .then((resp) => resp.json())
    .then((config) =>
      axios.post(
        config.restAuthenticationServer + "rilevazioni" + query,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    )
    .then((resp) => resp.data)
    .catch((err) => alert(err));
};

const Rilevazioni = ({ style }) => {
  const token = JSON.parse(sessionStorage.getItem("token"));
  useTokenVerify(token);

  const [rilevazioni, setRilevazioni] = useState([]);
  useEffect(() => {
    let token = JSON.parse(sessionStorage.getItem("token"));
    fetchData(token, queryFromVals({ id, data, tipoInquinante, valore }))
      .then((resp) => {
        setRilevazioni(resp);
      })
      .catch(() => console.log("An err occured"));
  }, []);

  const [id, setId] = useState("");
  const [data, setData] = useState("");
  const [tipoInquinante, setTipoInquinante] = useState("");
  const [valore, setValore] = useState("");

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
