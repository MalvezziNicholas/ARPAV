import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

import {
  doRefreshToken,
  InvalidTokenError,
  isInvalidTokenStatus,
} from "../utils/token";

import React, { useState, useEffect } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

function isNotDefined(v) {
  return v === undefined || v === null || v === "";
}

async function awaitStats(statsToAwait, parseStats, setStazioni) {
  let stats = [];
  for (const stat of await Promise.all(statsToAwait)) {
    if (isInvalidTokenStatus(stat.status)) {
      throw new InvalidTokenError("Your token is invalid");
    }
    stats.push(parseStats(stats.data));
  }
  setStazioni(stats);
  return new Promise((r) => setTimeout(r, 1000));
}

async function fetchStats(token, $group, parseStats, setStats, attemts) {
  try {
    const config = await (await fetch("config.json")).json();
    //let uri = config.restServer + "stats?$group=".concat($group);
    let uri =
      'http://localhost:8000/v1.1/stats?$group={"_id":{"tipoInquinante":"$tipoInquinante"},"media":{"$avg":"$mis"}}';
    console.log(uri);
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
    let statsToAwait = [];
    let i = 0;
    for (const url of resp.data) {
      statsToAwait.push(
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
        // wait to fetch all stats
        await awaitStats(statsToAwait, parseStats, setStats);
        i = 0;
      }
    }
    if (i) {
      // fetch remaining
      await awaitStats(statsToAwait, parseStats, setStats);
    }
  } catch (err) {
    if (err instanceof InvalidTokenError && !attemts) {
      token = doRefreshToken();
      setStats([]);
      return fetchStats(token, $group, parseStats, setStats, 1);
    }
  }
}

const Stats = (props) => {
  const navigate = useNavigate();

  const $group = props.$group;
  const parseStats = props.parseStats;

  const [stats, setStats] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetchStats(token, $group, parseStats, setStats, 0).catch((err) => {
      if (err instanceof InvalidTokenError) return navigate("/login");
      alert("An err occured");
    });
  }, [navigate, $group, parseStats]);

  return (
    <LineChart
      width={730}
      height={250}
      data={stats}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="pv" stroke="#8884d8" />
      <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
    </LineChart>
  );
};

export default Stats;
