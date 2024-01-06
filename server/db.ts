import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db } from "mongodb";

let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: Db;

export async function startInMemoryMongoDB (): Promise<Db> {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.warn('mongo uri:', uri)
  client = new MongoClient(uri);
  await client.connect();
  db = client.db("employees");
  return db;
}

export async function stopInMemoryMongoDB (): Promise<void> {
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

// Optional: Helper method to clear database
export async function clearDatabase (db: Db): Promise<void> {
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
}

const randomNames = [
  "Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack",
];

function getRandomName(): string {
  const randomIndex = Math.floor(Math.random() * randomNames.length);
  return randomNames[randomIndex];
}

export async function seedDatabase (): Promise<void> {
  await db.collection("product").insertOne({
    marketingPoints: {
      Newspapers: 0,
      TV: 0,
      GoogleAds: 0,
    },
    name: "Product 1",
  });

  const employees = [];
  const types = ["marketing", "engineering", "sales", "finance"]; // Add more types if needed

  for (let i = 0; i < 20; i++) {
    const randomName = getRandomName();
    const randomType = types[Math.floor(Math.random() * types.length)];

    employees.push({
      name: randomName,
      type: randomType,
    });
  }

  await db.collection("employees").insertMany(employees);
}
