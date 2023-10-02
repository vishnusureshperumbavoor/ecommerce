const { MongoClient } = require("mongodb");
require("dotenv").config();

let db;

module.exports.connect = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();
    db = client.db(); // Use the database specified in the URI
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports.get = () => db; // Directly return the database instance
