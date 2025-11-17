const express = require("express");
const bodyParser = require("body-parser");

const Pool = require("pg").Pool;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DB_CONN,
});

app.get("/api/cards", (req, res) => {
    const sql =
        "SELECT * FROM cards ORDER BY createdat DESC;";

    pool.query(sql, (err, result) => {
        if (err) {
        console.error("Error executing query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
        } else {
        console.log("Query successful, sending response");
        res.status(200).json(result.rows);
        }
    });
});

app.post("/api/cards", (req, res) => {
    const data = [
        req.body.category,
        req.body.cardName,
        req.body.type,
        req.body.year,
        req.body.brand,
        req.body.cardNumber,
        req.body.condition,
        req.body.price,
        req.body.description,
        req.body.imageUrl
    ];
    const sql =
        "INSERT INTO cards (category, cardName, type, year, brand, cardNumber, condition, price, description, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, Now())";

    pool.query(sql, data, (err, result) => {
        if (err) {
        console.error("Error executing query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
        } else {
        console.log("Query successful, sending response");
        res.status(200).json(result.rows);
        }
    });
});

app.delete("/api/cards", (req, res) => {
    const data = [
        req.body.cardName,
        req.body.cardNumber,
        req.body.type,
        req.body.brand,
        req.body.year
    ]
    const sql = "DELETE FROM cards WHERE cardName = $1 AND cardNumber = $2 AND type = $3 AND brand = $4 AND year = $5";
    pool.query(sql, data, (err, result) => {
        if (err) {
        console.error("Error executing query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
        } else {
        console.log("Query successful, sending response");
        res.status(200).json(result.rows);
        }
    });
});

app.listen(80, () => {
    console.log("Server is running on port 80");
});
