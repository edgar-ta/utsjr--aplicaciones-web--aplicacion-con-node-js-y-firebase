const express = require("express");
const app = express();

const port = process.env.PORT || 3_000;

const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");

app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/product", productRoutes);

app.listen(port, () => console.log(`http://localhost:${port}`));


