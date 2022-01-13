import { PlusIcon } from "@modulz/radix-icons";
import * as Nodes from "graph/Nodes";
import * as Node from "graph/Node";
import { Handle } from "./react-flow";
import { useAppStateContext } from "./state";
import { styled } from "./style";
import { Box } from "./ui/Box";
import FloatOnHover from "./ui/FloatOnHover";
import { IconButton } from "./ui/IconButton";
import { Row } from "./ui/Row";

export default function NodeUI({ node, showTools, children, useAddButtons }) {
  const appState = useAppStateContext();
  return (
    <div>
      <NodeWrapper isHighlighted={node.highlight} isSelected={node.selected}>
        {children}
        <Handle
          style={visibleIf(Nodes.hasDetachedParents(appState, node))}
          type="target"
          position="left"
        />
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
      {node.isDragging ? null : (
        <NodeUIAddButtons
          node={node}
          showTools={showTools}
          useAddButtons={useAddButtons}
        />
      )}

      {/* <HorizontalSpace /> */}
      {/* <DeleteNodeButton node={node} /> */}
      {/* {isSelected && showTools ? (
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

function NodeUIAddButtons({ node, showTools, useAddButtons }) {
  const appState = useAppStateContext();
  const buttons = useAddButtons(node);
  if (buttons == null) {
    return null;
  }

  const isSelected = node.selected;
  const isLast = !Nodes.hasTightChildren(appState, node);

  const addChildrenButtonsPositioned = (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        // transform: "translate(0, -50%)",
        // width: 340,
      }}
    >
      <Row>{buttons}</Row>
    </div>
  );
  return !(showTools ?? true) || !isSelected ? null : isLast ? (
    addChildrenButtonsPositioned
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
      {addChildrenButtonsPositioned}
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
    isHighlighted: {
      true: {
        borderBottomColor: "$amber9",
      },
    },
  },
  // margin: "0 4px 2px 0",
});
