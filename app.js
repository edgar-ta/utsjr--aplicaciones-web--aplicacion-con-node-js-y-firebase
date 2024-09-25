const express = require("express");
const app = express();

const port = process.env.PORT || 3_000;

const userRoutes = require("./routes/user.js");

app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);

app.listen(port, () => console.log(`http://localhost:${port}`));


