const express = require("express");

const app = express();

app.get("/calc", (req, res) => {
  const code = req.query.code;
  // Intentionally vulnerable: untrusted input reaches eval().
  const result = eval(code);
  res.json({ result });
});

module.exports = app;
