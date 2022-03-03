import { styled } from "ui/styled/style";

export const Relative = styled("div", {
  position: "absolute",
  zIndex: "inherit",
  variants: {
    top: {
      true: {
        top: 0,
      },
    },
    right: {
      true: {
        right: 0,
      },
    },
    left: {
      true: {
        left: 0,
      },
    },
    bottom: {
      true: {
        bottom: 0,
      },
    },
    center: { true: {} },
  },
  compoundVariants: [
    {
      top: true,
      center: true,
      css: {
        left: "50%",
        transform: "translate(-50%, 0)",
      },
    },
    {
      bottom: true,
      center: true,
      css: {
        left: "50%",
        transform: "translate(-50%, 0)",
      },
    },
    {
      left: true,
      center: true,
      css: {
        top: "50%",
        transform: "translate(0, -50%)",
      },
    },
    {
      right: true,
      center: true,
      css: {
        top: "50%",
        transform: "translate(0, -50%)",
      },
    },
  ],
});
