const { appLogger } = require("../../../utils/logs");

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
