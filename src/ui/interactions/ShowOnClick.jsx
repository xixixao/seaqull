import { useState } from "react";
import { Box } from "../layout/Box";

// TODO: This was a quick hack and it needs to be implemented properly
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
