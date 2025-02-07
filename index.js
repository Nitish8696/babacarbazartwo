const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const connectDB = require("./db/index");
const app = require("./app");

// Load environment variables from the .env file
// dotenv.config({ path: "./env" });

// Connect to the database
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MONGO db connection failed!!!", err);
  });

/*
// Example code to start your Express app
// Make sure to uncomment and adapt this code as needed

const express = require("express");
const mongoose = require("mongoose");

const app = express();

const DB_NAME = process.env.DB_NAME;
const PORT = process.env.PORT;

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.error("Error:", error);
      throw error;
    });
    app.listen(PORT, () => {
      console.log(`App is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  }
})();
*/
