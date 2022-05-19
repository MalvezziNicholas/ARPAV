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

async function fetchMisurazioni(token, _id) {
  const config = await (await fetch("config.json")).json();
  let uri = config.restServer + "misurazioni";
  if (!isNotDefined(_id)) {
    uri += `?$where={"stazione":"${_id}"}`;
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
  // if resp.status is not ok try to refreshToken
  if (isInvalidTokenStatus(resp.status)) {
    token = await doRefreshToken();
    // retry
    resp = await axios.get(
      uri,
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
  let awaitMisurazioni = [];
  for (const url of resp.data) {
    awaitMisurazioni.push(
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
  let misurazioni = [];
  // wait to fetch all misurazioni
  for (const misurazione of await Promise.all(awaitMisurazioni)) {
    if (isInvalidTokenStatus(misurazione.status)) {
      token = await doRefreshToken();
      // retry
      return fetchMisurazioni(token);
    }
    misurazioni.push(misurazione.data);
  }
  return misurazioni;
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

const Misurazioni = ({ style }) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const search_id = searchParams.get("stazione");

  const [misurazioni, setMisurazioni] = useState([]);
  const [id, setId] = useState("");
  const [stazioneId, setStazioneId] = useState("");
  const [tipiInquinanti, setTipiInquinanti] = useState();
  const [valoreMin, setValoreMin] = useState();
  const [valoreMax, setValoreMax] = useState();
  const [mese, setMese] = useState();

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetchMisurazioni(token, search_id)
      .then((resp) => {
        setMisurazioni(resp);
      })
      .catch((err) => {
        if (err instanceof InvalidTokenError) return navigate("/");
        //alert("An err occured");
      });
  }, [navigate, search_id]);

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
  const bodyCellStyle = {
    color: "#ffffff",
  };
  const stazioneBodyCell = {
    color: "#ffffff",
    cursor: "pointer",
  };

  return (
    <Grid container style={style}>
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
            setMese(e.target.value);
          }}
          label="Numero mese"
          placeholder="Filtra per mese"
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
              <TableCell style={headerCellStyle} align="right">
                ID STAZIONE
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {misurazioni
              .filter((misurazione) => {
                return (
                  isEqualOrNull(id, misurazione._id) &&
                  isEqualOrNull(stazioneId, misurazione.stazione) &&
                  containsOrNull(tipiInquinanti, misurazione.tipoInquinante) &&
                  isBetweenOrNull(valoreMin, valoreMax, misurazione.mis) &&
                  isEqualOrNull(
                    mese,
                    (new Date(misurazione.data).getMonth() + 1).toString()
                  )
                );
              })
              .map((misurazione) => (
                <TableRow
                  key={misurazione._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell style={bodyCellStyle} component="th" scope="row">
                    {misurazione._id}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {misurazione.data}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {misurazione.tipoInquinante}
                  </TableCell>
                  <TableCell style={bodyCellStyle} align="right">
                    {misurazione.mis}
                  </TableCell>
                  <TableCell
                    style={stazioneBodyCell}
                    align="right"
                    onClick={() =>
                      navigate("/stazioni?_id=" + misurazione.stazione)
                    }
                  >
                    {misurazione.stazione}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default Misurazioni;
