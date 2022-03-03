import { CheckIcon } from "@modulz/radix-icons";
// import DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { forwardRef } from "react";
import { css, styled } from "../styled/style";
import { Box } from "../layout/Box";
import { Column } from "../layout/Column";

var DropdownMenuPrimitive;

const baseItemCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontFamily: "$untitled",
  fontSize: "$1",
  fontVariantNumeric: "tabular-nums",
  lineHeight: "1",
  cursor: "default",
  userSelect: "none",
  whiteSpace: "nowrap",
  height: "$5",
  px: "$5",
});
const labelCss = css(baseItemCss, {
  color: "$slate11",
});
const itemCss = css(baseItemCss, {
  position: "relative",
  color: "$hiContrast",
  "&:focus": {
    outline: "none",
    backgroundColor: "$blue9",
    color: "white",
  },
  "&[data-disabled]": {
    color: "$slate9",
  },
});

const separatorCss = css({
  height: 1,
  my: "$1",
  backgroundColor: "$slate6",
});

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = styled(
  DropdownMenuPrimitive.Content,
  css({
    boxSizing: "border-box",
    minWidth: 120,
    py: "$1",
  }),
  css({
    backgroundColor: "$panel",
    borderRadius: "$3",
    boxShadow:
      "$colors$shadowLight 0px 10px 38px -10px, $colors$shadowDark 0px 10px 20px -15px",
  })
);
export const DropdownMenuSeparator = styled(
  DropdownMenuPrimitive.Separator,
  separatorCss
);
export const DropdownMenuItem = styled(DropdownMenuPrimitive.Item, itemCss);
const StyledDropdownMenuRadioItem = styled(
  DropdownMenuPrimitive.RadioItem,
  itemCss
);
export const DropdownMenuRadioItem = forwardRef(function (
  { children, ...props },
  forwardedRef
) {
  return (
    <StyledDropdownMenuRadioItem {...props} ref={forwardedRef}>
      <Box css={{ display: "inline", position: "absolute", left: "$4" }}>
        <DropdownMenuPrimitive.ItemIndicator>
          <Column
            css={{
              width: "$12",
              height: "$12",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              css={{
                width: "$4",
                height: "$4",
                backgroundColor: "currentColor",
                borderRadius: "$round",
              }}
            />
            /> />/>
          </Column>
        </DropdownMenuPrimitive.ItemIndicator>
      </Box>
      {children}
    </StyledDropdownMenuRadioItem>
  );
});

const StyledDropdownMenuCheckboxItem = styled(
  DropdownMenuPrimitive.CheckboxItem,
  itemCss
);
export const DropdownMenuCheckboxItem = forwardRef(function (
  { children, ...props },
  forwardedRef
) {
  return (
    <StyledDropdownMenuCheckboxItem {...props} ref={forwardedRef}>
      <Box css={{ display: "inline", position: "absolute", left: "$4" }}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </Box>
      {children}
    </StyledDropdownMenuCheckboxItem>
  );
});
export const DropdownMenuLabel = styled(DropdownMenuPrimitive.Label, labelCss);
export const DropdownMenuRadioGroup = styled(
  DropdownMenuPrimitive.RadioGroup,
  {}
);
export const DropdownMenuGroup = styled(DropdownMenuPrimitive.Group, {});
