const mongoose = require("mongoose");

class ProcessConfig {
  static historyModelSuffix = "_History";
  static writeOpPurpose = "";
  static modelsCountIterator = 0;
  static historyLogsModelName = "HistoryLog";

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

  static getModelsCountIterator() {
    return this.modelsCountIterator;
  }

  static setModelsCountIterator(iteratorVal) {
    this.modelsCountIterator = iteratorVal;
  }

  static getHistoryLogsModelName() {
    return this.historyLogsModelName;
  }

  static setHistoryLogsModelName(logsName) {
    this.historyLogsModelName = logsName;
  }
}

module.exports = {
  ProcessConfig,
};
