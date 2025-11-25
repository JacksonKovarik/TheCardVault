const express = require("express");
const bodyParser = require("body-parser");

const Pool = require("pg").Pool;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DB_CONN || "postgres://postgres:password@localhost:5432/postgres",
});

app.get("/api/cards", (req, res) => {
    const sql =
        "SELECT * FROM cards ORDER BY createdat DESC;";

    pool.query(sql, (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            console.log("Query successful, sending response\n");
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
        "INSERT INTO cards (category, cardName, type, year, brand, cardNumber, condition, price, description, imageurl, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, Now())";

    pool.query(sql, data, (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            console.log("Query successful, sending response\n");
            res.status(200).json(result.rows);
        }
    });
});

app.delete("/api/cards", (req, res) => {
    console.log("Received delete request");
    
    const sql = "DELETE FROM cards WHERE id =  $1";
    const data = [req.body.id];
    pool.query(sql, data, (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            console.log("Query successful, sending response\n");
            res.status(200).json(result.rows);
        }
    });
});


app.post("/api/users/sign-up", (req, res) => {
    console.log("Received sign-up request");
    const email = [
        req.body.email
    ]
    const sql1 =
        "SELECT * FROM users WHERE email = $1;";

    pool.query(sql1, email, (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).json({ error: "Internal Server Error" });
        } else if (result.rows && result.rows.length > 0) {
            res.status(409).json({ error: "User already exists" });
        } else {
            const data = [
                req.body.username,
                req.body.email,
                req.body.pwd
            ];
            const sql2 = "INSERT INTO users (username, email, pwd, createdat) VALUES ($1, $2, $3, Now())";
            pool.query(sql2, data, (err, result) => {
                if (err) {
                    console.error("Error executing query", err.stack);
                    res.status(500).json({ error: "Internal Server Error" });
                } else {
                    console.log("Query successful, sending response\n");
                    res.status(200).json(result.rows);
                }
            });
            
        }
    });
});

app.post("/api/users/login", (req, res) => {
    console.log("Received login request");
    const email = [
        req.body.email,
    ];
    const sql =
        "SELECT pwd,username FROM users WHERE email = $1";

    pool.query(sql, email, (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).json({ error: "Internal Server Error" });
        } else if (!result.rows || result.rows.length === 0) {
            res.status(404).json({ error: "User not found" });
        } else if (result.rows[0].pwd !== req.body.password) {
            res.status(401).json({ error: "Invalid password" });
        } else {
            console.log("Query successful, sending response\n");
            res.status(200).json(result.rows[0].username);
        }
    });
});

app.listen(80, () => {
    console.log("Server is running on port 80");
});
