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
import {
  useAppGraphAndSelectionContext,
  useAppModesContext,
} from "editor/state";
import { Column } from "editor/ui/Column";
import HorizontalSpace from "editor/ui/HorizontalSpace";
import { Row } from "editor/ui/Row";
import VerticalSpace from "editor/ui/VerticalSpace";
import * as Nodes from "graph/Nodes";
import * as Arrays from "js/Arrays";
import { Fragment } from "react";
import { useNodeConfigs } from "../SQLNodeConfigsProvider";
import {
  getEmptyNode,
  MULTIPLE_PARENT_NODES,
  TIGHT_CHILD_NODES,
  useNodeConfig,
} from "../sqlNodes";

export default function SQLNodeUI({ hideControls, type, children }) {
  const node = useNode();
  const hasProblem = useNodeConfig(node).useHasProblem?.(node);
  return (
    <NodeUI
      hasProblem={hasProblem}
      hideControls={hideControls}
      type={type}
      useControls={useControls}
    >
      {children}
    </NodeUI>
  );
}

function useControls(node) {
  const appState = useAppGraphAndSelectionContext();
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

function TightChildStepButtons({ action, icon }) {
  const nodeConfigs = useNodeConfigs();
  return (
    <>
      {Arrays.map(TIGHT_CHILD_NODES, ({ label }, type) => (
        <Fragment key={type}>
          <AddNodeButton
            icon={icon}
            onAdd={action(getEmptyNode({ nodeConfigs }, type))}
          >
            {label}
          </AddNodeButton>
          <HorizontalSpace />
        </Fragment>
      ))}
    </>
  );
}

function MultipleParentStepButtons({ action, icon }) {
  const nodeConfigs = useNodeConfigs();
  return (
    <>
      {Arrays.map(MULTIPLE_PARENT_NODES, ({ label }, type) => (
        <Fragment key={type}>
          <AddNodeButton
            icon={icon}
            onAdd={action(getEmptyNode({ nodeConfigs }, type))}
          >
            {label}
          </AddNodeButton>
          <HorizontalSpace />
        </Fragment>
      ))}
    </>
  );
}

export function AddFromNodeButton() {
  const nodeConfigs = useNodeConfigs();
  return (
    <AddNodeButton
      icon={<PlusIcon />}
      onAdd={addStandaloneNode(getEmptyNode({ nodeConfigs }, "from"))}
    >
      FROM
    </AddNodeButton>
  );
}

const KEY_LOOKUP = new Map(
  Arrays.map(TIGHT_CHILD_NODES, ({ key }, type) => [key, type])
);

export function addNodeFromKey(nodeConfigs) {
  return (appState, event) => {
    const selectedNode = Arrays.only(Nodes.selected(appState));
    if (selectedNode == null) {
      return;
    }
    const type = KEY_LOOKUP.get(
      event.altKey ? event.code.substr(3, 1).toLowerCase() : event.key
    );
    if (type == null) {
      return;
    }
    return addOrReplaceQueryStep(appState, nodeConfigs, type);
  };
}

function addOrReplaceQueryStep(appState, nodeConfigs, type) {
  return (
    isShouldReplaceMode(appState.modes) ? replaceTightNode : addTightNode
  )(getEmptyNode({ nodeConfigs }, type))(appState);
}

function isShouldReplaceMode(modes) {
  return modes.alt;
}
