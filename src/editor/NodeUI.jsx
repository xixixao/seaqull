import { PlusIcon } from "@modulz/radix-icons";
import * as Node from "graph/Node";
import * as Nodes from "graph/Nodes";
import { Handle } from "./react-flow";
import { useNode } from "./react-flow/components/Nodes/wrapNode";
import { useAppStateDataContext } from "./state";
import { styled } from "./style";
import { Box } from "./ui/Box";
import FloatOnHover from "./ui/FloatOnHover";
import { IconButton } from "./ui/IconButton";
import { Row } from "./ui/Row";

export default function NodeUI({
  hideControls,
  children,
  type,
  useControls,
  useHasProblem,
}) {
  const node = useNode();
  const hasProblem = useHasProblem();
  const appState = useAppStateDataContext();
  return (
    <div>
      <NodeWrapper
        isHighlighted={node.highlight}
        isSelected={node.selected}
        wasSelected={
          !node.selected && !Nodes.isSelecting(appState) && node.wasOnlySelected
        }
        hasProblem={hasProblem}
        // hasTightChild={Nodes.hasTightChild(appState, node)}
        // hasTightParent={Nodes.hasTightParent(appState, node)}
      >
        {children}
        {type !== "output" ? (
          <Handle
            style={visibleIf(Nodes.hasDetachedParents(appState, node))}
            type="target"
            position="left"
          />
        ) : null}
        <Handle
          style={visibleIf(Nodes.hasDetachedChildren(appState, node))}
          type="source"
          position="right"
        />
      </NodeWrapper>
      <Box
        css={{
          position: "absolute",
          left: "100%",
          top: "100%",
          transform: "translate(-100%, -30%)",
        }}
      >
        {Node.label(node)}
      </Box>
      <NodeUIControls hideControls={hideControls} useControls={useControls} />
      {/* <HorizontalSpace /> */}
      {/* todo: use right click menu instead <DeleteNodeButton node={node} /> */}
      {/* {isSelected && hideControls ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 2,
              left: "100%",
              width: 300,
            }}
          >
            <HorizontalSpace />
            <AddConnectedFromNodeButon />
          </div>
          <div style={{ position: "absolute", top: "110%", width: 300 }}>
            <AddChildStepButtons />
          </div>
        </>
      ) : null} */}
    </div>
  );
}

function visibleIf(bool) {
  return { visibility: bool ? "visible" : "hidden" };
}

function NodeUIControls({ hideControls, useControls }) {
  const node = useNode();
  const appState = useAppStateDataContext();
  const controls = useControls(node);
  if (controls == null || node.edited || node.isDragging) {
    return null;
  }

  const isSelected = node.selected;
  const isLast = !Nodes.hasTightChild(appState, node);

  const controlsPositioned = (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        // transform: "translate(0, -50%)",
        // width: 340,
      }}
    >
      {controls}
    </div>
  );
  return (hideControls ?? false) || !isSelected ? null : isLast ? (
    controlsPositioned
  ) : (
    <FloatOnHover
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        transform: "translate(-100%, -50%)",
      }}
      trigger={
        <IconButton>
          <PlusIcon />
        </IconButton>
      }
    >
      {controlsPositioned}
    </FloatOnHover>
  );
}

const NodeWrapper = styled("div", {
  cursor: "move",
  // display: "inline-block",
  background: "$slate1",
  borderRadius: "8px",
  border: `1px solid $slate7`,
  // boxShadow: props.isSelected ? "0 0 0 0.5px #0041d0" : "none",
  // borderRadius: 4,
  // boxShadow: "rgb(201 204 209) 0px 0px 0px 1px",
  // background: props.isSelected ? "#e7f2fd" : "white",
  // boxSizing: "border-box",
  padding: "2px 8px",
  variants: {
    isSelected: {
      true: {
        borderColor: "$blue9",
        boxShadow: "0 0 0 0.5px $colors$blue9",
      },
    },
    wasSelected: {
      true: {
        borderColor: "$blue7",
        boxShadow: "0 0 0 0.5px $colors$blue7",
      },
    },
    isHighlighted: {
      true: {
        borderBottomColor: "$amber9",
      },
    },
    hasProblem: {
      true: {
        borderColor: "$red9",
        boxShadow: "0 0 0 0.5px $colors$red9",
      },
    },
    // hasTightParent: {
    //   true: {
    //     borderTopLeftRadius: 0,
    //   },
    // },
    // hasTightChild: {
    //   true: {
    //     borderBottomLeftRadius: 0,
    //   },
    // },
  },
  compoundVariants: [
    {
      isSelected: true,
      hasProblem: true,
      css: {
        borderColor: "$pink9",
        boxShadow: "0 0 0 0.5px $colors$pink9",
      },
    },
  ],
  // margin: "0 4px 2px 0",
});
