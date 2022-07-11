const { ProcessConfig } = require("../configs/config");

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
