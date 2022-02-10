import { PlusIcon, UpdateIcon } from "@modulz/radix-icons";
import {
  addDetachedNode,
  AddNodeButton,
  addStandaloneNode,
  addTightNode,
  replaceDetachedNode,
  replaceTightNode,
} from "editor/AddNodeButton";
import NodeUI from "editor/NodeUI";
import { useNode } from "editor/react-flow/components/Nodes/wrapNode";
import { useAppModesContext, useAppStateDataContext } from "editor/state";
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
  const shouldReplace = isShouldReplaceMode(modes);
  return joinable ? (
    <Row>
      <MultipleParentStepButtons icon={<PlusIcon />} action={addDetachedNode} />
    </Row>
  ) : (
    <Column>
      {!shouldReplace || isTightChild ? (
        <>
          <Row>
            <TightChildStepButtons
              icon={shouldReplace ? <UpdateIcon /> : <PlusIcon />}
              action={shouldReplace ? replaceTightNode : addTightNode}
            />
          </Row>
          <VerticalSpace />
        </>
      ) : null}
      {
        /* TODO support: `!shouldReplace || isDetachedChild` */
        shouldReplace && isDetachedChild ? (
          <Row>
            <MultipleParentStepButtons
              icon={<UpdateIcon />}
              action={replaceDetachedNode}
            />
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

export function addOrReplaceQueryStep(appState, type) {
  return (
    isShouldReplaceMode(appState.modes) ? replaceTightNode : addTightNode
  )(getEmptyNode(type))(appState);
}

function TightChildStepButtons({ action, icon }) {
  return (
    <>
      {Arrays.map(TIGHT_CHILD_NODES, ({ label }, type) => (
        <Fragment key={type}>
          <AddNodeButton icon={icon} onAdd={action(getEmptyNode(type))}>
            {label}
          </AddNodeButton>
          <HorizontalSpace />
        </Fragment>
      ))}
    </>
  );
}

function MultipleParentStepButtons({ action, icon }) {
  return (
    <>
      {Arrays.map(MULTIPLE_PARENT_NODES, ({ label }, type) => (
        <Fragment key={type}>
          <AddNodeButton icon={icon} onAdd={action(getEmptyNode(type))}>
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
    <AddNodeButton
      icon={<PlusIcon />}
      onAdd={addStandaloneNode(getEmptyNode("from"))}
    >
      FROM
    </AddNodeButton>
  );
}

function isShouldReplaceMode(modes) {
  return modes.alt;
}
