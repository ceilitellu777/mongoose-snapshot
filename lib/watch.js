const mongoose = require("mongoose");
const { onCreate, onRemove, onUpdate } = require("./cr.u.d");

const watch = function (schema, options) {
  onCreate(schema);
  onRemove(schema);
  onUpdate(schema);
};

module.exports = {
  watch,
};
