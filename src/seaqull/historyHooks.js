import * as Nodes from "graph/Nodes";
import * as History from "seaqull/History";
import { useCallback } from "react";
import { useSetAppStateWithoutRecordingContext } from "./state";

export function useAppUndo() {
  const setAppStateWithoutRecording = useSetAppStateWithoutRecordingContext();
  return useCallback(() => {
    setAppStateWithoutRecording((appState) => {
      if (History.canUndo(appState)) {
        // TODO: Deselecting here is still not ideal,
        // ideally we only want to deselect if the undo would lead
        // to multi-selecting
        Nodes.select(appState, []);
        return History.undo(appState);
      }
    });
  }, [setAppStateWithoutRecording]);
}

export function useAppRedo() {
  const setAppStateWithoutRecording = useSetAppStateWithoutRecordingContext();
  return useCallback(() => {
    setAppStateWithoutRecording((appState) => {
      if (History.canRedo(appState)) {
        // TODO: Deselecting here is still not ideal,
        // ideally we only want to deselect if the redo would lead
        // to multi-selecting
        Nodes.select(appState, []);
        return History.redo(appState);
      }
    });
  }, [setAppStateWithoutRecording]);
}
