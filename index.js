const mongoose = require("mongoose");
const { createHistoryModel } = require("./db/schema");

let GO = false;

const watch = function (schema, options) {
  let historyCollections = [];
  let collections = [];
  let collectionsNotRecorded = [];

  if (GO) {
    mongoose.connection.on("open", async () => {
      mongoose.modelNames()?.forEach((collName) => {
        if (collName?.includes("_History")) {
          historyCollections.push(collName);
        } else {
          collections?.push(collName);
        }
      });

      if (!(historyCollections.length === collections?.length)) {
        collections.forEach((coll) => {
          if (
            !historyCollections.find((histColl) => histColl?.includes(coll))
          ) {
            collectionsNotRecorded.push(coll);
          }
        });
      }

      collectionsNotRecorded.forEach((collectionNR) => {
        createHistoryModel(collectionNR);
      });

      GO = true;
    });
  }

  schema.post(
    ["save", "update", "remove", "findOneAndUpdate", "findOneAndRemove"],
    async function () {
      // code goes here
      console.log(this);
    }
  );
};

module.exports = {
  watch,
};
