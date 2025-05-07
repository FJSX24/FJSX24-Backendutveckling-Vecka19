import express from "express";
import pg from "pg";
import dotenv from "dotenv";
// importera våra routes
import StudentRoutes from "./routes/students.js";
import CoursesRoutes from "./routes/courses.js";

dotenv.config();

// Skapa en express server
const app = express();
app.use(express.json());

// Skapa en anslutning til P db med en pool anslutning
// Best practice: Skapa db/pool.js fil
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
});

// Test anslutningen till db
(async () => {
  try {
    await pool.connect();
    console.log("Ansluten till db");
  } catch (error) {
    console.error("Fel vid anslutning till db", error);
  }
})();

// Koppla våra routes
app.use("/students", StudentRoutes(pool));
app.use("/courses", CoursesRoutes(pool));

// Start vår express server
app.listen(8000, () => console.log("Sever körs på http://localhost:8000"));
