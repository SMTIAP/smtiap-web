import mongoose from "mongoose";
import { env } from "./config/env.js";

async function cleanDb() {
  if (!env.mongoUri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Failed to get database instance");
      process.exit(1);
    }

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.length === 0) {
      console.log("No collections found — database is already empty.");
    } else {
      console.log(`Found ${collectionNames.length} collection(s):`);
      collectionNames.forEach((name) => console.log(`  - ${name}`));

      for (const name of collectionNames) {
        await db.dropCollection(name);
        console.log(`  ✓ Dropped "${name}"`);
      }
    }

    console.log("\nDatabase cleaned successfully.");
  } catch (error) {
    console.error("Failed to clean database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

cleanDb();
