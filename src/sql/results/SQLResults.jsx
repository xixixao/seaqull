import * as Nodes from "graph/Nodes";
import { only } from "js/Arrays";
import React, { createContext, Fragment, useContext } from "react";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import { useGetNodeConfig } from "../sqlNodes";

const Context = createContext();
export function useSQLResultsNodeContext() {
  return useContext(Context);
}

export function useIsThisOnlySelectedNode() {
  const { appState } = useSQLResultsNodeContext();
  return only(Nodes.selected(appState)) != null;
}

export function SQLResults({ appState }) {
  const selected = Nodes.selected(appState);
  const onlyLastSelected = only(Nodes.lastSelected(appState));
  const getConfig = useGetNodeConfig();
  if (selected.length > 2) {
    return null;
  }
  const shown =
    selected.length === 0 && onlyLastSelected != null
      ? [onlyLastSelected]
      : selected;
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
            <Context.Provider value={{ appState, node }}>
              <Temp />
            </Context.Provider>
            <HorizontalSpace />
            <HorizontalSpace />
          </Fragment>
        );
      })}
    </Row>
  );
}
