import { Box } from "./Box";
import { Button } from "./Button";

export function ButtonWithIcon({ icon, children, ...props }) {
  return (
    <Button {...props}>
      <Box css={{ height: 18, marginRight: "$4" }}>{icon}</Box>
      {children}
    </Button>
  );
}
