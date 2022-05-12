import axios from "axios";
import { useNavigate } from "react-router-dom";

export function useTokenVerify(token) {
  const navigate = useNavigate();
  fetch("config.json")
    .then((resp) => resp.json())
    .then((resp) =>
      axios
        .post(
          resp.restAuthenticationServer + "verify",
          {
            token,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((resp) => {
          if (300 <= resp.status || resp.status < 200) {
            navigate("/");
          }
        })
        .catch(() => {
          navigate("/");
        })
    );
}

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
