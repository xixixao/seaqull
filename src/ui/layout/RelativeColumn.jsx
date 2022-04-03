import { TooltipsPosition } from "ui/interactive/Tooltip";
import { Column } from "./Column";
import { Relative } from "./Relative";

export function RelativeColumn({ css, align, justify, children, ...position }) {
  const { left, bottom, center } = position;
  return (
    <Relative {...position}>
      <Column css={css} align={align} justify={justify}>
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
