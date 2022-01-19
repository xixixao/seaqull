import { sql } from "@codemirror/lang-sql";
import Input from "editor/Input";
import { useAppStateContext } from "editor/state";
import { useMemo } from "react";

export default function SqliteInput(props) {
  const { editorConfig } = useAppStateContext();
  const extensions = useMemo(() => {
    return [
      sql({
        schema: editorConfig.schema(),
      }),
    ];
  }, [editorConfig]);
  return <Input {...props} extensions={extensions} />;
}
