import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React, { Fragment } from "react";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import { useGetNodeConfig } from "../sqlNodes";

export function SQLResults({ appState }) {
  const selected = Nodes.selected(appState);
  const onlyLastSelected = only(Nodes.lastSelected(appState));
  const shown =
    selected.length === 0 && onlyLastSelected != null
      ? [onlyLastSelected]
      : selected;
  // const singleSelectedNode = only(selected);
  const getConfig = useGetNodeConfig();
  return (
    <Row
      css={{
        overflow: "scroll",
        padding: "0 $8",
        maxHeight: "100%",
      }}
    >
      {shown.map((node, i) => {
        const { Results } = getConfig(node);
        const Temp =
          Results ??
          (() => {
            return null;
          });
        return (
          <Fragment key={i}>
            <Temp node={node} appState={appState} />
            <HorizontalSpace />
            <HorizontalSpace />
          </Fragment>
        );
      })}
    </Row>
  );
}
