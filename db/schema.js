const mongoose = require("mongoose");

/**
 * Create an history mongoose model for every model having not an history model
 * @param {String} schemaName The name of the model schema
 * @param {String} modelCustomSuffix [Not required] The suffix used to assign the history model name. If not given, the default is used
 * @returns {Object} returns the new history model created
 */
const createHistoryModel = async (schemaName, modelCustomSuffix) => {
  let modelSchema = new mongoose.Schema({
    timestamp: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    ref: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    modifs: {
      create: {
        type: mongoose.Schema.Types.String,
        required: false,
        default: "",
      },
      remove: {
        type: mongoose.Schema.Types.Boolean,
        required: false,
        default: false,
      },
      update: {
        type: mongoose.Schema.Types.String,
        required: false,
        default: "",
      },
    },
    branch: {
      type: mongoose.Schema.Types.String,
      required: false,
      default: "master",
    },
  });

  let model = mongoose.model(
    `${schemaName}${modelCustomSuffix ? modelCustomSuffix : "_History"}`,
    modelSchema
  );

  return model;
};

module.exports = {
  createHistoryModel,
};
