import axios from "axios";

export async function refreshToken(refreshToken) {
  const config = await (await fetch("config.json")).json();
  return axios.post(
    config.restAuthenticationServer + "token",
    {
      token: refreshToken,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function doRefreshToken() {
  let resp = await refreshToken(sessionStorage.getItem("refreshToken"));
  if (isInvalidTokenStatus(resp.status))
    throw new InvalidTokenError("Your token is invalid");
  sessionStorage.setItem("accessToken", resp.data.accessToken);
  return resp.data.accessToken;
}

export class InvalidTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidTokenError";
  }
}

export function isInvalidTokenStatus(status) {
  return status === 403 || status === 401;
}
