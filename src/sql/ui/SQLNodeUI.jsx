import { PlusIcon, UpdateIcon } from "@modulz/radix-icons";
import {
  addDetachedNode,
  AddNodeButton,
  AddNodeButtonWithKeyBinding,
  addStandaloneNode,
  addTightNode,
  replaceDetachedNode,
  replaceTightNode,
} from "seaqull/AddNodeButton";
import NodeUI from "seaqull/NodeUI";
import { useNode } from "seaqull/react-flow/components/Nodes/wrapNode";
import {
  useAppGraphAndSelectionContext,
  useAppModesContext,
} from "seaqull/state";
import { Column } from "ui/layout/Column";
import HorizontalSpace from "ui/layout/HorizontalSpace";
import { Row } from "ui/layout/Row";
import VerticalSpace from "ui/layout/VerticalSpace";
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

export default function SQLNodeUI({ hideControls, parentLimit, children }) {
  const node = useNode();
  const config = useNodeConfig(node);
  const hasProblem = config.useHasProblem?.(node);
  const useControls = config.useControls ?? useNoControls;
  return (
    <NodeUI
      hasProblem={hasProblem}
      hideControls={hideControls}
      parentLimit={parentLimit}
      useControls={useControls}
    >
      {children}
    </NodeUI>
  );
}

function useNoControls() {
  return null;
}

export function useStandardControls(node) {
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
          {/* TODO: Many places in the app should use grid instead of flex,
          to simplify spacing between items, gap could be used for flex
          now too but its fairly new in Chrome */}
          <Row>
            <TightChildStepButtons
              icon={shouldReplace ? <UpdateIcon /> : <PlusIcon />}
              action={shouldReplace ? replaceTightNode : addTightNode}
            />
          </Row>
          <VerticalSpace />
          {shouldReplace ? null : (
            <Row>
              <AddChart />
            </Row>
          )}
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
      {Arrays.map(TIGHT_CHILD_NODES, ({ label, key }, type) => (
        <Fragment key={type}>
          <AddNodeButtonWithKeyBinding
            keyBinding={key}
            icon={icon}
            onAdd={action(getEmptyNode({ nodeConfigs }, type))}
          >
            {label}
          </AddNodeButtonWithKeyBinding>
          <HorizontalSpace />
        </Fragment>
      ))}
    </>
  );
}

function AddChart() {
  const nodeConfigs = useNodeConfigs();
  return (
    <AddNodeButtonWithKeyBinding
      keyBinding="c"
      icon={<PlusIcon />}
      onAdd={addTightNode(getEmptyNode({ nodeConfigs }, "chart"))}
    >
      Chart
    </AddNodeButtonWithKeyBinding>
  );
}

function MultipleParentStepButtons({ action, icon }) {
  const nodeConfigs = useNodeConfigs();
  return (
    <>
      {Arrays.map(MULTIPLE_PARENT_NODES, ({ label, key }, type) => (
        <Fragment key={type}>
          <AddNodeButtonWithKeyBinding
            keyBinding={key}
            icon={icon}
            onAdd={action(getEmptyNode({ nodeConfigs }, type))}
          >
            {label}
          </AddNodeButtonWithKeyBinding>
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

function isShouldReplaceMode(modes) {
  return modes.alt;
}
