<!-- markdownlint-disable -->

# Hardening Report: JetBrains--qodana-action/v2025.3.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **JetBrains--qodana-action/v2025.3.1** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Every `uses:` reference across all workflow files uses a mutable tag, branch, or version string instead of a pinned 40-character SHA commit hash, making the workflows vulnerable to supply-chain attacks if any referenced action is compromised or its tag is moved.

Failing references:
- branch.yml: `actions/checkout@master`, `connor-baer/action-sync-branch@main`
- code-quality.yml: `actions/checkout@v6`
- gradle.yml: `actions/checkout@v6`, `gradle/wrapper-validation-action@v3.5.0`, `actions/setup-java@v5`, `actions/upload-artifact@v5`
- node.yml: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v5` (×2), `actions/setup-go@v6`, `dorny/paths-filter@v3`
- release.yml: `actions/checkout@v6` (×3), `actions/setup-java@v5`, `actions/setup-node@v6`
- tag.yml: `actions/checkout@v6`

Locations:

- `.github/workflows/branch.yml:13`
- `.github/workflows/branch.yml:14`
- `.github/workflows/code-quality.yml:17`
- `.github/workflows/gradle.yml:27`
- `.github/workflows/gradle.yml:29`
- `.github/workflows/gradle.yml:40`
- `.github/workflows/gradle.yml:42`
- `.github/workflows/gradle.yml:51`
- `.github/workflows/node.yml:35`
- `.github/workflows/node.yml:40`
- `.github/workflows/node.yml:57`
- `.github/workflows/node.yml:68`
- `.github/workflows/node.yml:196`
- `.github/workflows/node.yml:197`
- `.github/workflows/node.yml:218`
- `.github/workflows/node.yml:228`
- `.github/workflows/node.yml:229`
- `.github/workflows/node.yml:233`
- `.github/workflows/node.yml:249`
- `.github/workflows/release.yml:18`
- `.github/workflows/release.yml:20`
- `.github/workflows/release.yml:33`
- `.github/workflows/release.yml:39`
- `.github/workflows/release.yml:43`
- `.github/workflows/tag.yml:15`

### script-injection (severity: high)

Multiple `run:` blocks directly interpolate `${{ ... }}` expressions (sub-rule a), which causes the expression value to be substituted into the shell command string before the shell parses it, enabling command injection.

1. tag.yml — `TAG_REF=${{ github.ref }}` directly assigns the github.ref context value into a shell variable via template substitution. An attacker who controls the tag name could inject shell metacharacters.

2. gradle.yml — `./gradlew :plugin:test -PtestGradleVersion="${{ matrix.gradleVersion }}"` interpolates the matrix context directly into the shell command.

3. node.yml — `cat ${{ runner.temp }}/qodana/results/log/idea.log` interpolates the runner.temp context directly into the shell command.

4. release.yml — `./gradlew clean :plugin:build :plugin:publishPlugins -Pgradle.publish.key=${{ secrets.GRADLE_KEY }} -Pgradle.publish.secret=${{ secrets.GRADLE_TOKEN }} -PbuildNumber=${{ env.PATCH_VERSION }}` and `./gradlew :plugin:publish -PbuildNumber=${{ env.PATCH_VERSION }}` interpolate secrets and env contexts directly into shell commands.

Locations:

- `.github/workflows/tag.yml:19`
- `.github/workflows/gradle.yml:48`
- `.github/workflows/node.yml:232`
- `.github/workflows/release.yml:24`
- `.github/workflows/release.yml:27`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all unpinned `uses:` references across branch.yml, code-quality.yml, gradle.yml, node.yml, release.yml, and tag.yml by pinning each to its full 40-character commit SHA (with the original tag preserved as a comment). Fixed all script injection vulnerabilities by moving ${{ ... }} expressions from `run:` shell strings into `env:` blocks and referencing them as plain environment variables: github.ref→GIT_REF in tag.yml, matrix.gradleVersion→GRADLE_VERSION in gradle.yml, runner.temp→RUNNER_TEMP in node.yml, and secrets.GRADLE_KEY/GRADLE_TOKEN/env.PATCH_VERSION into env blocks in release.yml.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed 5 unquoted variable expansions in .github/workflows/tag.yml ('Update version branch' step). Added double quotes around $BRANCH_NAME and $TAG_NAME in: `git ls-remote --heads origin "$BRANCH_NAME"` (line 30), `git checkout -b "$BRANCH_NAME"` (line 34), `git checkout "$BRANCH_NAME"` (line 37), `git reset --hard "$TAG_NAME"` (line 42), and `git push -u origin "$BRANCH_NAME" --force` (line 43). The github.ref value was already correctly moved into the env block (GIT_REF); only the downstream shell variable usages needed quoting.

