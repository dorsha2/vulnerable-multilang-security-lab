const express = require("express");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

const JWT_SECRET = "super-weak-secret"; // intentionally insecure

app.get("/eval", (req, res) => {
  const code = req.query.code || "1+1";
  // Code injection vulnerability (intentional)
  const result = eval(code);
  res.json({ result });
});

app.get("/exec", (req, res) => {
  const cmd = req.query.cmd || "echo hello";
  // Command injection vulnerability (intentional)
  exec(cmd, (err, stdout, stderr) => {
    res.json({ err: err ? err.message : null, stdout, stderr });
  });
});

app.post("/token", (req, res) => {
  const user = req.body.user || "guest";
  const token = jwt.sign({ user, admin: true }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "365d"
  });
  res.json({ token });
});

app.listen(3000, () => {
  console.log("Vulnerable app listening on port 3000");
});
