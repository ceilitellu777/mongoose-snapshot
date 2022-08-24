const { ProcessConfig } = require("../configs/config");
const mongoose = require("mongoose");

/**
 * The function used to find an history model name based a given model name
 * @param {String} modelName The name of the mongoose model for corresponding history model look-up
 * @returns {Object} The model of version differencies reords for the given model
 */
const findHmModel = (modelName) => {
  let diffsDocKey = Object.keys(mongoose.models).find(
    (modelKey) => modelKey === modelName + ProcessConfig.getHMSuffix()
  );

  let DiffsModel = mongoose.models[diffsDocKey];

  return DiffsModel;
};

module.exports = {
  findHmModel,
};
