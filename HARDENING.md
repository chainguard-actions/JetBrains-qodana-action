<!-- markdownlint-disable -->

# Hardening Report: JetBrains--qodana-action/v2026.2.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **JetBrains--qodana-action/v2026.2.1** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Multiple run: blocks directly interpolate ${{ ... }} expressions inside shell command strings, which is a script injection risk. YAML template substitution occurs before the shell parses the string, so any metacharacters in the value are interpreted by the shell.

- release.yml: `run: ./gradlew clean :plugin:build :plugin:publishPlugins -Pgradle.publish.key=${{ secrets.GRADLE_KEY }} -Pgradle.publish.secret=${{ secrets.GRADLE_TOKEN }} -PbuildNumber=${{ env.PATCH_VERSION }}` (sub-rule a)
- release.yml: `run: ./gradlew :plugin:publish -PbuildNumber=${{ env.PATCH_VERSION }}` (sub-rule a)
- release.yml (multiline run): `echo "${{ secrets.GPG_PRIVATE_KEY }}" | gpg --batch --import` (sub-rule a)
- release.yml (multiline run): `mvn versions:set -DnewVersion=${{ env.VERSION }}` and `mvn clean deploy ... -Dgpg.passphrase=${{ secrets.GPG_PASSPHRASE }}` (sub-rule a)
- gradle.yml: `run: ./gradlew :plugin:test -PtestGradleVersion="${{ matrix.gradleVersion }}"` (sub-rule a)
- node.yml: `run: cat ${{ runner.temp }}/qodana/results/log/idea.log` (sub-rule a)

Locations:

- `.github/workflows/release.yml:27`
- `.github/workflows/release.yml:29`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:72`
- `.github/workflows/gradle.yml:47`
- `.github/workflows/node.yml:234`

### unpinned-uses (severity: high)

All workflow files reference external actions using mutable tags or branch names instead of immutable 40-character commit SHA digests. This exposes the workflow to supply-chain attacks if the referenced tag or branch is moved to a malicious commit.

Examples of unpinned references found:
- branch.yml: `actions/checkout@master`, `connor-baer/action-sync-branch@main`
- code-quality.yml: `actions/checkout@v6`
- gradle.yml: `actions/checkout@v6`, `gradle/wrapper-validation-action@v3.5.0`, `actions/setup-java@v5`, `actions/setup-node@v6`, `actions/upload-artifact@v7`
- maven.yml: `actions/checkout@v6`, `actions/setup-java@v5`, `actions/upload-artifact@v5`
- node.yml: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`, `dorny/paths-filter@v4`, `actions/setup-go@v6`
- release.yml: `actions/checkout@v6`, `actions/setup-java@v5`, `actions/setup-node@v6`
- tag.yml: `actions/checkout@v6`

Locations:

- `.github/workflows/branch.yml:13`
- `.github/workflows/branch.yml:14`
- `.github/workflows/code-quality.yml:14`
- `.github/workflows/gradle.yml:27`
- `.github/workflows/gradle.yml:29`
- `.github/workflows/gradle.yml:40`
- `.github/workflows/gradle.yml:42`
- `.github/workflows/gradle.yml:48`
- `.github/workflows/maven.yml:27`
- `.github/workflows/maven.yml:29`
- `.github/workflows/maven.yml:55`
- `.github/workflows/node.yml:37`
- `.github/workflows/node.yml:41`
- `.github/workflows/node.yml:73`
- `.github/workflows/node.yml:77`
- `.github/workflows/node.yml:83`
- `.github/workflows/node.yml:228`
- `.github/workflows/node.yml:230`
- `.github/workflows/node.yml:241`
- `.github/workflows/node.yml:247`
- `.github/workflows/release.yml:19`
- `.github/workflows/release.yml:21`
- `.github/workflows/release.yml:36`
- `.github/workflows/release.yml:44`
- `.github/workflows/release.yml:46`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:65`
- `.github/workflows/tag.yml:12`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all unpinned action references across 7 workflow files (branch.yml, code-quality.yml, gradle.yml, maven.yml, node.yml, release.yml, tag.yml) by pinning to full 40-character commit SHAs. Fixed all 6 script injection locations by moving ${{ secrets.* }}, ${{ env.* }}, ${{ matrix.* }}, and ${{ runner.* }} expressions out of run: shell strings and into step env: blocks, then referencing them as plain environment variables ($VAR_NAME) in the shell commands.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/.github/workflows/tag.yml line 19: replaced `TAG_REF=${{ github.ref }}` with `TAG_REF=$GITHUB_REF`. The GITHUB_REF environment variable is automatically provided by GitHub Actions with the same value, but is read by the shell at runtime as an environment variable rather than being template-substituted into the script text, preventing any shell metacharacters in the ref from being interpreted as commands.

