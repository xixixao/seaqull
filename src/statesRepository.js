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
