import { invariant } from "js/invariant";
import { Children } from "react";
import { Box } from "./Box";

export function SplitView({ children }) {
  const childrenArray = Children.toArray(children);
  invariant(childrenArray.length === 2, "Split view can have only 2 children");
  const [first, second] = childrenArray;
  return (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        css={{
          height: "65%",
          borderBottom: "1px solid $slate7",
          position: "relative",
        }}
      >
        {first}
      </Box>
      <Box
        css={{
          flexGrow: 1,
          maxHeight: "50%",
          position: "relative",
        }}
      >
        {second}
      </Box>
    </Box>
  );
}
