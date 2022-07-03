const mongoose = require("mongoose");
const { objectKeysCompare } = require("../helpers/objectCompare");

const onCreate = async function (schema) {
  schema.post(["save", "create"], async function () {
    let diffs = this.toObject();

    let diffsDoc = new mongoose.models.find(
      (mdl) => mdl.name === `${this.model.collection.name}_History`
    )();
    diffsDoc["timestamp"] = Date.now();
    diffs.modifs["create"] = JSON.stringify(diffs);

    await diffsDoc.save();
  });
};

const onUpdate = async function (schema) {
  let diffs = {};
  schema.post(
    ["update", "findOneAndUpdate", "findByIdAndUpdate"],
    async function () {
      this.model
        .findOne()
        .sort({ _id: -1 })
        .then((lastDoc) => {
          diffs = objectKeysCompare(this.toObject(), lastDoc);
        });

      let diffsDoc = new mongoose.models.find(
        (mdl) => mdl.name === `${this.model.collection.name}_History`
      )();

      diffsDoc.timestamp = Date.now();

      if (Object.keys(diffs).length > 0) {
        diffsDoc.modifs["update"] = JSON.stringify(diffs);
      }

      await diffsDoc.save();
    }
  );
};

const onDelete = async function (schema) {
  schema.post(
    ["remove", "findByIdAndRemove", "findOneAndRemove"],
    async function () {
      let diffsDoc = new mongoose.models.find(
        (mdl) => mdl.name === `${this.model.collection.name}_History`
      )();

      diffsDoc["timestamp"] = Date.noww();
      diffsDoc.modifs["update"] = true;

      await diffsDoc.save();
    }
  );
};

module.exports = {
  onCreate,
  onUpdate,
  onDelete,
};
