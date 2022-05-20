import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import axios from "axios";

import Navbar from "./components/navbar";
import Login from "./components/login";
import Misurazioni from "./components/misurazioni";
import Stazioni from "./components/stazioni";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
  <Router>
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Login style={{ padding: "50px" }} />
          </>
        }
      />
      <Route
        path="/stazioni"
        element={
          <>
            <Navbar
              items={[
                { text: "misurazioni", url: "/misurazioni" },
                { text: "logout", url: "/", onClick: logout },
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
                { text: "logout", url: "/", onClick: logout },
              ]}
            />
            <Misurazioni style={{ padding: "50px" }} />
          </>
        }
      />
    </Routes>
  </Router>
);
