import renderEditor from "./editor/renderEditor";
import sqliteLanguage from "./sqlite/sqliteLanguage";
import { SQLITE_ACTORS_PER_FILM } from "./sqlite_examples/dvd_rental/dvd_rental_saves";
import { DVD_RENTAL_TABLES } from "./sqlite_examples/dvd_rental/dvd_rental_tables";

renderEditor(sqliteLanguage(DVD_RENTAL_TABLES, SQLITE_ACTORS_PER_FILM));
