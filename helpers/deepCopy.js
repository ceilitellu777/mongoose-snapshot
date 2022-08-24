// --------------------- unachieved algorithm and not used function ----------------------------------s

const deepCopy = (source, transferrable) => {
  Object.keys(source).forEach((sourceKey) => {
    if (Object.keys(transferrable).find((trKey) => trKey === sourceKey)) {
    }
  });
};

module.exports = deepCopy;
