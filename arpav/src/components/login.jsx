import {
  TextField,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  Link,
  Alert,
} from "@mui/material";

import { React, useState } from "react";
import axios from "axios";

import Cookies from "universal-cookie";

import { useNavigate } from "react-router-dom";

const Login = ({ style }) => {
  const login = async () => {
    if (remember) {
      cookieManager.set("email", username, { path: "/" });
    } else {
      cookieManager.set("email", "", { path: "/", expires: 0 });
    }
    if (!username || !password) {
      setErr("All field must be filled");
      return;
    }
    try {
      let resp = await axios.post(
        (await config).restAuthenticationServer + "login",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (
        resp.data.accessToken === undefined ||
        resp.data.refreshToken === undefined
      ) {
        setErr("unexpected error");
        return;
      }
      sessionStorage.setItem(
        "accessToken",
        JSON.stringify(resp.data.accessToken)
      );
      sessionStorage.setItem(
        "refreshToken",
        JSON.stringify(resp.data.refreshToken)
      );
      navigate("/stazioni");
    } catch (err) {
      setErr("unexpected error");
    }
  };

  const cookieManager = new Cookies();
  const navigate = useNavigate();

  const [err, setErr] = useState("");
  const [username, setUsername] = useState(cookieManager.get("email"));
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const config = fetch("config.json")
    .then((resp) => resp.json())
    .then((resp) => resp)
    .catch(() => setErr("unexpected error"));
  const paperStyle = {
    padding: 20,
    width: 600,
    backgroundColor: "#ffffff",
    margin: "auto",
  };
  const inputStyle = {
    marginTop: 20,
    backgroundColor: "#ffffff",
  };
  return (
    <Grid style={style} container>
      <Paper elevation={10} style={paperStyle}>
        {err !== "" && <Alert severity="warning">{err}</Alert>}
        <TextField
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          label="Username"
          placeholder="Enter your username"
          fullWidth
          required
          style={inputStyle}
          defaultValue={cookieManager.get("username")}
        ></TextField>
        <TextField
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          label="Password"
          type="password"
          placeholder="Enter your Password"
          fullWidth
          required
          style={inputStyle}
        ></TextField>
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="Remember me"
          onChange={(e) => {
            setRemember(e.target.checked);
          }}
        />
        <Button
          onClick={login}
          type="submit"
          variant="contained"
          color="primary"
          style={{
            height: "60px",
          }}
          fullWidth
        >
          Sign in
        </Button>
        <Link href="#" underline="hover">
          Forgot password ?
        </Link>
      </Paper>
    </Grid>
  );
};

export default Login;
