const mongoose = require("mongoose");

class ProcessConfig {
  static historyModelSuffix = "_History";
  static writeOpPurpose = "";

  static getHMSuffix() {
    return this.historyModelSuffix;
  }

  static setHMSuffix(value) {
    this.historyModelSuffix = value;
  }

  static getWriteOpPurpose() {
    return this.writeOpPurpose;
  }

  static setWriteOpPurpose(purpose) {
    this.writeOpPurpose = purpose;
  }
}

module.exports = {
  ProcessConfig,
};
