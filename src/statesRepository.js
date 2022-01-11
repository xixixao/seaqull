export const SQLITE_ACTORS = [
  [{ id: "0", type: "from", data: { name: "actor" } }],
  [{ x: 40, y: 30 }],
  [],
];

export const SQLITE_ACTORS_IN_FILM = [
  [
    { id: "0", type: "from", data: { name: "actor" } },
    { id: "1", data: { name: "casting" }, type: "from" },
    {
      id: "2",
      data: { filters: "a.actor_id = b.actor_id" },
      type: "join",
    },
    { id: "3", data: { name: "film" }, type: "from" },
  ],
  [
    { x: 40, y: 30 },
    { x: 241, y: 30 },
    { x: 379, y: 58 },
    { x: 633, y: 30 },
  ],
  [
    { id: "e02", parentID: "0", childID: "2" },
    { id: "e12", parentID: "1", childID: "2" },
  ],
];

export const SQLITE_ACTORS_PER_FILM = [
  [
    { id: "0", type: "from", data: { name: "actor" } },
    { id: "1", data: { name: "casting" }, type: "from" },
    {
      id: "2",
      data: { filters: "a.actor_id = b.actor_id" },
      type: "join",
    },
    { id: "3", data: { name: "film" }, type: "from" },
    {
      id: "4",
      data: { filters: "a.film_id = b.film_id" },
      type: "join",
    },
    {
      id: "5",
      data: {
        groupedColumns: new Set(["film_id"]),
        aggregations: [
          ["title", "MIN"],
          ["actor_id", "COUNT DISTINCT"],
        ],
      },
      type: "group",
    },
  ],
  [
    { x: 40, y: 30 },
    { x: 241, y: 30 },
    { x: 379, y: 58 },
    { x: 633, y: 30 },
    { x: 748, y: 86 },
    { x: 748, y: 114 },
  ],
  [
    { id: "e02", parentID: "0", childID: "2" },
    { id: "e12", parentID: "1", childID: "2" },
    { id: "e24", parentID: "2", childID: "4" },
    { id: "e34", parentID: "3", childID: "4" },
    { id: "e45", parentID: "4", childID: "5", type: "tight" },
  ],
];

export const SQLITE_FILMS_BY_FIRST_NAMES = [
  [
    { id: "0", type: "from", data: { name: "actor" } },
    { id: "1", data: { name: "casting" }, type: "from" },
    { id: "2", data: { selected: ["actor_id", "first_name"] }, type: "select" },
    { id: "3", data: { selected: ["actor_id", "film_id"] }, type: "select" },
    { id: "4", data: { filters: "a.actor_id = b.actor_id" }, type: "join" },
    {
      id: "5",
      data: {
        groupedColumns: new Set(["first_name"]),
        aggregations: [["film_id", "COUNT DISTINCT"]],
      },
      type: "group",
    },
    {
      id: "6",
      data: { columnToOrder: { count_distinct_film_id: "DESC" } },
      type: "order",
    },
  ],
  [
    {
      x: 39,
      y: 30,
    },
    {
      x: 336,
      y: 30,
    },
    {
      x: 39,
      y: 58,
    },
    {
      x: 336,
      y: 58,
    },
    {
      x: 543,
      y: 135,
    },
    {
      x: 959,
      y: 173,
    },
    {
      x: 959,
      y: 223,
    },
  ],
  [
    { id: "e02", parentID: "0", childID: "2", type: "tight" },
    { id: "e13", parentID: "1", childID: "3", type: "tight" },
    { id: "e24", parentID: "2", childID: "4" },
    { id: "e34", parentID: "3", childID: "4" },
    { id: "e45", parentID: "4", childID: "5", type: null },
    { id: "e56", parentID: "5", childID: "6", type: "tight" },
  ],
];

export const SQLITE_FILMS_OF_MOST_POPULAR_FIRST_NAME = [
  [
    { id: "0", type: "from", data: { name: "actor" } },
    { id: "1", data: { name: "casting" }, type: "from" },
    { id: "2", data: { selected: ["actor_id", "first_name"] }, type: "select" },
    { id: "3", data: { selected: ["actor_id", "film_id"] }, type: "select" },
    { id: "4", data: { filters: "a.actor_id = b.actor_id" }, type: "join" },
    {
      id: "5",
      data: {
        groupedColumns: new Set(["first_name"]),
        aggregations: [["film_id", "COUNT DISTINCT"]],
      },
      type: "group",
    },
    {
      id: "6",
      data: { columnToOrder: { count_distinct_film_id: "DESC" } },
      type: "order",
    },
    { id: "7", data: { filters: "first_name = 'Kenneth'" }, type: "where" },
    {
      id: "8",
      data: { groupedColumns: new Set(["film_id"]), aggregations: [] },
      type: "group",
    },
    { id: "9", data: { name: "film" }, type: "from" },
    { id: "10", data: { selected: ["film_id", "title"] }, type: "select" },
    { id: "11", data: { filters: "a.film_id = b.film_id" }, type: "join" },
    { id: "12", data: { selected: ["title"] }, type: "select" },
  ],
  [
    { x: 39, y: 30 },
    { x: 336, y: 30 },
    { x: 39, y: 58 },
    { x: 336, y: 58 },
    { x: 543, y: 135 },
    { x: 959, y: 173 },
    { x: 959, y: 223 },
    { x: 543, y: 163 },
    { x: 543, y: 191 },
    { x: 750, y: 211 },
    { x: 750, y: 239 },
    { x: 927, y: 323 },
    { x: 927, y: 351 },
  ],
  [
    { id: "e02", parentID: "0", childID: "2", type: "tight" },
    { id: "e13", parentID: "1", childID: "3", type: "tight" },
    { id: "e24", parentID: "2", childID: "4" },
    { id: "e34", parentID: "3", childID: "4" },
    { id: "e45", parentID: "4", childID: "5", type: null },
    { id: "e56", parentID: "5", childID: "6", type: "tight" },
    { id: "e47", parentID: "4", childID: "7", type: "tight" },
    { id: "e78", parentID: "7", childID: "8", type: "tight" },
    { id: "e910", parentID: "9", childID: "10", type: "tight" },
    { id: "e811", parentID: "8", childID: "11" },
    { id: "e1011", parentID: "10", childID: "11" },
    { id: "e1112", parentID: "11", childID: "12", type: "tight" },
  ],
];
