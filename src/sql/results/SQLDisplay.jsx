import React from "react";
import { format as formatSQL } from "sql-formatter";
import { Column } from "ui/layout/Column";
import { Row } from "ui/layout/Row";
import VerticalSpace from "ui/layout/VerticalSpace";
import { styled } from "ui/styled/style";

export function SQLDisplay({ background, label, children }) {
  return (
    <Row css={{ padding: "$8" }}>
      <Column css={{ background, padding: "$12", borderRadius: "$4" }}>
        {label}
        {label != null ? <VerticalSpace /> : null}
        <SQL>{children}</SQL>
      </Column>
    </Row>
  );
}

const SQL = styled(
  ({ children, ...props }) => (
    <pre {...props}>
      {formatSQL(children ?? "", { language: "postgresql" })}
    </pre>
  ),
  {
    lineHeight: 1,
    fontFamily: "Menlo, Consolas, Monaco, monospace",
    fontSize: "12px",
  }
);
