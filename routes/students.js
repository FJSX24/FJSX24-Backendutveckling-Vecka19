import { Router } from "express";

export default function StudentRoutes(pool) {
  const router = Router();

  // GET för att hämta alla studenter med kurser (JOIN)
  router.get("/", async (req, res) => {
    try {
      // skapa rows
      const { rows } = await pool.query(`
    SELECT students.*, json_agg(courses.*) AS courses
    FROM students
    LEFT JOIN student_courses ON students.id = student_courses.student_id
    LEFT JOIN courses ON courses.id = student_courses.course_id
    GROUP BY students.id
    `);
      // exempel utan json_agg
      // student: Filip | course: JS
      // student: Filip | course: Backend
      // student: Filip | course: PSQL DB

      // med json_agg:
      // {
      // "student" : "Filip",
      // "courses": ["JS", "Backend", "PSQL DB"]
      // }

      // ge ett response tillbaka
      res.status(200).json({
        succes: true,
        message: "Studenter med kurser hämtade",
        data: rows,
      });
    } catch (error) {
      // ge en response när de går sämre
      res.status(500).json({ error: error.message });
    }
  });

  // POST för skapa en ny student + kurser (med transaktion)
  router.post("/", async (req, res) => {
    const { name, email, courseIds } = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN"); //transaktionen startades

      // Skapa en student och retunera id
      const studentRes = await client.query(
        "INSERT INTO students (name, email) VALUES($1, $2) RETURNING *",
        [name, email]
      );

      const studentId = studentRes.rows[0].id;

      //   koppla student till flera kurser
      for (let courseId of courseIds) {
        await client.query(
          "INSERT INTO student_courses (student_id, course_id) VALUES($1, $2)",
          [studentId, courseId]
        );
      }

      await client.query("COMMIT"); // Allt gick bra så vi sparar peramnent i db

      res.status(201).json({
        succes: true,
        message: "Studenten med kurser skapades",
        data: studentRes.rows[0],
      });
    } catch (error) {
      console.error("POST till /students fel!", error);
      res.status(500).json({
        succes: false,
        error: error.message,
      });
    } finally {
      client.release();
    }
  });

  return router;
}
