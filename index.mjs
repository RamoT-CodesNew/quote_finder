import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const conn = await mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",   // empty if you didn’t set one
  database: "famous_quotes",
  port: 3306
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/dbTest", async (req, res) => {
  let sql = "SELECT CURDATE() AS today";
  let [rows] = await conn.query(sql);
  res.send(rows);
});

app.get("/", async (req, res) => {
  let sqlAuthors = "SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName";
  let [authors] = await conn.query(sqlAuthors);

  let sqlCategories = "SELECT DISTINCT category FROM q_quotes ORDER BY category";
  let [categories] = await conn.query(sqlCategories);

  res.render("index", { authors, categories });
});

app.get("/searchByKeyword", async (req, res) => {
  let userKeyword = req.query.keyword || "";
  let sql = `SELECT quote, authorId, firstName, lastName
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE quote LIKE ?`;
  let sqlParams = ["%" + userKeyword + "%"];
  let [rows] = await conn.query(sql, sqlParams);
  res.render("results", { quotes: rows });
});

app.get("/searchByAuthor", async (req, res) => {
  let authorId = req.query.authorId;
  let sql = `SELECT quote, authorId, firstName, lastName
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE authorId = ?`;
  let [rows] = await conn.query(sql, [authorId]);
  res.render("results", { quotes: rows });
});

app.get("/searchByCategory", async (req, res) => {
  let category = req.query.category;
  let sql = `SELECT quote, authorId, firstName, lastName
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE category = ?`;
  let [rows] = await conn.query(sql, [category]);
  res.render("results", { quotes: rows });
});

app.get("/searchByLikes", async (req, res) => {
  let minLikes = req.query.minLikes || 0;
  let maxLikes = req.query.maxLikes || 999999;
  let sql = `SELECT quote, authorId, firstName, lastName
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE likes BETWEEN ? AND ?`;
  let [rows] = await conn.query(sql, [minLikes, maxLikes]);
  res.render("results", { quotes: rows });
});

app.get("/api/author/:id", async (req, res) => {
  let authorId = req.params.id;
  let sql = "SELECT * FROM q_authors WHERE authorId = ?";
  let [rows] = await conn.query(sql, [authorId]);
  res.send(rows);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port " + port);
});
