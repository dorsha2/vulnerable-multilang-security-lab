const { exec } = require("child_process");

function runUserCommand(req, res) {
  const userCommand = req.query.cmd || "echo safe";
  // Intentionally vulnerable: command injection from user input.
  exec(userCommand, (err, stdout, stderr) => {
    res.json({ err: err ? err.message : null, stdout, stderr });
  });
}

function login(db, req) {
  const username = req.body.username;
  const password = req.body.password;
  // Intentionally vulnerable: SQL injection from user-controlled strings.
  const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return db.query(sql);
}

module.exports = {
  runUserCommand,
  login
};
