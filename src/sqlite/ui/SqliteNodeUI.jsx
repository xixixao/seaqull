import {
  addDetachedNode,
  AddNodeButton,
  addStandaloneNode,
  addTightNode,
} from "editor/AddNodeButton";
import NodeUI from "editor/NodeUI";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useAppStateDataContext } from "editor/state";
import { Column } from "editor/ui/Column";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Row } from "editor/ui/Row";
import VerticalSpace from "editor/ui/VerticalSpace";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { Fragment } from "react";
import {
  getEmptyNode,
  getHasProblem,
  MULTIPLE_PARENT_NODES,
  TIGHT_CHILD_NODES,
} from "../sqliteNodes";
import { useEditorConfig } from "../sqliteState";

export default function SqliteNodeUI({ hideControls, type, children }) {
  return (
    <NodeUI
      hideControls={hideControls}
      type={type}
      useControls={useControls}
      useHasProblem={useHasProblem}
    >
      {children}
    </NodeUI>
  );
}

function useControls() {
  const appState = useAppStateDataContext();
  if (Nodes.countSelected(appState) > 2) {
    return null;
  }

  const twoSelected = Nodes.countSelected(appState) === 2;
  const joinable =
    twoSelected &&
    !Nodes.haveSameTightRoot(appState, ...Nodes.selected(appState));
  if (twoSelected && !joinable) {
    return null;
  }
  return joinable ? (
    <Row>
      <AddMultipleParentStepButtons />
    </Row>
  ) : (
    <Column>
      <Row>
        <AddTightChildStepButtons />
      </Row>
      <VerticalSpace />
      <Row>
        <AddMultipleParentStepButtons />
      </Row>
    </Column>
  );
}

function useHasProblem() {
  const appState = useAppStateDataContext();
  const editorConfig = useEditorConfig();
  const node = useNode();
  return getHasProblem({ ...appState, editorConfig }, node);
}

function AddTightChildStepButtons() {
  return (
    <>
      {Arrays.map(TIGHT_CHILD_NODES, ({ label }, type) => (
        <Fragment key={type}>
          <AddNodeButton onAdd={addQueryStep(type)}>{label}</AddNodeButton>
          <HorizontalSpace />
        </Fragment>
      ))}
    </>
  );
}

export function addQueryStep(type) {
  return addTightNode(getEmptyNode(type));
}

function AddMultipleParentStepButtons() {
  return (
    <>
      {Arrays.map(MULTIPLE_PARENT_NODES, ({ label }, type) => (
        <Fragment key={type}>
          <AddNodeButton onAdd={addDetachedNode(getEmptyNode(type))}>
            {label}
          </AddNodeButton>
          <HorizontalSpace />
        </Fragment>
      ))}
    </>
  );
}

export function AddFromNodeButton() {
  return (
    <AddNodeButton onAdd={addStandaloneNode(getEmptyNode("from"))}>
      FROM
    </AddNodeButton>
  );
}
