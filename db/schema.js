const mongoose = require("mongoose");

const createHistoryModel = (schemaName) => {
  let modelSchema = new mongoose.Schema({
    timestamp: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    modifs: {
      create: {
        type: mongoose.Schema.Types.Boolean,
        required: false,
      },
      remove: {
        type: mongoose.Schema.Types.Boolean,
        required: true,
      },
      update: {
        type: mongoose.Schema.Types.String,
        required: true,
      },
    },
  });

  let model = mongoose.model(`${schemaName}_History`, modelSchema);

  return model;
};

module.exports = {
  createHistoryModel,
};
