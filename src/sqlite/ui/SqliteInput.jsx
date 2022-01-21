import { schemaCompletion, SQLite } from "@codemirror/lang-sql";
import { LanguageSupport } from "@codemirror/language";
import Input from "editor/Input";
import { useAppStateContext } from "editor/state";
import { useMemo } from "react";

export default function SqliteInput(props) {
  const { editorConfig } = useAppStateContext();
  const extensions = useMemo(() => {
    return [
      sql({
        dialect: SQLite,
        schema: editorConfig.schema,
      }),
    ];
  }, [editorConfig]);
  return <Input {...props} extensions={extensions} />;
}

// Dont suggest keywords, there are too many
function sql(config) {
  return new LanguageSupport(config.dialect.language, [
    schemaCompletion(config),
  ]);
}
