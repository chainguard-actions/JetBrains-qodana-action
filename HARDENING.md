<!-- markdownlint-disable -->

# Hardening Report: JetBrains--qodana-action/v2026.1.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **JetBrains--qodana-action/v2026.1.0** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Direct ${{ ... }} expression interpolation inside run: shell commands. Sub-rule (a): any ${{ }} expression in a run: block is a script injection risk because the value is substituted into the shell command string before the shell parses it.

- tag.yml line 18: `TAG_REF=${{ github.ref }}` — github.ref is attacker-influenced (tag name) and interpolated directly into the shell script.
- gradle.yml line 46: `./gradlew :plugin:test -PtestGradleVersion="${{ matrix.gradleVersion }}"` — matrix context interpolated directly.
- node.yml (~line 278): `run: cat ${{ runner.temp }}/qodana/results/log/idea.log` — runner context interpolated directly.
- release.yml (~line 22): `./gradlew clean :plugin:build :plugin:publishPlugins -Pgradle.publish.key=${{ secrets.GRADLE_KEY }} -Pgradle.publish.secret=${{ secrets.GRADLE_TOKEN }} -PbuildNumber=${{ env.PATCH_VERSION }}` — secrets and env context interpolated directly into a run: command.

Locations:

- `.github/workflows/tag.yml:18`
- `.github/workflows/gradle.yml:46`
- `.github/workflows/node.yml:278`
- `.github/workflows/release.yml:22`

### unpinned-uses (severity: high)

All uses: references across workflow files use mutable tag or branch refs instead of immutable 40-character SHA commit hashes. This exposes the workflows to supply-chain attacks if any referenced action is compromised or its tag is moved.

Failing references:
- branch.yml: `actions/checkout@master`, `connor-baer/action-sync-branch@main`
- code-quality.yml: `actions/checkout@v6`
- gradle.yml: `actions/checkout@v6`, `gradle/wrapper-validation-action@v3.5.0`, `actions/setup-java@v5`, `actions/upload-artifact@v7`
- node.yml: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`, `dorny/paths-filter@v4`, `actions/setup-go@v6`
- release.yml: `actions/checkout@v6`, `actions/setup-java@v5`, `actions/setup-node@v6`
- tag.yml: `actions/checkout@v6`

Locations:

- `.github/workflows/branch.yml:12`
- `.github/workflows/branch.yml:13`
- `.github/workflows/code-quality.yml:14`
- `.github/workflows/gradle.yml:27`
- `.github/workflows/gradle.yml:29`
- `.github/workflows/gradle.yml:38`
- `.github/workflows/gradle.yml:48`
- `.github/workflows/node.yml:36`
- `.github/workflows/node.yml:41`
- `.github/workflows/node.yml:56`
- `.github/workflows/node.yml:65`
- `.github/workflows/node.yml:232`
- `.github/workflows/node.yml:237`
- `.github/workflows/node.yml:258`
- `.github/workflows/release.yml:12`
- `.github/workflows/release.yml:17`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:40`
- `.github/workflows/tag.yml:14`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed all script injection issues by moving ${{ }} expressions from run: blocks into step env: blocks and referencing them as plain shell variables. Fixed all 19 unpinned uses: references across branch.yml, code-quality.yml, gradle.yml, node.yml, release.yml, and tag.yml by resolving each tag/branch to its immutable 40-character SHA commit hash using lookup_action_sha. Original tag names preserved as inline comments.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/.github/workflows/tag.yml by double-quoting all unquoted variable expansions of $BRANCH_NAME and $TAG_NAME in shell commands: `git ls-remote --heads origin "$BRANCH_NAME"`, `git checkout -b "$BRANCH_NAME"`, `git checkout "$BRANCH_NAME"`, `git reset --hard "$TAG_NAME"`, and `git push -u origin "$BRANCH_NAME" --force`. The github.ref expression was already correctly isolated in the env block as TAG_REF.

