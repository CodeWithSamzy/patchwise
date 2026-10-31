# Security policy

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could put Patchwise users or deployments at risk.

After the repository is published, enable GitHub private vulnerability reporting under Settings, Security, Code security and use the repository's Report a vulnerability button.

Until that channel is configured, contact the repository owner privately through the contact method listed on their GitHub profile. Include:

- the affected version or commit;
- a minimal reproduction with all secrets removed;
- the expected security impact;
- any suggested remediation.

## Scope

Security reports may cover the web application, API, rule engine, verified-fix process, deployment configuration, dependency chain, or a way submitted code could be executed or disclosed.

Patchwise never intentionally executes submitted source. A report showing code execution, durable unintended retention, or cross-user access should be treated as high priority.

## Supported versions

Until the first stable release, only the latest commit on main is supported.
