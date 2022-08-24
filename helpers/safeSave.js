/**
 * The function to use when someone wants to perform database operation without updating versions records
 * @param {Function} cb The asynchronous callback function in wich no version updating database operation can be performed
 */
const safeSave = async (cb) => {
  ProcessConfig.setWriteOpPurpose("restoring");

  await cb().then((result) => {
    ProcessConfig.setWriteOpPurpose("");
  });
};

module.exports = safeSave;
