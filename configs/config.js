const mongoose = require("mongoose");

class ProcessConfig {
  static historyModelSuffix = "_History";

  static getHMSuffix() {
    return this.historyModelSuffix;
  }

  static setHMSuffix(value) {
    this.historyModelSuffix = value;
  }
}

module.exports = {
  ProcessConfig,
};
