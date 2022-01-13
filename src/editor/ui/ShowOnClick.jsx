import { useState } from "react";
import { Box } from "./Box";

export default function ShowOnClick({ css, trigger, children }) {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setIsShowing(true)}>{trigger}</div>
      {isShowing ? (
        <Box css={css} onMouseLeave={() => setIsShowing(false)}>
          {children}
        </Box>
      ) : null}
    </div>
  );
}
