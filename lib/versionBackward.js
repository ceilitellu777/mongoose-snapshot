const mongoose = require("mongoose");
const { ProcessConfig } = require("../configs/config");
const { asyncMultiple } = require("../helpers/asyncMultiple");

/**
 * Timestamp based version backwarding / forwarding function
 * @param {Number} timestamp The base timestamp for the forwarding / backwarding
 */
const versionBackward = async (timestamp) => {
  ProcessConfig.setWriteOpPurpose("restoring");

  let historyModels = Object.keys(mongoose.models).filter((mdl) =>
    mdl?.includes(ProcessConfig.getHMSuffix())
  );

  historyModels = historyModels?.map((hmKey) => mongoose.models[hmKey]);

  await asyncMultiple(historyModels, async (HmModel) => {
    await HmModel.updateMany(
      { timestamp: { $gt: timestamp } },
      { $set: { branch: `${timestamp}` } }
    ).then(async (res) => {
      await HmModel.updateMany(
        {
          timestamp: { $lte: timestamp },
        },
        { $set: { branch: "master" } }
      );
    });
  });

  await asyncMultiple(historyModels, async (HmModel) => {
    await HmModel.find({
      timestamp: { $lte: timestamp },
      branch: { $eq: "master" },
    })
      .sort({ _id: 1 })
      .then(async (hmDocs) => {
        let currentModelKey = Object.keys(mongoose.models).find((modelKey) => {
          return (
            mongoose.models[modelKey].modelName ===
            HmModel.modelName.split("_").slice(0, -1).join("_")
          );
        });
        let CurrentModel = mongoose.models[currentModelKey];

        let targetDocs = [];

        hmDocs.forEach((hmDoc) => {
          if (hmDoc?.modifs?.create !== "") {
            let hmDocObject = JSON.parse(hmDoc?.modifs?.create);
            if (Array.isArray(hmDocObject)) {
              hmDocObject.forEach((histDoc) => {
                targetDocs.push(histDoc);
              });
            } else {
              targetDocs.push(hmDocObject);
            }
          } else if (hmDoc.modifs?.update !== "") {
            let updatedDoc;

            targetDocs.forEach((tgDoc, index) => {
              let docKeys = hmDoc?.ref?.split("+").filter((key) => key !== "");

              docKeys.forEach((docKey) => {
                if (tgDoc["_id"].toString() === docKey) {
                  updatedDoc = Object.assign(
                    targetDocs[index],
                    JSON.parse(hmDoc?.modifs?.update)
                  );
                  targetDocs[index] = updatedDoc;
                }
              });
            });
          } else if (hmDoc.modifs?.remove === true) {
            hmDoc.ref
              .split("+")
              .filter((key) => key !== "")
              .forEach((refKey) => {
                targetDocs.forEach((tgDoc, index) => {
                  if (tgDoc["_id"].toString() === refKey) {
                    delete targetDocs[index];
                  }
                });
              });
          }
        });

        targetDocs = targetDocs.filter((tgDoc) => {
          return tgDoc !== undefined;
        });

        await CurrentModel.bulkRestore(targetDocs)
          .then(() => {})
          .catch((error) => {
            console.error(
              `An error occured when tryin to perform a bulk restore operation ${error}              `
            );
          });
      });
  });

  ProcessConfig.setWriteOpPurpose("restoring");
};

module.exports = {
  versionBackward,
};
