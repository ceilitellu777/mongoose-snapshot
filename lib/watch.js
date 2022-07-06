const mongoose = require("mongoose");
const {
  onCreate,
  onRemove,
  onUpdate,
  onInsertMany,
  onDeleteMany,
  onUpdateMany,
} = require("./cr.u.d");

const watch = function (schema, options) {
  //settin the common field to identify operation context on models

  schema.statics.bulkRestore = async function (bulkDocs) {
    const self = this;

    self.schema.virtual("restore").get(function () {
      return "restoring";
    });

    console.log("Formik Diouzzeit", bulkDocs);

    await self
      .deleteMany({})
      .then(async () => {
        await self
          .insertMany(bulkDocs)
          .then((res) => {
            console.info("Bulk write performed", res);
          })
          .catch((error) => {
            console.error(
              "An error has occured when tryin to perform a batch create request over the mode for restore purpose",
              error
            );
          });
      })
      .catch((error) => {
        console.error(
          "An error has occured when trying to remove all previous docs for restore purpose",
          error
        );
      });
  };

  onCreate(schema);
  onInsertMany(schema);
  onRemove(schema);
  onDeleteMany(schema);
  onUpdate(schema);
  onUpdateMany(schema);
};

module.exports = {
  watch,
};
