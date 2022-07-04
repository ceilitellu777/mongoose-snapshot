const mongoose = require("mongoose");
const { ProcessConfig } = require("../configs/config");
const { findModel } = require("../helpers/findModel");
const { objectKeysCompare } = require("../helpers/objectCompare");

const onCreate = async function (schema) {
  schema.post(["save", "create"], async function () {
    if (!this.constructor.modelName.includes(ProcessConfig.getHMSuffix())) {
      let self = this;
      let diffs = this.toObject();

      let diffsDocKey = Object.keys(mongoose.models).find(
        (modelKey) =>
          modelKey === self.constructor.modelName + ProcessConfig.getHMSuffix()
      );

      let DiffsModel = mongoose.models[diffsDocKey];

      let diffsDoc = {
        modifs: {},
      };

      diffsDoc["timestamp"] = Date.now();
      diffsDoc["ref"] = diffs._id.toString();
      diffsDoc.modifs["create"] = JSON.stringify(diffs);

      await DiffsModel.create(diffsDoc)
        .then((newHistDoc) => {})
        .catch((error) => {
          console.error(
            "An error has occured when trying to create the document history ,",
            error
          );
        });
    }
  });
};

const onUpdate = async function (schema) {
  schema.post(
    ["updateOne", "update", "findOneAndUpdate", "findByIdAndUpdate"],
    async function () {
      if (!this.model.modelName.includes(ProcessConfig.getHMSuffix())) {
        let self = this;

        let DiffsModel = findModel(self.model.modelName);

        let diffsDoc = {
          modifs: {},
        };

        let diffs = this._update.$set;

        diffsDoc["timestamp"] = Date.now();

        diffsDoc["ref"] = "";
        await this.model.find(this._conditions).then((modifiedDocs) => {
          modifiedDocs.forEach((mdDoc) => {
            diffsDoc["ref"] = `+${mdDoc.id}`;
          });
        });

        if (Object.keys(diffs).length > 0) {
          diffsDoc.modifs["update"] = JSON.stringify(diffs);
        }

        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            console.error(
              "An error has occured when trying to create the update history document ,",
              error
            );
          });
      }
    }
  );
};

const onRemove = async function (schema) {
  schema.pre(
    [
      "remove",
      "deleteOne",
      "findByIdAndDelete",
      "findOneAndDelete",
      "findAndDeleteMany",
    ],
    async function () {
      let self = this;

      let DiffsModel = findModel(self.model.modelName);

      let diffsDoc = {
        modifs: {},
      };

      diffsDoc["timestamp"] = Date.now();
      diffsDoc.modifs["remove"] = true;

      diffsDoc["ref"] = "";
      await this.model.find(this._conditions).then((modifiedDocs) => {
        modifiedDocs.forEach((mdDoc) => {
          diffsDoc["ref"] = `+${mdDoc.id}`;
        });
      });

      await DiffsModel.create(diffsDoc)
        .then((res) => {})
        .catch((error) => {
          console.log("An error has occured when tryin to get", error);
        });
    }
  );
};

module.exports = {
  onCreate,
  onUpdate,
  onRemove,
};
