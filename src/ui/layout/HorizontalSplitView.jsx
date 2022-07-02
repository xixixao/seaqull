import { invariant } from "js/invariant";
import { Children } from "react";
import { Box } from "./Box";
import HorizontalSpace from "./HorizontalSpace";

export function HorizontalSplitView({ children }) {
  const childrenArray = Children.toArray(children);
  invariant(childrenArray.length === 2, "Split view can have only 2 children");
  const [first, second] = childrenArray;
  return (
    <>
      <Box
        css={{
          height: "fit-content",
          flex: "1 0 0",
          overflowX: "scroll",
          maxWidth: "fit-content",
          borderRight: "1px solid $slate7",
        }}
      >
        {first}
      </Box>
      <HorizontalSpace />
      <HorizontalSpace />
      <Box
        css={{
          height: "fit-content",
          flex: "1 0 0",
          overflowX: "scroll",
          maxWidth: "fit-content",
        }}
      >
        {second}
      </Box>
    </>
  );
}
