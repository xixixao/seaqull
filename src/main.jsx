import render from "./editor/renderEditor";
import SQLiteLanguage from "./sqlite/SQLiteLanguage";
import { SQLITE_ACTORS_PER_FILM } from "./sqlite_examples/dvd_rental/dvd_rental_saves";
import { DVD_RENTAL_TABLES } from "./sqlite_examples/dvd_rental/dvd_rental_tables";

render(
  <SQLiteLanguage
    tables={DVD_RENTAL_TABLES}
    snapshot={SQLITE_ACTORS_PER_FILM}
  />
);
