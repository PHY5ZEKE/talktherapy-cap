import React from "react";

import { Box, Fab, Zoom, useScrollTrigger } from "@mui/material";
import { KeyboardArrowUpRounded } from "@mui/icons-material";
import LandingHero from "./LandingHero";
import LandingServices from "./LandingServices";
import LandingFaq from "./LandingFaq";

function ScrollTop(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      event.target as HTMLDivElement
    ).ownerDocument?.querySelector("#back-to-top-anchor");

    if (anchor) {
      anchor.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

export default function index() {
  return (
    <>
      <span id="back-to-top-anchor" />
      <LandingHero />
      <LandingServices />
      <LandingFaq />
      <ScrollTop>
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpRounded />
        </Fab>
      </ScrollTop>
    </>
  );
}
