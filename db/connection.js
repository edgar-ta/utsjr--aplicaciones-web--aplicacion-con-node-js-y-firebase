const admin = require("firebase-admin");
const keys = require("../keys.json");

admin.initializeApp({
    credential: admin.credential.cert(keys)
});

const project = admin.firestore();

const users     = project.collection("users");
const products  = project.collection("products");

module.exports = { users, products };
