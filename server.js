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
        "SELECT * FROM sports ORDER BY createdat DESC; SELECT * FROM tcgs ORDER BY createdat DESC;";

    pool.query(sql, (err, result) => {
        if (err) {
        console.error("Error executing query", err.stack);
        res.status(500).json({ error: "Internal Server Error" });
        } else {
        console.log("Query successful, sending response");
        res.status(200).json(result[0].rows.concat(result[1].rows));
        }
    });
});

app.post("/api/cards/sports", (req, res) => {
    const data = [
        req.body.category,
        req.body.playerName,
        req.body.sport,
        req.body.year,
        req.body.brand,
        req.body.cardNumber,
        req.body.condition,
        req.body.price,
        req.body.description,
    ];
    const sql =
        "INSERT INTO sports (category, playerName, sport, year, brand, cardNumber, condition, price, description, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, Now())";

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
app.post("/api/cards/tcgs", (req, res) => {
    const data = [
        req.body.category,
        req.body.cardName,
        req.body.tcg,
        req.body.set,
        req.body.year,
        req.body.cardNumber,
        req.body.condition,
        req.body.price,
        req.body.description,
    ];
    const sql =
        "INSERT INTO tcgs (category, cardname, tcg, set, year, cardNumber, condition, price, description, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, Now())";
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
