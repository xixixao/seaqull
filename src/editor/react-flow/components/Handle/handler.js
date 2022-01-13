import { getHostForElement } from "../../utils";
import { ConnectionMode } from "../../types";
// checks if element below mouse is a handle and returns connection in form of an object { source: 123, target: 312 }
function checkElementBelowIsValid(
  event,
  connectionMode,
  isTarget,
  nodeId,
  handleId,
  isValidConnection,
  doc
) {
  // TODO: why does this throw an error? elementFromPoint should be available for ShadowRoot too
  // @ts-ignore
  const elementBelow = doc.elementFromPoint(event.clientX, event.clientY);
  const elementBelowIsTarget =
    elementBelow?.classList.contains("target") || false;
  const elementBelowIsSource =
    elementBelow?.classList.contains("source") || false;
  const result = {
    elementBelow,
    isValid: false,
    connection: {
      source: null,
      target: null,
      sourceHandle: null,
      targetHandle: null,
    },
    isHoveringHandle: false,
  };
  if (elementBelow && (elementBelowIsTarget || elementBelowIsSource)) {
    result.isHoveringHandle = true;
    // in strict mode we don't allow target to target or source to source connections
    const isValid =
      connectionMode === ConnectionMode.Strict
        ? (isTarget && elementBelowIsSource) ||
          (!isTarget && elementBelowIsTarget)
        : true;
    if (isValid) {
      const elementBelowNodeId = elementBelow.getAttribute("data-nodeid");
      const elementBelowHandleId = elementBelow.getAttribute("data-handleid");
      const connection = isTarget
        ? {
            source: elementBelowNodeId,
            sourceHandle: elementBelowHandleId,
            target: nodeId,
            targetHandle: handleId,
          }
        : {
            source: nodeId,
            sourceHandle: handleId,
            target: elementBelowNodeId,
            targetHandle: elementBelowHandleId,
          };
      result.connection = connection;
      result.isValid = isValidConnection(connection);
    }
  }
  return result;
}
function resetRecentHandle(hoveredHandle) {
  hoveredHandle?.classList.remove("react-flow__handle-valid");
  hoveredHandle?.classList.remove("react-flow__handle-connecting");
}
export function onMouseDown(
  event,
  handleId,
  nodeId,
  setConnectionNodeId,
  setPosition,
  onConnect,
  isTarget,
  isValidConnection,
  connectionMode,
  elementEdgeUpdaterType,
  onEdgeUpdateEnd,
  onConnectStart,
  onConnectStop,
  onConnectEnd
) {
  const reactFlowNode = event.target.closest(".react-flow");
  // when react-flow is used inside a shadow root we can't use document
  const doc = getHostForElement(event.target);
  if (!doc) {
    return;
  }
  // @ts-ignore
  const elementBelow = doc.elementFromPoint(event.clientX, event.clientY);
  const elementBelowIsTarget = elementBelow?.classList.contains("target");
  const elementBelowIsSource = elementBelow?.classList.contains("source");
  if (
    !reactFlowNode ||
    (!elementBelowIsTarget && !elementBelowIsSource && !elementEdgeUpdaterType)
  ) {
    return;
  }
  const handleType = elementEdgeUpdaterType
    ? elementEdgeUpdaterType
    : elementBelowIsTarget
    ? "target"
    : "source";
  const containerBounds = reactFlowNode.getBoundingClientRect();
  let recentHoveredHandle;
  setPosition({
    x: event.clientX - containerBounds.left,
    y: event.clientY - containerBounds.top,
  });
  setConnectionNodeId({
    connectionNodeId: nodeId,
    connectionHandleId: handleId,
    connectionHandleType: handleType,
  });
  onConnectStart?.(event, { nodeId, handleId, handleType });
  function onMouseMove(event) {
    setPosition({
      x: event.clientX - containerBounds.left,
      y: event.clientY - containerBounds.top,
    });
    const { connection, elementBelow, isValid, isHoveringHandle } =
      checkElementBelowIsValid(
        event,
        connectionMode,
        isTarget,
        nodeId,
        handleId,
        isValidConnection,
        doc
      );
    if (!isHoveringHandle) {
      return resetRecentHandle(recentHoveredHandle);
    }
    const isOwnHandle = connection.source === connection.target;
    if (!isOwnHandle && elementBelow) {
      recentHoveredHandle = elementBelow;
      elementBelow.classList.add("react-flow__handle-connecting");
      elementBelow.classList.toggle("react-flow__handle-valid", isValid);
    }
  }
  function onMouseUp(event) {
    const { connection, isValid } = checkElementBelowIsValid(
      event,
      connectionMode,
      isTarget,
      nodeId,
      handleId,
      isValidConnection,
      doc
    );
    onConnectStop?.(event);
    if (isValid) {
      onConnect?.(connection);
    }
    onConnectEnd?.(event);
    if (elementEdgeUpdaterType && onEdgeUpdateEnd) {
      onEdgeUpdateEnd(event);
    }
    resetRecentHandle(recentHoveredHandle);
    setConnectionNodeId({
      connectionNodeId: null,
      connectionHandleId: null,
      connectionHandleType: null,
    });
    doc.removeEventListener("mousemove", onMouseMove);
    doc.removeEventListener("mouseup", onMouseUp);
  }
  doc.addEventListener("mousemove", onMouseMove);
  doc.addEventListener("mouseup", onMouseUp);
}
