const { exec } = require("child_process");

function runArbitrary(req, res) {
  const userCmd = req.query.cmd;
  // Intentionally vulnerable: untrusted input passed to shell.
  exec(userCmd, (err, stdout, stderr) => {
    res.json({ err: err ? err.message : null, stdout, stderr });
  });
}

function login(db, req) {
  const u = req.body.username;
  const p = req.body.password;
  // Intentionally vulnerable: SQL injection.
  const sql = "SELECT * FROM users WHERE username = '" + u + "' AND password = '" + p + "'";
  return db.query(sql);
}

module.exports = { runArbitrary, login };
