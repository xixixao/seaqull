import { SQLite } from "@codemirror/lang-sql";
import * as Arrays from "js/Arrays";

export function joinList(list, original) {
  return (
    list.join("," + (/\n/.test(original) ? "\n" : " ")) +
    (/,\s*$/.test(original) ? "," : "")
  );
}

export function stripTrailingComma(string) {
  return string.replace(/,\s*$/, "");
}

export function aliasedToExpression([expression, alias]) {
  return alias != null ? `${expression} AS ${alias}` : expression;
}

export function aliasedToSelectable([expression, alias]) {
  const name = aliasedToName([expression, alias]);
  return name === expression ? name : `${expression} AS ${name}`;
}

export function aliasedToName([expression, alias]) {
  return alias != null
    ? alias
    : /^\w+$/.test(expression)
    ? expression
    : expression.replace(/\W+/g, " ").trim().replace(/\s+/, "_").toLowerCase();
}

export function expressionList(expressions) {
  return aliasedExpressionList(expressions).map(Arrays.first);
}

export function aliasedExpressionList(expressions) {
  // if
  let list = [];
  const cursor = SQLite.language.parser.parse(expressions).cursor();
  cursor.firstChild();
  cursor.firstChild();
  if (cursor.name === "Script") {
    return list;
  }
  let expression = "";
  let alias = null;
  do {
    // TODO: Don't lose comments
    if (cursor.name === "LineComment" || cursor.name === "BlockComment") {
      continue;
    }
    if (cursor.name === "Keyword" && /^as$/i.test(at(cursor, expressions))) {
      cursor.nextSibling();
      alias = at(cursor, expressions);
      continue;
    }
    if (cursor.name === "Punctuation") {
      list.push([expression, alias]);
      expression = "";
      alias = null;
      if (!cursor.nextSibling()) {
        break;
      }
    }
    if (expression !== "" && expressions[cursor.from - 1] === " ") {
      expression += " ";
    }
    expression += at(cursor, expressions);
  } while (cursor.nextSibling());
  if (expression !== "") {
    list.push([expression, alias]);
  }
  return list;
}

function at(cursor, text, inset = 0) {
  return text.substring(cursor.from + inset, cursor.to - inset);
}
