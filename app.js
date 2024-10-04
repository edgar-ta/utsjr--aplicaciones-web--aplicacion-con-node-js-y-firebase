const express = require("express");
const app = express();

const port = process.env.PORT || 3_000;

const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/form", (request, response) => response.render("mock-form"));
app.post("/logic", (request, response) => {
    // const body = request.body;
    const SalesConnection = require("./db/connection.js").sales;
    
    SalesConnection
        .get()
        .then((result) => {
            const data = result;
            response.json({ data });
            console.log(data);
        })
        .catch((error) => response.json({ error }))
    ;
});

app.use("/user", userRoutes);
app.use("/product", productRoutes);

app.listen(port, () => console.log(`http://localhost:${port}`));
