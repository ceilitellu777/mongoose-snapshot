let counter = 0;

const asyncMultiple = async (cbParamsArray, cb) => {
  if (counter < cbParamsArray?.length) {
    // console.log(
    //   "Findeit :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::",
    //   counter,
    //   cbParamsArray[counter]
    // );

    await cb(cbParamsArray[counter]);

    counter++;

    //splice the the array as advancing process on it
    return await asyncMultiple(cbParamsArray, cb);
  } else {
    return Promise.resolve();
  }
};

module.exports = {
  asyncMultiple,
};
