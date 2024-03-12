const { default: mongoose } = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_CONNECTION);
    console.log(`Connected To Database`);
  } catch (error) {
    console.log(`Error Connecting To Database: ${error.message}`);
  }
};

module.exports = connectDb;
