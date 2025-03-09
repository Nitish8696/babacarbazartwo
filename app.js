const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const carRoute = require("./routes/Cars")
const userRoute = require("./routes/auth")
const slider = require("./routes/Slider");
const PopUp = require("./routes/PopUp");
const Contact = require("./routes/contact");


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes (adjust the file paths)
// const userRoutes = require('./routes/userRoutes'); // Example route import
app.use('/api/cars', carRoute);
app.use('/api/user', userRoute);
app.use("/api/slider-images", slider);
app.use("/api/popup", PopUp);
app.use("/api/contact", Contact);


module.exports = app;
