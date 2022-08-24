const { ProcessConfig } = require("../configs/config");

/**
 * This is a function performing the recusive asynchronous functions execution on a array of objects
 * @param {Object} cbParamsArray Objects array  to pass on every callback execution
 * @param {Object} cb The asyncronous function to perform on every onject into the array, first parameter
 */
const asyncMultiple = async (cbParamsArray, cb) => {
  if (ProcessConfig.getModelsCountIterator() < cbParamsArray?.length) {
    await cb(cbParamsArray[ProcessConfig.getModelsCountIterator()]);

    ProcessConfig.setModelsCountIterator(
      ProcessConfig.getModelsCountIterator() + 1
    );

    return await asyncMultiple(cbParamsArray, cb);
  } else {
    ProcessConfig.setModelsCountIterator(0);

    return Promise.resolve();
  }
};

module.exports = {
  asyncMultiple,
};
