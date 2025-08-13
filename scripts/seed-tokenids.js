// Script to seed the database with existing token IDs
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;

const existingTokenIds = [
  "7235602763579303523229090887911893772021989063542858376305575221240366367542",
  "27885520041093658585303584173082111687028681907098281542498800404897098505874",
  "16123578725866424640949239869761840056031657569608134149270542052425099947370",
  "36231100099188324529916239534553491533774005220845670696203766892628609116715",
  "12534741325465616854350916263157304197844422456562906124763996735273631680500",
  "97812403694419289483317826245817224897826619463759423455484352658636403681058",
  "33475241995917459510568876480036015513971225996034082646051580378741455108723",
];

async function seedTokenIds() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("tokenids");

    // Insert existing token IDs
    for (const tokenId of existingTokenIds) {
      try {
        await collection.insertOne({
          tokenId: tokenId,
          createdAt: new Date(),
        });
        console.log(`Inserted token ID: ${tokenId}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Token ID already exists: ${tokenId}`);
        } else {
          console.error(`Error inserting token ID ${tokenId}:`, error);
        }
      }
    }

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedTokenIds();
