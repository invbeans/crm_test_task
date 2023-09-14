const express = require('express');
require("dotenv").config();
const apiRouter = require('./routes/api.routes')

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/", apiRouter);

app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is running on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);
});
