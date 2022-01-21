import { sql, SQLite, StandardSQL } from "@codemirror/lang-sql";
import { LanguageSupport, syntaxTree } from "@codemirror/language";
import Input from "editor/Input";
import { useAppStateContext } from "editor/state";
import { useMemo } from "react";
import * as Objects from "js/Objects";

export default function SqliteInput(props) {
  const { editorConfig } = useAppStateContext();
  const extensions = useMemo(() => {
    return [
      sql({
        dialect: SQLite,
        schema: editorConfig.schema,
        upperCaseKeywords: true,
      }),
    ];
  }, [editorConfig]);
  return <Input {...props} extensions={extensions} />;
}

// function sql(config = {}) {
//   let lang = config.dialect || StandardSQL;
//   return new LanguageSupport(lang.language, [schemaCompletion(config)]);
// }

// function schemaCompletion(config) {
//   return config.schema
//     ? (config.dialect || StandardSQL).language.data.of({
//         autocomplete: completeFromSchema(
//           config.schema,
//           config.tables,
//           config.defaultTable
//         ),
//       })
//     : [];
// }
