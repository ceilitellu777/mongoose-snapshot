const mongoose = require("mongoose");
const { ProcessConfig } = require("../configs/config");
const { asyncMultiple } = require("../helpers/asyncMultiple");

const versionBackward = async (timestamp) => {
  ProcessConfig.setWriteOpPurpose("restoring");

  let historyModels = Object.keys(mongoose.models).filter((mdl) =>
    mdl?.includes(ProcessConfig.getHMSuffix())
  );

  historyModels = historyModels?.map((hmKey) => mongoose.models[hmKey]);

  // console.log("Cela ::::", timestamp, Object.keys(mongoose.models));

  await asyncMultiple(historyModels, async (HmModel) => {
    await HmModel.updateMany(
      { timestamp: { $gt: timestamp } },
      { $set: { branch: `${timestamp}` } }
    );
  });

  await asyncMultiple(historyModels, async (HmModel) => {
    // console.log(
    //   "Vega Vesta Diallo :::",
    //   HmModel,
    //   ProcessConfig.getHMSuffix(),
    //   ProcessConfig.getWriteOpPurpose()
    // );

    await HmModel.find({
      timestamp: { $lte: timestamp },
      branch: { $eq: "master" },
    })
      .sort({ _id: 1 })
      .then(async (hmDocs) => {
        // console.log(
        //   "Foulior :::",
        //   HmModel.modelName.split("_").slice(0, -1).join("_")
        // );

        // console.log("Passedonneit :::");

        let currentModelKey = Object.keys(mongoose.models).find((modelKey) => {
          return (
            mongoose.models[modelKey].modelName ===
            HmModel.modelName.split("_").slice(0, -1).join("_")
          );
        });
        let CurrentModel = mongoose.models[currentModelKey];

        // console.log("Vega Vesta Diallo :::", CurrentModel);

        let targetDocs = [];
        // console.log("Bitleitneit :::", hmDocs);

        hmDocs.forEach((hmDoc) => {
          if (hmDoc?.modifs?.create !== "") {
            let hmDocObject = JSON.parse(hmDoc?.modifs?.create);
            if (Array.isArray(hmDocObject)) {
              // console.log("Peta Tetador 1 :::", hmDocObject);
              hmDocObject.forEach((histDoc) => {
                targetDocs.push(histDoc);
              });
            } else {
              // console.log("Peta Tetador 2 :::", hmDocObject);
              targetDocs.push(hmDocObject);
            }

            // console.log("Bitleitneit :::", targetDocs);
          } else if (hmDoc.modifs?.update !== "") {
            let updatedDoc;

            targetDocs.forEach((tgDoc, index) => {
              let docKeys = hmDoc?.ref?.split("+").filter((key) => key !== "");

              // console.log("Peta Nhir ::: 1", docKeys);

              docKeys.forEach((docKey) => {
                // console.log(
                //   "Peta Nhir ::: 2",
                //   docKey,
                //   JSON.parse(hmDoc.modifs?.update)
                // );

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
                  // console.log("Curious Keysereit ::: ", tgDoc["_id"]);
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

        // console.log("Final Diskeudeit :::", targetDocs);

        await CurrentModel.bulkRestore(targetDocs)
          .then(() => {})
          .catch((error) => {
            console.error(
              "An error occured when tryin to perform a bulk restore operation"
            );
          });
      });
  });
};

module.exports = {
  versionBackward,
};
