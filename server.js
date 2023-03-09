const express = require("express");
const dotenv = require("dotenv");
const app = express();
const authRoute = require("./routes/auth");
const customErrorHandler = require("./middleware/error/customError");
const connectDatabase = require("./helpers/database/connectDatabase");

// Enviroment Variables
dotenv.config({
  path: "./confing/env/confing.env",
});

// MongoDb Connection
connectDatabase();

app.use(express.json());

const PORT = 5000 || process.env.PORT;

// Routers Middleware
app.use("/api/auth", authRoute);

// Error Handler
app.use(customErrorHandler);

app.listen(PORT, () => {
  console.log(`App Started on ${PORT} : ${process.env.NODE_ENV}`);
});
