const mongoose = require("mongoose");
const { ProcessConfig } = require("../configs/config");
const { findHmModel } = require("../helpers/findHmModel");
const { objectKeysCompare } = require("../helpers/objectCompare");

const onCreate = async function (schema) {
  schema.post(["save", "create"], async function () {
    if (
      !this.constructor.modelName.includes(ProcessConfig.getHMSuffix()) &&
      ProcessConfig.getWriteOpPurpose() !== "restoring"
    ) {
      let self = this;
      let diffs = this.toObject({ virtual: true });

      let DiffsModel = findHmModel(self.constructor.modelName);

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
      if (
        !this.model.modelName.includes(ProcessConfig.getHMSuffix()) &&
        this._update.$set !== undefined &&
        ProcessConfig.getWriteOpPurpose() !== "restoring"
      ) {
        let self = this;

        let DiffsModel = findHmModel(self.model.modelName);

        let diffsDoc = {
          modifs: {},
        };

        let diffs = self._update.$set;

        diffsDoc["timestamp"] = Date.now();

        diffsDoc["ref"] = "";

        await self.model.find(self._conditions).then((modifiedDocs) => {
          // console.log("Pleut Von der :::", self._conditions);
          modifiedDocs.forEach((mdDoc) => {
            // console.log(
            //   "Frameit Neuteit 00000 :::",
            //   "+".concat(mdDoc._id.toString())
            // );
            diffsDoc["ref"] =
              diffsDoc["ref"].toString() + "+".concat(mdDoc._id.toString());
          });

          // console.log("Frameit Neuteit :::", diffsDoc["ref"]);
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
    ["remove", "deleteOne", "findByIdAndDelete", "findOneAndDelete"],
    async function () {
      if (ProcessConfig.getWriteOpPurpose() !== "restoring") {
        let self = this;

        let DiffsModel = findHmModel(self.model.modelName);

        let diffsDoc = {
          modifs: {},
        };

        diffsDoc["timestamp"] = Date.now();
        diffsDoc.modifs["remove"] = true;

        diffsDoc["ref"] = "";
        await self.model.find(self._conditions).then((modifiedDocs) => {
          modifiedDocs.forEach((mdDoc) => {
            diffsDoc["ref"] =
              diffsDoc["ref"].toString() + "+".concat(mdDoc._id.toString());
          });
        });

        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            console.log("An error has occured when tryin to get", error);
          });
      }
    }
  );
};

const onBulkRestore = async function (schema) {
  schema.post(["bulkRestore"], async function (docs) {
    console.log("Veurgeit bulkRestore :::", docs);
  });
};

const onInsertMany = async function (schema) {
  schema.post(["insertMany"], async function (docs) {
    if (ProcessConfig.getWriteOpPurpose() !== "restoring") {
      let self = this;

      let DiffsModel = findHmModel(self.modelName);
      let diffsDoc = {
        modifs: {},
      };

      console.log(`\n\nFoutilloneit Insert  pot-${DiffsModel}-pot :::\n\n`);

      diffsDoc["timestamp"] = Date.now();
      diffsDoc.modifs["create"] = JSON.stringify(docs);
      diffsDoc["ref"] = "";

      docs.forEach((doc) => {
        diffsDoc["ref"] =
          diffsDoc["ref"].toString() + "+".concat(doc._id.toString());
      });

      await DiffsModel.create(diffsDoc)
        .then((res) => {})
        .catch((error) => {
          console.log(
            "An error has occured when create bulk delete history doc",
            error
          );
        });
    }
  });
};

const onDeleteMany = async function (schema) {
  schema.pre(["deleteMany"], async function (docs) {
    if (ProcessConfig.getWriteOpPurpose() !== "restoring") {
      let self = this;

      let DiffsModel = findHmModel(self.model.modelName);
      let diffsDoc = {
        modifs: {},
      };

      console.log(
        `\n\nFoutilloneit Delete  pot-${self.model.modelName}-pot  :::\n\n`
      );

      diffsDoc["timestamp"] = Date.now();
      diffsDoc.modifs["remove"] = true;
      diffsDoc["ref"] = "";

      await this.find(this._conditions)
        .then((toDeleteDocs) => {
          toDeleteDocs.forEach((doc) => {
            diffsDoc["ref"] =
              diffsDoc["ref"].toString() + "+".concat(doc._id.toString());
          });
        })
        .catch((error) => {
          console.log(
            "An error has occured when tryin to get docs of the bulk delete",
            error
          );
        });

      await DiffsModel.create(diffsDoc)
        .then((res) => {})
        .catch((error) => {
          console.log(
            "An error has occured when create bulk delete history doc",
            error
          );
        });
    }
  });
};

const onUpdateMany = async function (schema) {
  schema.post(["updateMany"], async function (docs) {
    if (ProcessConfig.getWriteOpPurpose() !== "restoring") {
      let self = this;

      let DiffsModel = findHmModel(self.model.modelName);
      let diffsDoc = {
        modifs: {},
      };

      diffsDoc["timestamp"] = Date.now();
      diffsDoc.modifs["update"] = JSON.stringify(self.getUpdate());
      diffsDoc["ref"] = "";

      await this.model
        .find({ ...this._conditions, l: undefined })
        .then((updatedDocs) => {
          updatedDocs.forEach((doc) => {
            diffsDoc["ref"] =
              diffsDoc["ref"].toString() + "+".concat(doc._id.toString());
          });
        })
        .catch((error) => {
          console.log(
            "An error has occured when tryin to get docs of the bulk delete",
            error
          );
        });

      await DiffsModel.create(diffsDoc)
        .then((res) => {})
        .catch((error) => {
          console.log(
            "An error has occured when create bulk delete history doc",
            error
          );
        });
    }
  });
};

module.exports = {
  onCreate,
  onUpdate,
  onRemove,
  onDeleteMany,
  onUpdateMany,
  onInsertMany,
};
