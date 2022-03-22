import { TooltipsPosition } from "ui/interactive/Tooltip";
import { Column } from "./Column";
import { Relative } from "./Relative";

export function RelativeColumn({ css, children, ...position }) {
  const { left, bottom, center } = position;
  return (
    <Relative {...position}>
      <Column css={css}>
        <TooltipsPosition
          side={left ? "right" : "left"}
          align={bottom ? "start" : center ? "center" : "end"}
        >
          {children}
        </TooltipsPosition>
      </Column>
    </Relative>
  );
}
