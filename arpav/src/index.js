import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import axios from "axios";

import Navbar from "./components/navbar";
import Login from "./components/login";
import Misurazioni from "./components/misurazioni";
import Stazioni from "./components/stazioni";
import Home from "./components/home";
import Stats from "./components/stats";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@mui/material";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#fb5b21",
    },
  },
});

const logout = () => {
  fetch("config.json")
    .then((resp) => resp.json())
    .then((resp) => {
      axios
        .delete(
          resp.restAuthenticationServer + "logout",
          {
            token: sessionStorage.getItem("refreshToken"),
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
        })
        .catch(() => {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
        });
    });
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar items={[{ text: "login", url: "/login" }]} />
              <Home style={{ padding: "180px" }} />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login style={{ padding: "180px" }} />
            </>
          }
        />
        <Route
          path="/stazioni"
          element={
            <>
              <Navbar
                items={[
                  { text: "stazioni", url: "/stazioni" },
                  { text: "misurazioni", url: "/misurazioni" },
                  //   { text: "stats", url: "/stats" },
                  { text: "logout", url: "/login", onClick: logout },
                ]}
              />
              <Stazioni style={{ padding: "50px" }} />
            </>
          }
        />
        <Route
          path="/misurazioni"
          element={
            <>
              <Navbar
                items={[
                  { text: "stazioni", url: "/stazioni" },
                  { text: "misurazioni", url: "/misurazioni" },
                  //    { text: "stats", url: "/stats" },
                  { text: "logout", url: "/login", onClick: logout },
                ]}
              />
              <Misurazioni style={{ padding: "50px" }} />
            </>
          }
        />
      </Routes>
    </Router>
  </ThemeProvider>
);
