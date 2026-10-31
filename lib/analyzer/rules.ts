import type { Evidence, SecurityRule } from "./types";

function matches(regex: RegExp, source: string): Evidence[] {
  regex.lastIndex = 0;
  return Array.from(source.matchAll(regex)).map((match) => ({
    index: match.index ?? 0,
    length: match[0].length,
    match: match[0],
  }));
}

function combine(...groups: Evidence[][]): Evidence[] {
  return groups.flat().sort((a, b) => a.index - b.index);
}

const sqlTemplate = new RegExp(
  "\\b(?:query|execute)\\s*\\(\\s*\\x60[^\\x60]*\\$\\{[^}]+\\}[^\\x60]*\\x60",
  "g",
);
const sqlConcatenation =
  /\b(?:query|execute)\s*\(\s*(?:(?:"[^"\r\n]*"|'[^'\r\n]*')\s*\+|[\w.]+\s*\+\s*["'])/g;

const commandTemplate = new RegExp(
  "\\bexec(?:Sync)?\\s*\\(\\s*\\x60[^\\x60]*\\$\\{[^}]+\\}[^\\x60]*\\x60",
  "g",
);
const commandConcatenation =
  /\bexec(?:Sync)?\s*\(\s*(?:(?:"[^"\r\n]*"|'[^'\r\n]*')\s*\+|[\w.]+\s*\+\s*["'])/g;

export const securityRules: SecurityRule[] = [
  {
    id: "sql-injection",
    title: "SQL query built from untrusted input",
    severity: "critical",
    cwe: "CWE-89",
    owasp: "A03:2021 Injection",
    explanation:
      "This query mixes data into SQL text. The database cannot distinguish the intended query from input that contains SQL syntax.",
    impact:
      "An attacker may read, change, or delete records and can sometimes bypass authentication.",
    remediation:
      "Keep the SQL statement constant and pass every untrusted value through the database driver's parameter array.",
    attackExample:
      "A value such as ' OR 1=1 -- can change the meaning of a string-built WHERE clause.",
    detect: (source) =>
      combine(
        matches(sqlTemplate, source),
        matches(sqlConcatenation, source),
      ),
    fix: (source) => {
      const templatePattern = new RegExp(
        "(\\b[\\w.]+(?:query|execute)\\s*\\()\\s*\\x60([^\\x60]*)\\$\\{([^}]+)\\}([^\\x60]*)\\x60\\s*(\\))",
        "g",
      );

      let fixed = source.replace(
        templatePattern,
        (
          _match: string,
          start: string,
          before: string,
          expression: string,
          after: string,
          end: string,
        ) => {
          const query = (before + "$1" + after)
            .replace(/'\$1'/g, "$1")
            .replace(/"\$1"/g, "$1");
          return (
            start +
            JSON.stringify(query) +
            ", [" +
            expression.trim() +
            "]" +
            end
          );
        },
      );

      fixed = fixed.replace(
        /(\b[\w.]+(?:query|execute)\s*\()\s*(["'])([^\r\n]*?)\2\s*\+\s*([^)]+)(\))/g,
        (
          _match: string,
          start: string,
          _quote: string,
          query: string,
          expression: string,
          end: string,
        ) => {
          const parameterizedQuery = query.replace(/['"]\s*$/, "") + "$1";
          return (
            start +
            JSON.stringify(parameterizedQuery) +
            ", [" +
            expression.trim() +
            "]" +
            end
          );
        },
      );

      return fixed === source ? null : fixed;
    },
  },
  {
    id: "cross-site-scripting",
    title: "Untrusted content written as HTML",
    severity: "high",
    cwe: "CWE-79",
    owasp: "A03:2021 Injection",
    explanation:
      "innerHTML asks the browser to parse a string as markup. If any part of that string is user-controlled, scripts and event handlers can be injected.",
    impact:
      "Injected JavaScript can act as the signed-in user, steal data visible to the page, or alter the interface.",
    remediation:
      "Use textContent for plain text. If HTML is an actual product requirement, sanitize it with a strict allowlist.",
    attackExample:
      "The harmless string <img src=x onerror=alert('demo')> demonstrates that event handlers become executable markup.",
    detect: (source) => matches(/\.\s*innerHTML\s*=/g, source),
    fix: (source) => {
      const fixed = source.replace(/\.\s*innerHTML\s*=/g, ".textContent =");
      return fixed === source ? null : fixed;
    },
  },
  {
    id: "command-injection",
    title: "Shell command contains dynamic input",
    severity: "critical",
    cwe: "CWE-78",
    owasp: "A03:2021 Injection",
    explanation:
      "exec sends one combined string to a shell. Shell metacharacters inside a dynamic value can create additional commands.",
    impact:
      "An attacker may run operating-system commands with the application's permissions.",
    remediation:
      "Call the executable directly with execFile or spawn and pass values as a separate argument array.",
    attackExample:
      "A filename such as image.png; echo demo adds a second shell command when interpolated into exec.",
    detect: (source) =>
      combine(
        matches(commandTemplate, source),
        matches(commandConcatenation, source),
      ),
    fix: (source) => {
      const hadExecFile = /\bexecFile\b/.test(source);
      const pattern = new RegExp(
        "\\bexec(?:Sync)?\\s*\\(\\s*\\x60([^\\x60$]*)\\$\\{([^}]+)\\}([^\\x60]*)\\x60\\s*\\)",
        "g",
      );
      let fixed = source.replace(
        pattern,
        (
          _match: string,
          prefix: string,
          expression: string,
          suffix: string,
        ) => {
          const prefixParts = prefix.trim().split(/\s+/).filter(Boolean);
          const executable = prefixParts.shift();
          if (!executable) return _match;
          const args = [
            ...prefixParts.map((part) => JSON.stringify(part)),
            expression.trim(),
            ...suffix
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .map((part) => JSON.stringify(part)),
          ];
          return "execFile(" + JSON.stringify(executable) + ", [" + args.join(", ") + "])";
        },
      );

      fixed = fixed.replace(
        /\bexec(?:Sync)?\s*\(\s*(["'])([^\r\n]*?)\1\s*\+\s*([^)]+)\)/g,
        (
          _match: string,
          _quote: string,
          prefix: string,
          expression: string,
        ) => {
          const prefixParts = prefix.trim().split(/\s+/).filter(Boolean);
          const executable = prefixParts.shift();
          if (!executable) return _match;
          const args = [
            ...prefixParts.map((part) => JSON.stringify(part)),
            expression.trim(),
          ];
          return "execFile(" + JSON.stringify(executable) + ", [" + args.join(", ") + "])";
        },
      );

      if (fixed === source) return null;
      if (!hadExecFile) {
        const declaration = /\bimport\s/.test(source)
          ? 'import { execFile } from "node:child_process";\n'
          : 'const { execFile } = require("node:child_process");\n';
        fixed = declaration + fixed;
      }
      return fixed;
    },
  },
  {
    id: "path-traversal",
    title: "User-controlled value used in a file path",
    severity: "high",
    cwe: "CWE-22",
    owasp: "A01:2021 Broken Access Control",
    explanation:
      "Joining a base directory with an unchecked filename does not guarantee the result stays inside that directory.",
    impact:
      "Values containing ../ segments may expose configuration, source code, credentials, or other local files.",
    remediation:
      "Reduce the value to a filename, resolve the final path, and verify that it remains below the intended base directory.",
    attackExample:
      "The value ../../package.json attempts to walk out of the public upload directory.",
    detect: (source) =>
      matches(
        /path\.(?:join|resolve)\(\s*[^,\n]+,\s*[^)\n]*(?:req\.(?:query|params|body)|user|input|filename)[^)\n]*\)/g,
        source,
      ).filter((item) => !/\bpath\.basename\s*\(/.test(item.match)),
    fix: (source) => {
      const fixed = source.replace(
        /(path\.(?:join|resolve)\(\s*[^,\n]+,\s*)(?!path\.basename\()([^) \n]+)(\))/g,
        "$1path.basename($2)$3",
      );
      return fixed === source ? null : fixed;
    },
  },
  {
    id: "hardcoded-secret",
    title: "Secret stored directly in source code",
    severity: "high",
    cwe: "CWE-798",
    owasp: "A07:2021 Identification and Authentication Failures",
    explanation:
      "Credentials committed in source tend to spread through Git history, build logs, copied snippets, and deployed bundles.",
    impact:
      "Anyone who can read the source may use the credential until it is rotated.",
    remediation:
      "Load secrets from the runtime environment or a managed secret store, and rotate any value that has already been committed.",
    attackExample:
      "A copied repository or leaked build artifact is enough to recover the literal credential.",
    detect: (source) =>
      matches(
        /\b(?:const|let|var)\s+[A-Z0-9_]*(?:SECRET|TOKEN|API_KEY|PASSWORD)[A-Z0-9_]*\s*=\s*["'][^"'\r\n]{8,}["']/gi,
        source,
      ),
    fix: (source) => {
      const fixed = source.replace(
        /\b(const|let|var)\s+([A-Z0-9_]*(?:SECRET|TOKEN|API_KEY|PASSWORD)[A-Z0-9_]*)\s*=\s*["'][^"'\r\n]{8,}["']\s*;?/gi,
        (_match: string, declaration: string, name: string) =>
          declaration + " " + name + " = process.env." + name + ";",
      );
      return fixed === source ? null : fixed;
    },
  },
  {
    id: "weak-hash",
    title: "Deprecated hashing algorithm",
    severity: "medium",
    cwe: "CWE-328",
    owasp: "A02:2021 Cryptographic Failures",
    explanation:
      "MD5 and SHA-1 have known collision weaknesses and are not suitable for security-sensitive integrity checks.",
    impact:
      "An attacker may create different content with the same digest. Fast hashes are also unsuitable for password storage.",
    remediation:
      "Use SHA-256 or stronger for integrity. For passwords, use Argon2id, scrypt, or bcrypt with an appropriate work factor.",
    attackExample:
      "Publicly known collision samples show two different inputs producing the same MD5 digest.",
    detect: (source) =>
      matches(/\bcreateHash\(\s*["'](?:md5|sha1)["']\s*\)/gi, source),
    fix: (source) => {
      const fixed = source.replace(
        /\bcreateHash\(\s*["'](?:md5|sha1)["']\s*\)/gi,
        'createHash("sha256")',
      );
      return fixed === source ? null : fixed;
    },
  },
  {
    id: "jwt-algorithm",
    title: "JWT verification does not pin an algorithm",
    severity: "high",
    cwe: "CWE-347",
    owasp: "A07:2021 Identification and Authentication Failures",
    explanation:
      "Verification without an explicit algorithm allowlist trusts more token configurations than the application intends.",
    impact:
      "A verification confusion bug or future configuration change may allow forged tokens to be accepted.",
    remediation:
      "Pin the exact expected algorithm and validate issuer and audience for tokens that cross trust boundaries.",
    attackExample:
      "A token with an unexpected alg header probes whether the verifier accepts a weaker configuration.",
    detect: (source) =>
      matches(
        /\bjwt\.verify\(\s*[^,\n]+,\s*[^,)\n]+\s*\)/g,
        source,
      ),
    fix: (source) => {
      const fixed = source.replace(
        /\bjwt\.verify\(\s*([^,\n]+),\s*([^,)\n]+)\s*\)/g,
        'jwt.verify($1, $2, { algorithms: ["HS256"] })',
      );
      return fixed === source ? null : fixed;
    },
  },
  {
    id: "open-redirect",
    title: "Redirect target comes from the request",
    severity: "medium",
    cwe: "CWE-601",
    owasp: "A01:2021 Broken Access Control",
    explanation:
      "Redirecting directly to a request value allows another person to choose where your trusted domain sends a user.",
    impact:
      "Attackers can create convincing phishing links that begin on the legitimate application domain.",
    remediation:
      "Allow only known destinations, or accept local paths that begin with one slash and reject protocol-relative URLs.",
    attackExample:
      "A next value of //example.invalid makes the browser leave the application while preserving a trusted-looking link.",
    detect: (source) =>
      matches(
        /\b(?:res|response)\.redirect\(\s*req\.(?:query|params|body)\.[\w$]+\s*\)/g,
        source,
      ),
    fix: (source) => {
      const fixed = source.replace(
        /\b((?:res|response)\.redirect)\(\s*(req\.(?:query|params|body)\.[\w$]+)\s*\)/g,
        '$1(typeof $2 === "string" && $2.startsWith("/") && !$2.startsWith("//") ? $2 : "/")',
      );
      return fixed === source ? null : fixed;
    },
  },
  {
    id: "permissive-cors",
    title: "CORS allows every origin",
    severity: "medium",
    cwe: "CWE-942",
    owasp: "A05:2021 Security Misconfiguration",
    explanation:
      "A wildcard or default-open CORS policy lets JavaScript on any website make browser requests to this API.",
    impact:
      "If responses contain sensitive data or credentials are later enabled, an untrusted site may gain access.",
    remediation:
      "Set an explicit origin allowlist from configuration and enable credentials only when the product requires them.",
    attackExample:
      "A page hosted on an unrelated domain can call the API from a visitor's browser when the policy is open.",
    detect: (source) =>
      combine(
        matches(/\bcors\(\s*\)/g, source),
        matches(/\borigin\s*:\s*["']\*["']/g, source),
      ),
    fix: (source) => {
      let fixed = source.replace(
        /\bcors\(\s*\)/g,
        "cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true })",
      );
      fixed = fixed.replace(
        /\borigin\s*:\s*["']\*["']/g,
        "origin: process.env.ALLOWED_ORIGIN",
      );
      return fixed === source ? null : fixed;
    },
  },
];
