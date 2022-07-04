const mongoose = require("mongoose");
const { createHistoryModel } = require("./db/schema");
const { ProcessConfig } = require("../mongo-snapshot/configs/config");

const init = async (initOptions) => {
  mongoose.connection.on("connected", async () => {
    if (initOptions.historyModelSuffix)
      ProcessConfig.setHMSuffix(historyModelSuffix);

    let historyCollections = [];
    let collections = [];
    let collectionsNotRecorded = [];

    mongoose.modelNames()?.forEach((collName) => {
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
    });

    if (!(historyCollections.length === collections?.length)) {
      collections.forEach((coll) => {
        if (!historyCollections.find((histColl) => histColl?.includes(coll))) {
          collectionsNotRecorded.push(coll);
        }
      });
    }

    // console.log("Vulgeiroth ::: I", collectionsNotRecorded);
    // console.log("Vulgeiroth ::: II", collections);
    // console.log("Vulgeiroth ::: III", historyCollections);

    collectionsNotRecorded.forEach((collectionNR) => {
      createHistoryModel(collectionNR, initOptions?.historyModelSuffix);
    });
  });
};

module.exports = init;
