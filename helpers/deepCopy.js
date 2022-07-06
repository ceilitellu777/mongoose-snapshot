const deepCopy = (source, transferrable) => {
  Object.keys(source).forEach((sourceKey) => {
    if (Object.keys(transferrable).find((trKey) => trKey === sourceKey)) {
    }
  });
};
