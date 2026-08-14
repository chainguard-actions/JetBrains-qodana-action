<!-- markdownlint-disable -->

# Hardening Report: JetBrains--qodana-action/v2025.2.3

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **JetBrains--qodana-action/v2025.2.3** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Direct ${{ ... }} expression interpolation inside run: shell commands. In tag.yml line 18, `${{ github.ref }}` is interpolated directly into a shell variable assignment (`TAG_REF=${{ github.ref }}`), allowing tag name injection into git commands. In gradle.yml line 46, `${{ matrix.gradleVersion }}` is interpolated directly into a run: command (`-PtestGradleVersion="${{ matrix.gradleVersion }}"`). In release.yml line 27, `${{ secrets.GRADLE_KEY }}`, `${{ secrets.GRADLE_TOKEN }}`, and `${{ env.PATCH_VERSION }}` are interpolated directly into a run: command; line 30 also interpolates `${{ env.PATCH_VERSION }}`. In node.yml, `${{ runner.temp }}` is interpolated directly into `run: cat ${{ runner.temp }}/qodana/results/log/idea.log`. All ${{ ... }} expressions inside run: blocks are script-injection risks regardless of context.

Locations:

- `.github/workflows/tag.yml:18`
- `.github/workflows/gradle.yml:46`
- `.github/workflows/release.yml:27`
- `.github/workflows/release.yml:30`
- `.github/workflows/node.yml:261`

### unpinned-uses (severity: high)

Every `uses:` reference across all workflow files uses a mutable tag or branch ref instead of a pinned 40-character SHA commit hash, making the workflows vulnerable to supply-chain attacks if the referenced action is compromised or the tag is moved. Failing references include: branch.yml: `actions/checkout@master`, `connor-baer/action-sync-branch@main`; code-quality.yml: `actions/checkout@v6`; gradle.yml: `actions/checkout@v6`, `gradle/wrapper-validation-action@v3.5.0`, `actions/setup-java@v5`, `actions/upload-artifact@v5`; node.yml: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v5`, `dorny/paths-filter@v3`, `actions/setup-go@v6`; release.yml: `actions/checkout@v6`, `actions/setup-java@v5`, `actions/setup-node@v6`; tag.yml: `actions/checkout@v6`.

Locations:

- `.github/workflows/branch.yml:15`
- `.github/workflows/code-quality.yml:18`
- `.github/workflows/gradle.yml:27`
- `.github/workflows/node.yml:38`
- `.github/workflows/release.yml:20`
- `.github/workflows/tag.yml:14`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed script-injection in 5 locations across tag.yml, gradle.yml, release.yml, and node.yml by moving all ${{ }} expressions from run: shell commands into step env: blocks. Fixed unpinned-uses across all 6 workflow files (branch.yml, code-quality.yml, gradle.yml, node.yml, release.yml, tag.yml) by pinning all 9 unique action references to their full 40-character commit SHAs using lookup_action_sha. Also fixed a duplicate env: block that was introduced in release.yml's Publish JAR to Space step by merging the env vars into a single block.

