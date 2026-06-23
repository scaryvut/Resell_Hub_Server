const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let productCollection;
let wishlistCollection;
let orderCollection;

async function run() {
  await client.connect();

  const db = client.db("ResellHub_db");

  productCollection = db.collection("products");
  wishlistCollection = db.collection("wishlist");
  orderCollection = db.collection("orders");

  console.log("MongoDB connected");
}

run();

// ---------------- PRODUCTS ----------------
app.get("/products", async (req, res) => {
  const products = await productCollection.find().toArray();
  res.send(products);
});

app.get("/products/:id", async (req, res) => {
  const product = await productCollection.findOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(product);
});

// ---------------- WISHLIST ----------------
app.post("/wishlist", async (req, res) => {
  const result = await wishlistCollection.insertOne(req.body);
  res.send(result);
});

app.get("/wishlist/:email", async (req, res) => {
  const result = await wishlistCollection
    .find({ userEmail: req.params.email })
    .toArray();
  res.send(result);
});

app.delete("/wishlist/:id", async (req, res) => {
  const id = req.params.id;

  const result = await wishlistCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

app.delete("/wishlist/:id", async (req, res) => {
  const id = req.params.id;

  const result = await wishlistCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

// ---------------- ORDERS ----------------
app.post("/orders", async (req, res) => {
  const order = {
    ...req.body,
    status: "pending",
    createdAt: new Date(),
  };

  const result = await orderCollection.insertOne(order);
  res.send(result);
});

app.get("/orders/:email", async (req, res) => {
  const result = await orderCollection
    .find({ userEmail: req.params.email })
    .toArray();
  res.send(result);
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});