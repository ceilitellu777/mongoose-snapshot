const mongoose = require("mongoose");

class ProcessConfig {
  static SYNCHRONIZED_MODELS = true;

  static getSynchronizedModelValue() {
    return this.SYNCHRONIZED_MODELS;
  }

  static setSynchronizedModelValue(value) {
    this.SYNCHRONIZED_MODELS = value;
  }
}

module.exports = {
  ProcessConfig,
};
