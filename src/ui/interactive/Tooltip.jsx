import React from "react";
import { styled } from "../styled/style";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { createContext } from "react";
import { useContext } from "react";

const TooltipsPositionContext = createContext();

export function Tooltip({ children, content, ...props }) {
  const contextProps = useContext(TooltipsPositionContext) ?? {};
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <Content sideOffset={3} {...contextProps} {...props}>
        {content}
        <Box css={{ color: "$transparentPanel" }}>
          <TooltipPrimitive.Arrow
            offset={7}
            width={11}
            height={5}
            style={{ fill: "currentColor" }}
          />
        </Box>
      </Content>
    </TooltipPrimitive.Root>
  );
}

export function TooltipsPosition({ children, ...props }) {
  return (
    <TooltipsPositionContext.Provider value={props}>
      {children}
    </TooltipsPositionContext.Provider>
  );
}

const Box = styled("div");

const Content = styled(TooltipPrimitive.Content, {
  backgroundColor: "$transparentPanel",
  borderRadius: "$4",
  padding: "$4 $8",
  color: "$loContrast",
  font: "$detail",
});
