import { styled } from "../styled/style";

export const Row = styled("div", {
  display: "flex",
  flexDirection: "row",
  variants: {
    align: {
      start: {
        alignItems: "flex-start",
      },
      center: {
        alignItems: "center",
      },
      end: {
        alignItems: "flex-end",
      },
      stretch: {
        alignItems: "stretch",
      },
    },
    justify: {
      start: {
        justifyContent: "flex-start",
      },
      center: {
        justifyContent: "center",
      },
      end: {
        justifyContent: "flex-end",
      },
      between: {
        justifyContent: "space-between",
      },
    },
  },
  defaultVariants: {
    align: "stretch",
    justify: "start",
  },
});
