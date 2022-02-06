import { schemaCompletion, SQLite } from "@codemirror/lang-sql";
import { LanguageSupport } from "@codemirror/language";
import Input from "editor/Input";

export default function SqliteInput({ schema, ...props }) {
  return (
    <Input
      {...props}
      extensions={[
        sql({
          dialect: SQLite,
          schema,
        }),
      ]}
    />
  );
}

// Dont suggest keywords, there are too many
function sql(config) {
  return new LanguageSupport(config.dialect.language, [
    schemaCompletion(config),
  ]);
}
