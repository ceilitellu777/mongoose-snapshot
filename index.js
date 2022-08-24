const mongoose = require("mongoose");
const { createHistoryModel } = require("./db/schema");
const { ProcessConfig } = require("../mongo-snapshot/configs/config");

const init = async (initOptions) => {
  console.info("Initializing the mongo-snapshot plugin");

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
