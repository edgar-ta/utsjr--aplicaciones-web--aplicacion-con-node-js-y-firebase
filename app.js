const UserController = require("./db/user.js");
const ProductController = require("./db/product.js");
const SaleController = require("./db/sale.js");

const express = require("express");
const app = express();

const port = process.env.PORT || 3_000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use("/user",    UserController.instance.routes);
app.use("/product", ProductController.instance.routes);
app.use("/sale",    SaleController.instance.routes);

app.listen(port, () => console.log(`http://localhost:${port}`));
