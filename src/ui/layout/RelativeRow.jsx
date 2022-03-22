import { TooltipsPosition } from "ui/interactive/Tooltip";
import { Relative } from "./Relative";
import { Row } from "./Row";

export function RelativeRow({ css, children, ...position }) {
  const { top, right, center } = position;
  return (
    <Relative {...position}>
      <Row css={css}>
        <TooltipsPosition
          side={top ? "bottom" : "top"}
          align={right ? "end" : center ? "center" : "start"}
        >
          {children}
        </TooltipsPosition>
      </Row>
    </Relative>
  );
}
