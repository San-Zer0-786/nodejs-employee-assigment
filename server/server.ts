import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { Employee, Assignment, MarketingChannels } from "../types";
import { clearDatabase, seedDatabase, startInMemoryMongoDB } from "./db";
import { ObjectId } from "bson";
import { Db } from "mongodb";
let db: Db;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Use simple assignment lock for concurrent control to prevent e.g. multiple user clicks causing bugs in db
let assignmentLock = false;
// if unassigning employee from product, we need to consider the values currently being processed. If an ID 
const assignmentRemovalLocks = new Set<string>();

async function start() {
  const db = await startInMemoryMongoDB();

  clearDatabase(db);
  seedDatabase();

  await server.listen(3001);

  io.on("connection", async (socket) => {
    console.log("Client connected to socket.io server");

    socket.on("initial", async () => {
      console.log("Initial data requested");

      const employees = await db.collection("employees").find().toArray();
      const assignments = await db.collection("assignments").find().toArray();
      const product = await db.collection("product").findOne();

      socket.emit("employees", employees);
      socket.emit("assignments", assignments);
      socket.emit("product", product);
    });

    socket.on("assign", async (args: { employeeId: string, channel: MarketingChannels }) => {
      const { employeeId, channel } = args;

      if (!assignmentLock) {
        assignmentLock = true;

        const assignment: Omit<Assignment, "_id"> = {
          employeeId: new ObjectId(employeeId),
          channel,
        };

        console.log("New assignment", assignment);

        await sleep(500);

        const { insertedId } = await db.collection("assignments").insertOne(assignment);

        await db.collection("product").updateOne(
          {},
          {
            $inc: {
              [`marketingPoints.${channel}`]: 1,
            },
          }
        );

        await sleep(500);

        const newAssignment = await db.collection("assignments").findOne({
          _id: insertedId,
        });

        const updatedProduct = await db.collection("product").findOne();

        io.emit("product", updatedProduct);
        io.emit("assignment_add", newAssignment);

        assignmentLock = false;
      }
    });

    // Listen for deleted assignment...
    // NB: Double check this next during Nov 25/26!
    socket.on("unassign", async (assignmentId: string) => {
      console.log("Deleted assignment", assignmentId);
      console.log("Current assignment locks", assignmentRemovalLocks);

      if (!assignmentRemovalLocks.has(assignmentId)) {
        assignmentRemovalLocks.add(assignmentId);
    
        const assignment = await db.collection("assignments").findOne({
          _id: new ObjectId(assignmentId),
        });
    
        if (!assignment) {
          assignmentRemovalLocks.delete(assignmentId);
          return;
        }
    
        // sleep for 500ms to simulate latency
        await sleep(500);
    
        // Delete assignment from database
        await db.collection("assignments").deleteOne({
          _id: new ObjectId(assignmentId),
        });
    
        await db.collection("product").updateOne(
          {},
          {
            $inc: {
              [`marketingPoints.${assignment.channel}`]: -1,
            },
          }
        );
    
        // sleep for 500ms to simulate latency
        await sleep(500);
    
        const updatedProduct = await db.collection("product").findOne();
    
        io.emit("product", updatedProduct);
        io.emit("assignment_remove", assignmentId);
    
        assignmentRemovalLocks.delete(assignmentId);
      }
    });
  })

  console.log("Socket server listening on http://localhost:3001");
}

// Endpoint to trigger the database clearing to assist cypress tests
app.post('/clear-database', async (req, res) => {
  await clearDatabase(db);
  res.status(200).send('Database cleared successfully!');
});

// Endpoint to trigger the database seeding to assist cypress tests
app.post('/seed-database', async (req, res) => {
  await seedDatabase();
  res.status(200).send('Database seeded successfully!');
});

start();
