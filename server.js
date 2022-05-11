const express = require("express");
const app = express();
const PORT = 8000;

require("dotenv").config();

const mysql = require("mysql");
const conn = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

/*
conn.connect((err) => {
  if (err) throw err;
  console.log("connected to database");
});
*/

const jwt = require("jsonwebtoken");

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server started on ${process.env.SERVER}:${PORT}`);
});

app.get("/stazioni", authenticateToken, (req, res) => {
  const queryData = ({ nome, localita, comune, procincia } = req.query);
  let query = "SELECT s.id FROM stazioni s WHERE";
  let inserted = 0;
  for (const k in queryData) {
    if (inserted > 0) query += " AND";
    query += " " + queryData[k];
  }
  conn.query(query, Object.values(queryData), (error, results) => {
    if (error) {
      return console.error(error.message);
    }
    let urls = [];
    for (const row in results) {
      urls += `${process.env.SERVER}:${PORT}/stazioni/${row.id}`;
    }
    res.send(urls);
  });
});

app.get("/stazioni/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  let query = "SELECT s.* FROM stazioni s WHERE s.id = ? LIMIT 1";
  conn.query(query, [id], (error, results) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
});

app.get("/rilevazioni", authenticateToken, (req, res) => {
  const queryData = ({ data, tipoInquinante, valore, _where } = req.query);
  let query = "SELECT r.id FROM rilevazioni r WHERE";
  let inserted = 0;
  for (const k in queryData) {
    if (inserted > 0) query += " AND";
    query += " " + queryData[k];
  }
  conn.query(query, Object.values(queryData), (error, results) => {
    if (error) {
      return console.error(error.message);
    }
    let urls = [];
    for (const row in results) {
      urls += `${process.env.SERVER}:${PORT}/rilevazioni/${row.id}`;
    }
    res.send(urls);
  });
});

app.get("/rilevazioni/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  let query = "SELECT r.* FROM rilevazioni r WHERE r.id = ? LIMIT 1";
  conn.query(query, [id], (error, results) => {
    if (error) {
      return console.error(error.message);
    }
    res.send(results);
  });
});

function parseWhere(where) {
  let words = [];
  let parsedWhere = "";
  let word = "";
  const operators = ["lt", "le", "gt", "ge", "eq", "in", "and", "or"];
  const translatedOperators = {
    lt: "<",
    le: "=<",
    gt: ">",
    ge: ">=",
    eq: "=",
    and: "and",
    or: "or",
  };
  for (const c of where) {
    if (c === "(" || c === ",") {
      if (word === "") continue;
      words.push(word);
      word = "";
    } else if (c === ")") {
      if (word !== "") words.push(word);
      word = "";
      let pushed = 0;
      for (let i = words.length - 1; 0 <= i; i--) {
        pushed += 1;
        if (operators.includes(words[i])) {
          break;
        }
      }
      if (pushed < 3) return { ok: false };
      let operator = words[words.length - pushed];
      if (!operators.includes(operator)) return { ok: false };
      let construct;
      if (operator === "in") {
        construct = "in(";
        for (let i = 0; i < pushed - 2; i++) {
          construct += words.pop() + ", ";
        }
        construct += words.pop() + ")";
      } else if (pushed !== 3) {
        return { ok: false };
      } else {
        sencond = words.pop();
        first = words.pop();
        construct = first + " " + translatedOperators[operator] + " " + sencond;
      }
      words.pop(); // consume operator
      words.push(construct);
    } else {
      word += c;
    }
  }
  return { parsedWhere, ok: true };
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
