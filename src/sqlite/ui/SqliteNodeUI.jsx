import {
  addDetachedNode,
  AddNodeButton,
  addStandaloneNode,
  addTightNode,
} from "editor/AddNodeButton";
import NodeUI from "editor/NodeUI";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import {
  AppStateContext,
  useAppModesContext,
  useAppStateDataContext,
} from "editor/state";
import { Column } from "editor/ui/Column";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Row } from "editor/ui/Row";
import VerticalSpace from "editor/ui/VerticalSpace";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { useContext } from "react";
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

function useControls(node) {
  const appState = useAppStateDataContext();
  const modes = useAppModesContext();
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
  const isTightChild = TIGHT_CHILD_NODES.has(node.type);
  const isDetachedChild = MULTIPLE_PARENT_NODES.has(node.type);
  return joinable ? (
    <Row>
      <AddMultipleParentStepButtons />
    </Row>
  ) : (
    <Column>
      {!modes.alt || isTightChild ? (
        <>
          <Row>
            <AddTightChildStepButtons />
          </Row>
          <VerticalSpace />
        </>
      ) : null}
      {
        /* TODO support: `!modes.alt || isDetachedChild` */
        modes.alt && isDetachedChild ? (
          <Row>
            <AddMultipleParentStepButtons />
          </Row>
        ) : null
      }
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
