export function stringify(data) {
  return JSON.stringify(data, mapsAndSetsReplacer);
}

export function parse(string) {
  return JSON.parse(string, mapsAndSetsReviver);
}

const DATA_TYPE_FIELD = "$%^";

function mapsAndSetsReplacer(key, value) {
  if (value instanceof Map) {
    return {
      [DATA_TYPE_FIELD]: "Map",
      value: Array.from(value.entries()),
    };
  } else if (value instanceof Set) {
    return {
      [DATA_TYPE_FIELD]: "Set",
      value: Array.from(value.values()),
    };
  } else {
    return value;
  }
}

function mapsAndSetsReviver(key, value) {
  if (typeof value === "object" && value !== null) {
    if (value[DATA_TYPE_FIELD] === "Map") {
      return new Map(value.value);
    } else if (value[DATA_TYPE_FIELD] === "Set") {
      return new Set(value.value);
    }
  }
  return value;
}
