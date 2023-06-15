import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{ p: 3, backgroundColor: "primary.main", color: "white", mt: "auto" }}
    >
      <Typography variant="body2" color="inherit" align="center">
        {"This site was built as a hacker role for CMPT 985. "}
        <Link color="inherit" href="https://mobile-nerf.github.io/">
          Original Paper
        </Link>{" "}
      </Typography>
      <Typography variant="body2" color="inherit" align="center">
        For test purposes only.
      </Typography>
    </Box>
  );
};

export default Footer;
