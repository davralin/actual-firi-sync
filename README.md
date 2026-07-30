# New Repository Setup

This repository includes inherited operational standards and ADRs.

Use the ADRs first. Workflows and config follow repository decisions, not the other way around.

## Setup Order

1. Read `adr/`.
2. Add repo-specific ADRs for durable decisions.
3. Define artifacts and deployable process responsibilities.
4. Keep the active single-image workflow unless a later ADR justifies a different topology.
5. Replace this README with repo-specific usage and development docs.
6. Replace placeholders that depend on repo-specific architecture.
7. Update `.github/CODEOWNERS` for the repo owner/team.
8. Add app source, build, lint, test, package, and runtime files.

## Decisions To Record

- What the repo builds and releases.
- What deployable process responsibilities exist.
- Whether the repo publishes release container images.
- Release cadence and tag policy.
- Vulnerability scan posture.
- Renovate automerge posture.
- Deployment artifact policy.

## Before First Commit

- Every durable repo-specific choice is captured in an ADR.
- Inherited ADRs are accepted or superseded by later ADRs.
- Workflows reflect the ADR-defined deployable units.
- Placeholder values are replaced.
- No workflow or config exists without a repository decision behind it.
