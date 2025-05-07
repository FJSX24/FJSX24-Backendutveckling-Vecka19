import { Router } from "express";

export default function CourseRoutes(pool) {
  const router = Router();

  // GET för att hämta alla kurser
  router.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM courses");

      // ge ett response tillbaka
      res.status(200).json({
        succes: true,
        message: "Alla kurser hämtade",
        data: result.rows,
      });
    } catch (error) {
      console.error("GET till /courses fel!", error);

      res.status(500).json({ succes: false, error: error.message });
    }
  });
  // POST för att skapa en ny kurs
  router.post("/", async (req, res) => {
    const { title, description } = req.body;

    try {
      const result = await pool.query(
        "INSERT INTO courses (title, description) VALUES ($1, $2) RETURNING *",
        [title, description]
      );

      res.status(201).json({
        succes: true,
        message: "Kurses skapdes",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("POST till /courses fel!", error);

      res.status(500).json({ succes: false, error: error.message });
    }
  });

  return router;
}
