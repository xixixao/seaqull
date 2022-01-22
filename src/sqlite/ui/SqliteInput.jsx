import { schemaCompletion, SQLite } from "@codemirror/lang-sql";
import { LanguageSupport } from "@codemirror/language";
import Input from "editor/Input";
import { useMemo } from "react";
import { useEditorConfig } from "../sqliteState";

export default function SqliteInput(props) {
  const { schema } = useEditorConfig();
  const extensions = useMemo(() => {
    return [
      sql({
        dialect: SQLite,
        schema,
      }),
    ];
  }, [schema]);
  return <Input {...props} extensions={extensions} />;
}

// Dont suggest keywords, there are too many
function sql(config) {
  return new LanguageSupport(config.dialect.language, [
    schemaCompletion(config),
  ]);
}
