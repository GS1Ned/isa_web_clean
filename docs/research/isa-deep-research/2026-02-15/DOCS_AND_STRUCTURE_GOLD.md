# Docs and Structure Gold Standards

Last verified date: 2026-02-15

## FACT
- Examples below are OSS repositories with proven scalable documentation and decision-record architectures.

## INTERPRETATION
- ISA benefits from doc structures that separate governance/spec/how-to, plus decision records that keep change auditable.

## RECOMMENDATION
- Adopt a minimal doc IA and enforce it with CI checks (allowed paths, link checks, schema validation).

## Backstage (docs IA + plugin modularity)

- Source: https://github.com/backstage/backstage
- Example file tree (summarised):
```text
ADOPTERS.md
CODE_OF_CONDUCT.md
CONTRIBUTING.md
DCO
LABELS.md
LICENSE
NOTICE
OWNERS.md
README-fr_FR.md
README-ko_kr.md
README-zh_Hans.md
README.md
REVIEWING.md
SECURITY.md
STYLE.md
app-config.docker.yaml
app-config.yaml
beps/
beps/0001-notifications-system/
beps/0002-dynamic-frontend-plugins/
beps/0003-auth-architecture-evolution/
beps/0004-scaffolder-task-idempotency/
beps/0005-split-backend-discovery/
beps/0006-scaffolder-action-rollback/
beps/0007-auth-external-services/
```
- Key paths to inspect:
  - README.md
  - docs/
  - CODEOWNERS
  - .github/workflows/
- Known weakness: Large monorepo can become heavy without strict tooling and ownership boundaries.
- Evidence links:
  - GitHub repository: Backstage repo landing: https://github.com/backstage/backstage (date: 2026-02-15T15:36:16Z)

Last verified date: 2026-02-15

## OPA (deep docs tree + operations guidance)

- Source: https://github.com/open-policy-agent/opa
- Example file tree (summarised):
```text
ADOPTERS.md
AGENTS.md
CHANGELOG.md
CODE_OF_CONDUCT.md
COMMUNITY_GUIDELINES.md
CONTRIBUTING.md
Dockerfile
GOVERNANCE.md
LICENSE
MAINTAINERS.md
Makefile
README.md
SECURITY.md
SECURITY_AUDIT.pdf
ast/
ast/annotations.go
ast/builtins.go
ast/capabilities.go
ast/check.go
ast/compare.go
ast/compile.go
ast/compile_test.go
ast/compilehelper.go
ast/compilehelper_test.go
ast/conflicts.go
```
- Key paths to inspect:
  - README.md
  - docs/docs/policy-language.md
  - docs/devel/DEVELOPMENT.md
  - .github/workflows/
- Known weakness: Policy flexibility can encourage inconsistent patterns without strong conventions.
- Evidence links:
  - GitHub repository: OPA repo landing: https://github.com/open-policy-agent/opa (date: 2026-02-14T15:51:00Z)

Last verified date: 2026-02-15

## Kubernetes Enhancements (KEPs as decision records)

- Source: https://github.com/kubernetes/enhancements
- Example file tree (summarised):
```text
CONTRIBUTING.md
EXCEPTIONS.md
LICENSE
Makefile
OWNERS
OWNERS_ALIASES
README.md
SECURITY.md
SECURITY_CONTACTS
api/
api/OWNERS
api/apifakes/
api/approval.go
api/approval_test.go
api/document.go
api/error.go
api/groups.go
api/proposal.go
cmd/
cmd/OWNERS
cmd/kepctl/
cmd/kepify/
code-of-conduct.md
compile-tools
docs/
```
- Key paths to inspect:
  - keps/
  - README.md
- Known weakness: Process overhead; needs strict scoping to avoid slowing delivery.
- Evidence links:
  - GitHub repository file: kubernetes/enhancements README: https://github.com/kubernetes/enhancements/blob/master/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15

## Rust RFCs (RFC-driven evolution)

- Source: https://github.com/rust-lang/rfcs
- Example file tree (summarised):
```text
0000-template.md
LICENSE-APACHE
LICENSE-MIT
README.md
book.toml
compiler_changes.md
generate-book.py
lang_changes.md
libs_changes.md
text/
text/0001-private-fields.md
text/0002-rfc-process.md
text/0003-attribute-usage.md
text/0008-new-intrinsics.md
text/0016-more-attributes.md
text/0019-opt-in-builtin-traits.md
text/0026-remove-priv.md
text/0034-bounded-type-parameters.md
text/0040-libstd-facade.md
text/0042-regexps.md
text/0048-traits.md
text/0049-match-arm-attributes.md
text/0050-assert.md
text/0059-remove-tilde.md
text/0060-rename-strbuf.md
```
- Key paths to inspect:
  - text/
  - README.md
- Known weakness: RFC process overhead; requires triage and clear acceptance criteria.
- Evidence links:
  - GitHub repository file: rust-lang/rfcs README: https://github.com/rust-lang/rfcs/blob/master/README.md (date: UNVERIFIED (reason: date not retrieved))

Last verified date: 2026-02-15
