import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
};

const conn = await mysql.createPool(poolConfig);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  try {
    const [authors] = await conn.query("SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName");
    const [categories] = await conn.query("SELECT DISTINCT category FROM q_quotes ORDER BY category");
    res.render("index", { authors, categories });
  } catch (err) {
    console.error(err);
    res.render("index", { authors: [], categories: [] });
  }
});

app.get("/searchByKeyword", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const [rows] = await conn.query(
      "SELECT quote, authorId, firstName, lastName FROM q_quotes NATURAL JOIN q_authors WHERE quote LIKE ?",
      [`%${keyword}%`]
    );
    res.render("results", { quotes: rows });
  } catch (err) {
    console.error(err);
    res.render("results", { quotes: [] });
  }
});

app.get("/searchByAuthor", async (req, res) => {
  try {
    const authorId = req.query.authorId;
    const [rows] = await conn.query(
      "SELECT quote, authorId, firstName, lastName FROM q_quotes NATURAL JOIN q_authors WHERE authorId = ?",
      [authorId]
    );
    res.render("results", { quotes: rows });
  } catch (err) {
    console.error(err);
    res.render("results", { quotes: [] });
  }
});

app.get("/searchByCategory", async (req, res) => {
  try {
    const category = req.query.category;
    const [rows] = await conn.query(
      "SELECT quote, authorId, firstName, lastName FROM q_quotes NATURAL JOIN q_authors WHERE category = ?",
      [category]
    );
    res.render("results", { quotes: rows });
  } catch (err) {
    console.error(err);
    res.render("results", { quotes: [] });
  }
});

app.get("/searchByLikes", async (req, res) => {
  try {
    const minLikes = Number(req.query.minLikes || 0);
    const maxLikes = Number(req.query.maxLikes || 999999);
    const [rows] = await conn.query(
      "SELECT quote, authorId, firstName, lastName FROM q_quotes NATURAL JOIN q_authors WHERE likes BETWEEN ? AND ?",
      [minLikes, maxLikes]
    );
    res.render("results", { quotes: rows });
  } catch (err) {
    console.error(err);
    res.render("results", { quotes: [] });
  }
});

app.get("/api/author/:id", async (req, res) => {
  try {
    const [rows] = await conn.query("SELECT * FROM q_authors WHERE authorId = ?", [req.params.id]);
    res.send(rows);
  } catch (err) {
    console.error(err);
    res.send([]);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});
