const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

const jwt = require("jsonwebtoken");
const cookieParser =
  require("cookie-parser");

const verifyToken =
  require("./middleware/verifyToken");

const verifyAdmin =
  require("./middleware/verifyAdmin");

app.use(express.json());

// ================= MONGODB =================

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let usersCollection;
let productsCollection;
let wishlistCollection;
let ordersCollection;
let paymentsCollection;

async function connectDB() {
  try {
    await client.connect();

    db = client.db("ResellHub_db");

    usersCollection = db.collection("user");
    productsCollection = db.collection("products");
    wishlistCollection = db.collection("wishlist");
    ordersCollection = db.collection("orders");
    paymentsCollection = db.collection("payments");

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error(error);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.send("🚀 ResellHub Server Running");
});

app.post("/jwt", async (req, res) => {
  try {
    const user = req.body;

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.send({
      token,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

//
// ================= USERS =================
//

app.get("/users", async (req, res) => {
  try {
    const result = await usersCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = req.body;

    const existingUser = await usersCollection.findOne({
      email: user.email,
    });

    if (existingUser) {
      return res.send({
        message: "User already exists",
      });
    }

    const result = await usersCollection.insertOne(user);

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const result = await usersCollection.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: req.body,
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//
// ================= PRODUCTS =================
//

app.get("/products", async (req, res) => {
  try {
    const result = await productsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const result = await productsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/products", async (req, res) => {
  try {
    const product = {
      ...req.body,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await productsCollection.insertOne(product);

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/seller-products/:email", async (req, res) => {
  try {
    const result = await productsCollection
      .find({
        "sellerInfo.email": req.params.email,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.patch("/products/:id", async (req, res) => {
  try {
    const result = await productsCollection.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: req.body,
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const result = await productsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.patch("/admin/products/approve/:id", async (req, res) => {
  try {
    const result = await productsCollection.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          status: "approved",
        },
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.patch("/admin/products/reject/:id", async (req, res) => {
  try {
    const result = await productsCollection.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          status: "rejected",
        },
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//
// ================= WISHLIST =================
//

app.post("/wishlist", async (req, res) => {
  const result = await wishlistCollection.insertOne(req.body);
  res.send(result);
});

app.get("/wishlist/:email", async (req, res) => {
  const result = await wishlistCollection
    .find({
      userEmail: req.params.email,
    })
    .toArray();

  res.send(result);
});

app.delete("/wishlist/:id", async (req, res) => {
  const result = await wishlistCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send(result);
});

//
// ================= ORDERS =================
//

app.post("/orders", async (req, res) => {
  try {
    const order = {
      ...req.body,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const result = await ordersCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/orders/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const result =
      await ordersCollection
        .find({
          "buyerInfo.email": email,
        })
        .sort({
          createdAt: -1,
        })
        .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});


app.get("/seller-orders/:email", async (req, res) => {
  try {
    const result = await ordersCollection
      .find({
        "sellerInfo.email": req.params.email,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.patch("/orders/:id", async (req, res) => {
  try {
    const result = await ordersCollection.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: req.body,
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//
// ================= SELLER ANALYTICS =================
//

app.get("/seller/analytics/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const products = await productsCollection
      .find({
        "sellerInfo.email": email,
      })
      .toArray();

    const orders = await ordersCollection
      .find({
        "sellerInfo.email": email,
      })
      .toArray();

    const categoryMap = {};

    products.forEach((item) => {
      categoryMap[item.category] =
        (categoryMap[item.category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    res.send({
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(
        (o) => o.status === "pending"
      ).length,
      totalRevenue: orders.reduce(
        (sum, order) =>
          sum + Number(order.price || 0),
        0
      ),
      categoryData,
      orders,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

//
// ================= ADMIN =================
//

app.get("/admin/stats", async (req, res) => {
  try {
    res.send({
      totalUsers:
        await usersCollection.countDocuments(),
      totalProducts:
        await productsCollection.countDocuments(),
      totalOrders:
        await ordersCollection.countDocuments(),
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/admin/analytics", async (req, res) => {
  try {
    const categories =
      await productsCollection
        .aggregate([
          {
            $group: {
              _id: "$category",
              value: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray();

    res.send({
      users:
        await usersCollection.countDocuments(),
      products:
        await productsCollection.countDocuments(),
      orders:
        await ordersCollection.countDocuments(),
      categories,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

app.get(
  "/payments/:email",
  async (req, res) => {
    const email = req.params.email;

    const result =
      await paymentsCollection
        .find({
          buyerEmail: email,
        })
        .sort({
          paymentDate: -1,
        })
        .toArray();

    res.send(result);
  }
);

app.post("/payments", async (req, res) => {
  try {
    const payment = req.body;

    const existingPayment =
      await paymentsCollection.findOne({
        transactionId:
          payment.transactionId,
      });

    if (existingPayment) {
      return res.status(409).send({
        success: false,
        message:
          "Payment already exists",
      });
    }

    const result =
      await paymentsCollection.insertOne(
        payment
      );

    res.send({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message:
        "Failed to save payment",
    });
  }
});

app.get("/users/email/:email", async (req, res) => {
  try {
    const result = await usersCollection.findOne({
      email: req.params.email,
    });

    res.send(result || {});
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

app.get(
  "/buyer/dashboard/:email",
  async (req, res) => {
    try {
      const email = req.params.email;

      const orders = await ordersCollection
        .find({
          "buyerInfo.email": email,
        })
        .toArray();

      const wishlist =
        await wishlistCollection
          .find({
            userEmail: email,
          })
          .toArray();

      res.send({
        totalOrders: orders.length,
        wishlist: wishlist.length,

        delivered: orders.filter(
          (o) =>
            o.orderStatus ===
            "delivered"
        ).length,

        pending: orders.filter(
          (o) =>
            o.orderStatus ===
            "pending"
        ).length,

        recentOrders: orders.slice(0, 5),
      });
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  }
);



//
// ================= START =================
//

app.listen(port, () => {
  console.log(`🚀 Server Running On Port ${port}`);
});