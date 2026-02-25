console.log("Test running");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let scores = [];

app.post("/save-score", (req, res) => {
    const { score } = req.body;
    scores.push(score);
    console.log("Scores:", scores);
    res.json({ message: "Score saved" });
});

app.get("/scores", (req, res) => {
    res.json(scores);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});