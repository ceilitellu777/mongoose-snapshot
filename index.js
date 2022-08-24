const mongoose = require("mongoose");
const { createHistoryModel } = require("./db/schema");
const { ProcessConfig } = require("../mongo-snapshot/configs/config");

/**
 * The initialisation function executed on pluging the plugin globally to mongoose
 * @param {Object} initOptions The options object with the custom execution value like history model prefix etc.
 * @returns {Object} returns the new history model created
 */
const init = async (initOptions) => {
  mongoose.connection.on("connected", async () => {
    if (initOptions.historyModelSuffix)
      ProcessConfig.setHMSuffix(historyModelSuffix);

    if (initOptions?.historyLogsModelName)
      ProcessConfig.setHistoryLogsModelName(initOptions?.historyLogsModelName);

    let historyCollections = [];
    let collections = [];
    let collectionsNotRecorded = [];

    mongoose.modelNames()?.forEach((collName) => {
      if (collName !== ProcessConfig.getHistoryLogsModelName()) {
        if (
          collName?.includes(
            initOptions?.historyModelSuffix
              ? initOptions?.historyModelSuffix
              : "_History"
          )
        ) {
          historyCollections.push(collName);
        } else {
          collections?.push(collName);
        }
      }
    });

    if (!(historyCollections.length === collections?.length)) {
      collections.forEach((coll) => {
        if (!historyCollections.find((histColl) => histColl?.includes(coll))) {
          collectionsNotRecorded.push(coll);
        }
      });
    }

    collectionsNotRecorded.forEach((collectionNR) => {
      createHistoryModel(collectionNR, initOptions?.historyModelSuffix);
    });
  });
};

module.exports = init;
