const mongoose = require("mongoose");
const { ProcessConfig } = require("../configs/config");
const { findHmModel } = require("../helpers/findHmModel");
const { objectKeysCompare } = require("../helpers/objectCompare");

const onCreate = async function (schema) {
  console.info("Handled create document action");

  schema.post(["save", "create"], async function () {
    if (
      !this.constructor.modelName.includes(ProcessConfig.getHMSuffix()) &&
      ProcessConfig.getWriteOpPurpose() !== "restoring" &&
      this.constructor.modelName !== ProcessConfig.getHistoryLogsModelName()
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

      if (diffsDoc["ref"].length > 1) {
        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            console.info(
              "An error has occured when create bulk delete history doc",
              error
            );
          });
      }
    }
  });
};

const onUpdate = async function (schema) {
  console.info("Handled document update action");

  schema.post(
    ["updateOne", "update", "findOneAndUpdate", "findByIdAndUpdate"],
    async function () {
      if (
        !this.model.modelName.includes(ProcessConfig.getHMSuffix()) &&
        this._update.$set !== undefined &&
        ProcessConfig.getWriteOpPurpose() !== "restoring" &&
        this.model.modelName !== ProcessConfig.getHistoryLogsModelName()
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
          modifiedDocs.forEach((mdDoc) => {
            diffsDoc["ref"] =
              diffsDoc["ref"].toString() + "+".concat(mdDoc._id.toString());
          });
        });

        if (Object.keys(diffs).length > 0) {
          diffsDoc.modifs["update"] = JSON.stringify(diffs);
        }

        if (diffsDoc["ref"].length > 1) {
          await DiffsModel.create(diffsDoc)
            .then((res) => {})
            .catch((error) => {
              console.info(
                "An error has occured when create bulk delete history doc",
                error
              );
            });
        }
      }
    }
  );
};

const onRemove = async function (schema) {
  schema.pre(
    ["remove", "deleteOne", "findByIdAndDelete", "findOneAndDelete"],
    async function () {
      if (
        ProcessConfig.getWriteOpPurpose() !== "restoring" &&
        this.model.modelName !== ProcessConfig.getHistoryLogsModelName()
      ) {
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

        if (diffsDoc["ref"].length > 1) {
          await DiffsModel.create(diffsDoc)
            .then((res) => {})
            .catch((error) => {
              console.info(
                "An error has occured when create bulk delete history doc",
                error
              );
            });
        }
      }
    }
  );
};

const onBulkRestore = async function (schema) {
  console.info("Handled collection bulk restore action");

  schema.post(["bulkRestore"], async function (docs) {});
};

const onInsertMany = async function (schema) {
  console.info("Handled document insert many action");

  schema.post(["insertMany"], async function (docs) {
    if (
      ProcessConfig.getWriteOpPurpose() !== "restoring" &&
      this.modelName !== ProcessConfig.getHistoryLogsModelName()
    ) {
      let self = this;

      let DiffsModel = findHmModel(self.modelName);
      let diffsDoc = {
        modifs: {},
      };

      // console.info(`\n\nFoutilloneit Insert  pot-${DiffsModel}-pot :::\n\n`);

      diffsDoc["timestamp"] = Date.now();
      diffsDoc.modifs["create"] = JSON.stringify(docs);
      diffsDoc["ref"] = "";

      docs.forEach((doc) => {
        diffsDoc["ref"] =
          diffsDoc["ref"].toString() + "+".concat(doc._id.toString());
      });

      if (diffsDoc["ref"].length > 1) {
        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            console.info(
              "An error has occured when create bulk delete history doc",
              error
            );
          });
      }
    }
  });
};

const onDeleteMany = async function (schema) {
  console.info("Handled delete document action");

  schema.pre(["deleteMany"], async function (docs) {
    if (
      ProcessConfig.getWriteOpPurpose() !== "restoring" &&
      this.model.modelName !== ProcessConfig.getHistoryLogsModelName()
    ) {
      let self = this;

      let DiffsModel = findHmModel(self.model.modelName);
      let diffsDoc = {
        modifs: {},
      };

      // console.info(
      //   `\n\nFoutilloneit Delete  pot-${self.model.modelName}-pot  :::\n\n`
      // );

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
          appLogger.emerg(
            `An error has occured when tryin to get docs of the bulk delete ${error}`
          );
        });

      if (diffsDoc["ref"].length > 1) {
        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            appLogger.emerg(
              `An error has occured when create bulk delete history doc ${error}`
            );
          });
      }
    }
  });
};

const onUpdateMany = async function (schema) {
  schema.pre(["updateMany"], async function (docs) {
    if (
      ProcessConfig.getWriteOpPurpose() !== "restoring" &&
      this.model.modelName !== ProcessConfig.getHistoryLogsModelName()
    ) {
      let self = this;

      let DiffsModel = findHmModel(self.model.modelName);
      let diffsDoc = {
        modifs: {},
      };

      diffsDoc["timestamp"] = Date.now();
      diffsDoc.modifs["update"] = JSON.stringify(self.getUpdate().$set);
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
          console.info(
            "An error has occured when tryin to get docs of the bulk delete",
            error
          );
        });

      if (diffsDoc["ref"].length > 1) {
        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            appLogger.emerg(
              `An error has occured when create bulk delete history doc ${error}`
            );
          });
      }
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
