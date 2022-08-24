/**
 * This is a function implementing the object deep compare algorithm
 * @param {Object} toCompare The base Object of comparison
 * @param {Object} object The other object of reference
 */
const objectKeysCompare = (toCompare, object) => {
  let objDiffs = {};

  Object.keys(toCompare).forEach((objKey) => {
    if (toCompare[objKey] !== object[objKey]) {
      objDiffs[objKey] = toCompare[objKey];
    }
  });

  return objDiffs;
};

module.exports = {
  objectKeysCompare,
};
