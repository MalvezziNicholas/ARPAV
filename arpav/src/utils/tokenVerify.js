import axios from "axios";
import { useNavigate } from "react-router-dom";

function useTokenVerify(token) {
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
          if (200 <= resp.status && resp.status <= 299) {
            navigate("/");
          }
        })
        .catch(() => {
          navigate("/");
        })
    );
}

export default useTokenVerify;
