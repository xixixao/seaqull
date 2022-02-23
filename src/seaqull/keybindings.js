import { keymap } from "@codemirror/view";

export function buildKeyMap(commands) {
  const keyMapFacetProvider = keymap.of(
    commands.map((command) => ({
      ...command,
      run: ({ value, event }) => command.run(value, event),
    }))
  );
  const runHandlers =
    keyMapFacetProvider.facet.extensions.fields[0].get().handlers.keydown;
  const state = { facet: () => keyMapFacetProvider.value };
  return (value, event) => runHandlers(event, { state, value, event });
}
