const mongoose = require("mongoose");
const { createHistoryModel } = require("../db/schema");
const { ProcessConfig } = require("../configs/config");

let historyModels = [];

const watch = function (schema, options) {
  // code goes here
};

module.exports = {
  watch,
};
