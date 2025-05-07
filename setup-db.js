import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
});

async function setupDatabase() {
  try {
    await pool.query("BEGIN"); //transaktionen startades

    // students table , key/enteties= id=siffra, PK. name=text, max 40, email= text, max 40
    // const studentTable =
    await pool.query(
      "CREATE TABLE IF NOT EXISTS students (id SERIAL PRIMARY KEY, name VARCHAR(40), email VARCHAR(40) UNIQUE)"
    );

    // courses table, key/enteties= id=siffra, PK. title=text, max 100, description= text
    await pool.query(
      "CREATE TABLE IF NOT EXISTS courses (id SERIAL PRIMARY KEY, title VARCHAR(100), description TEXT NOT NULL)"
    );

    // user_courses EN junction table , den kommer vara en many-to-many table.
    await pool.query(`
            CREATE TABLE student_courses (
            student_id INTEGER REFERENCES students(id),
            course_id INTEGER REFERENCES courses(id),
            PRIMARY KEY (student_id, course_id)
            )`);

    await pool.query(`CREATE INDEX idx_student_email ON students(email)`);
    await pool.query(
      `CREATE INDEX idx_student_courses_student_id ON student_courses(student_id)`
    );

    //transaktionen bekräfta ändringar , eller vid fel
    await pool.query("COMMIT"); //transaktionen startades
    console.log("Databes med tabeller är uppsatta!");
  } catch (error) {
    await pool.query("ROLLBACK"); // Åteställ databasen till det tillstånd den var innan transaktionen börjades, vid fel. Fördel med detta är att databasens integritet bibehålls

    console.error("Fel vid uppsättninga av databasens tabeller", error);
  } finally {
    pool.end(); // avsluta anslutningen
  }
}

setupDatabase();
