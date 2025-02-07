const mongoose = require('mongoose');
// import { DB_NAME } from "../constants.js";
const dotenv = require('dotenv');
dotenv.config();



const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}
module.exports = connectDB;