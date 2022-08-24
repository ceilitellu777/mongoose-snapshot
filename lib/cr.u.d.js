const mongoose = require("mongoose");
const { ProcessConfig } = require("../configs/config");
const { findHmModel } = require("../helpers/findHmModel");
const { objectKeysCompare } = require("../helpers/objectCompare");

/**
 * Mongoose middleware hadling new documents creation
 * @param {Object} schemaName The concerned model schema
 */
const onCreate = async function (schema) {
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
            console.error(
              "An error has occured when create bulk delete history doc",
              error
            );
          });
      }
    }
  });
};

/**
 * Mongoose middleware hadling documents update
 * @param {Object} schemaName The concerned model schema
 */
const onUpdate = async function (schema) {
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
              console.error(
                "An error has occured when create bulk delete history doc",
                error
              );
            });
        }
      }
    }
  );
};

/**
 * Mongoose middleware hadling documents remove
 * @param {Object} schemaName The concerned model schema
 */
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
              console.error(
                "An error has occured when create bulk delete history doc",
                error
              );
            });
        }
      }
    }
  );
};

/**
 * Mongoose middleware hadling documents custom method bulkRestore
 * @param {Object} schemaName The concerned model schema
 */
const onBulkRestore = async function (schema) {
  schema.post(["bulkRestore"], async function (docs) {});
};

/**
 * Mongoose middleware hadling documents bulk insert/create
 * @param {Object} schemaName The concerned model schema
 */
const onInsertMany = async function (schema) {
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
            console.error(
              "An error has occured when create bulk delete history doc",
              error
            );
          });
      }
    }
  });
};

/**
 * Mongoose middleware hadling documents bulk delete
 * @param {Object} schemaName The concerned model schema
 */
const onDeleteMany = async function (schema) {
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
          console.error(
            `An error has occured when tryin to get docs of the bulk delete ${error}`
          );
        });

      if (diffsDoc["ref"].length > 1) {
        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            console.error(
              `An error has occured when create bulk delete history doc ${error}`
            );
          });
      }
    }
  });
};

/**
 * Mongoose middleware hadling documents bulk update
 * @param {Object} schemaName The concerned model schema
 */
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
          console.error(
            "An error has occured when tryin to get docs of the bulk delete",
            error
          );
        });

      if (diffsDoc["ref"].length > 1) {
        await DiffsModel.create(diffsDoc)
          .then((res) => {})
          .catch((error) => {
            console.error(
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
