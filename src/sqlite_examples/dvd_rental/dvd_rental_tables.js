import filmURL from "./tables/film.dat?url";
import actorURL from "./tables/actor.dat?url";
import castingURL from "./tables/casting.dat?url";

export const DVD_RENTAL_TABLES = [
  [
    "film",
    `film_id integer,
title VARCHAR(255),
description text,
release_year INTEGER,
language_id smallint,
rental_duration smallint,
rental_rate numeric,
length smallint,
replacement_cost numeric,
rating TEXT,
last_update DATETIME${
      // special_features text[],
      // fulltext tsvector
      ""
    }`,
    filmURL,
  ],
  [
    "actor",
    `actor_id integer,
first_name TEXT,
last_name TEXT,
last_update DATETIME`,
    actorURL,
  ],
  [
    "casting",
    `actor_id integer,
film_id integer,
last_update DATETIME`,
    castingURL,
  ],
];
