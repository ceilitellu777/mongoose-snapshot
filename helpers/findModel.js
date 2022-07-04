const { ProcessConfig } = require("../configs/config");
const mongoose = require("mongoose");

const findModel = (modelName) => {
  let diffsDocKey = Object.keys(mongoose.models).find(
    (modelKey) => modelKey === modelName + ProcessConfig.getHMSuffix()
  );

  let DiffsModel = mongoose.models[diffsDocKey];

  return DiffsModel;
};

module.exports = {
  findModel,
};
