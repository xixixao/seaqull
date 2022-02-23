import { PlusIcon } from "@modulz/radix-icons";
import * as Nodes from "graph/Nodes";
import * as Edges from "graph/Edges";
import { useNodeUIProps } from "./react-flow/components/Nodes/wrapNode";
import { useAppGraphContext } from "./state";
import { styled } from "./style";
import FloatOnHover from "./ui/FloatOnHover";
import { IconButton } from "./ui/IconButton";
import { Handle } from "./react-flow/components/Handle";

export default function NodeUI({
  hasProblem,
  hideControls,
  parentLimit,
  useControls,
  children,
}) {
  const node = useNodeUIProps();
  const { connectingHandleID } = node;
  const appState = useAppGraphContext();
  const parentCount = Edges.parents(appState, node).length;
  const parentEdges = Edges.parentsOrdered(appState, node);
  return (
    <>
      <NodeWrapper
        isHighlighted={node.highlight}
        isSelected={node.selected}
        wasSelected={
          !node.selected && !node.isAnySelected && node.wasOnlySelected
        }
        hasProblem={hasProblem}
        // hasTightChild={Nodes.hasTightChild(appState, node)}
        // hasTightParent={Nodes.hasTightParent(appState, node)}
      >
        {children}
        {parentLimit === 0 ? null : parentLimit === 1 ? (
          <Handle
            isConnectable={parentCount < 1 && connectingHandleID == null}
            position="left"
            type="target"
          />
        ) : (
          <>
            <Handle
              id="0"
              isConnectable={
                parentEdges[0] == null && connectingHandleID !== "0"
              }
              style={{ top: "8px" }}
              position="left"
              type="target"
            />
            <Handle
              id="1"
              isConnectable={
                parentEdges[1] == null && connectingHandleID !== "1"
              }
              style={{ top: "calc(100% - 7px)" }}
              position="left"
              type="target"
            />
          </>
        )}
        <Handle type="source" position="right" />
      </NodeWrapper>
      {/* <Box
        css={{
          position: "absolute",
          left: "100%",
          top: "100%",
          transform: "translate(-100%, -30%)",
        }}
      >
        {Node.label(node)}
      </Box> */}
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
    </>
  );
}

function NodeUIControls({ hideControls, useControls }) {
  const node = useNodeUIProps();
  const appState = useAppGraphContext();
  const controls = useControls(node);
  if (controls == null || node.edited || node.isDragging) {
    return null;
  }

  const isSelected = node.selected;
  const isLast = !Nodes.hasTightChild(appState, node);

  const controlsPositioned = (
    <div
      className="nodrag"
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
      className="nodrag"
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
  ".react-flow__handle-connecting &": {
    borderBottomColor: "$amber9",
  },
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
