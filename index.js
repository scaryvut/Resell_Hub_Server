const express = require('express')
const cors = require('cors');
const app = express()
const port = 5000
require('dotenv').config();


app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const logger = (req, res, next) => {
    console.log('logger middleware logged', req.params);
    next();
}




const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


   const db = client.db("ResellHub_db");

   const usersCollection = db.collection("user");
   const productsCollection = db.collection("products");
   const wishlistCollection = db.collection("wishlist");
   const ordersCollection = db.collection("orders");
   const paymentsCollection = db.collection("payments");


        // verification related
        const verifyToken = async (req, res, next) => {

            const authHeader = req.headers?.authorization;
            if (!authHeader) {
                return res.status(401).send({ message: 'unauthorized access' })
            }

            const token = authHeader.split(' ')[1]

            if (!token) {
                return res.status(401).send({ message: 'unauthorized access' })
            }

            const query = { token: token }
            const session = await sessionCollection.findOne(query);

              if (!session) {
                return res.status(401).send({ message: 'unauthorized access' })
            }

            const userId = session.userId;


            const userQuery = {
                _id: userId
            }

            const user = await usersCollection.findOne(userQuery);
              if (!user) {
                return res.status(401).send({ message: 'unauthorized access' })
            }
            // set data in the req object
            req.user = user;
            next();
        }

        // must be used after verifyToken middleware
        const verifyBuyer = async (req, res, next) => {
            if (req.user?.role !== 'buyer') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        // must be used after verifyToken middleware
        const verifySeller = async (req, res, next) => {
            if (req.user?.role !== 'seller') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        // must be used after verifyToken middleware
        const verifyAdmin = async (req, res, next) => {
            if (req.user.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

 //User      
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

//Product
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

//wishlist
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


//Orders
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

//Seller Analytic
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


//Admin
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

//Payment
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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})