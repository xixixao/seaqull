import * as DialogPrimitive from "@radix-ui/react-dialog";
import { styled } from "editor/style";
import React, { forwardRef } from "react";

export function Dialog({ children, ...props }) {
  return (
    <DialogPrimitive.Root {...props}>
      <StyledOverlay />
      {children}
    </DialogPrimitive.Root>
  );
}

export const DialogContent = forwardRef(
  ({ children, ...props }, forwardedRef) => (
    <StyledContent {...props} ref={forwardedRef}>
      {children}
    </StyledContent>
  )
);

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  backgroundColor: "rgba(0, 0, 0, .15)",
  position: "fixed",
  zIndex: 10,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

const StyledContent = styled(DialogPrimitive.Content, {
  backgroundColor: "$panel",
  zIndex: 11,
  borderRadius: "$3",
  boxShadow:
    "$colors$shadowLight 0px 10px 38px -10px, $colors$shadowDark 0px 10px 20px -15px",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: 200,
  maxHeight: "85vh",
  padding: "$4",
  marginTop: "-5vh",
  // animation: `${fadeIn} 125ms linear, ${moveDown} 125ms cubic-bezier(0.22, 1, 0.36, 1)`,

  // Among other things, prevents text alignment inconsistencies when dialog can't be centered in the viewport evenly.
  // Affects animated and non-animated dialogs alike.
  willChange: "transform",

  "&:focus": {
    outline: "none",
  },
});

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
