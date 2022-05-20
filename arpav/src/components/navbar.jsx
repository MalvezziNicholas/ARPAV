import React, { useEffect, useLayoutEffect, useState } from "react";
import { Box, AppBar, Toolbar, Button, Typography } from "@mui/material";

import { useNavigate } from "react-router-dom";

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

const Navbar = ({ items }) => {
  if (items === undefined) {
    items = [];
  }
  const [width] = useWindowSize();
  const [fontSize, setFontSize] = useState(20);
  const navigate = useNavigate();
  useEffect(() => {
    if (width < 500) {
      setFontSize(14);
    } else {
      setFontSize(20);
    }
  }, [width]);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{ backgroundColor: "#fb5b21" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Button onClick={() => navigate("/")}>
              <Typography color="black" fontWeight={700} fontSize={fontSize}>
                HOME
              </Typography>
            </Button>
          </Box>
          {items.map((item) => (
            <Button
              key={item.text}
              onClick={() => {
                if (item.onClick !== undefined) {
                  item.onClick();
                }
                navigate(item.url);
              }}
            >
              <Typography color="black" fontWeight={700} fontSize={fontSize}>
                {item.text}
              </Typography>
            </Button>
          ))}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
