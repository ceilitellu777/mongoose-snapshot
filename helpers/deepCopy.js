// --------------------- unachieved algorithm and not used function ----------------------------------s

/**
 * This is a function implementing the object merging algorithm based on the propoerty names and levels
 * @param {Object} source The base Object, where we merge all the *args
 * @param {Object} transferrable The object to merge
 */
const deepCopy = (source, transferrable) => {
  Object.keys(source).forEach((sourceKey) => {
    if (Object.keys(transferrable).find((trKey) => trKey === sourceKey)) {
    }
  });
};

module.exports = deepCopy;
