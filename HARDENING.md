<!-- markdownlint-disable -->

# Hardening Report: JetBrains--qodana-action/v2026.1.3

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **JetBrains--qodana-action/v2026.1.3** was hardened automatically. 2 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ }} expressions are interpolated directly inside run: shell command strings. In tag.yml line 19, `TAG_REF=${{ github.ref }}` injects the github.ref context directly into the shell. In release.yml, multiple expressions are injected: line 26 uses `${{ secrets.GRADLE_KEY }}`, `${{ secrets.GRADLE_TOKEN }}`, and `${{ env.PATCH_VERSION }}` directly in a run: command; line 28 uses `${{ env.PATCH_VERSION }}`; line 57 uses `${{ secrets.GPG_PRIVATE_KEY }}` inside an echo pipeline; line 75 uses `${{ env.VERSION }}`; line 76 uses `${{ secrets.GPG_PASSPHRASE }}`. In gradle.yml line 50, `${{ matrix.gradleVersion }}` is interpolated directly in a run: command. In node.yml, `${{ runner.temp }}` is interpolated directly in `run: cat ${{ runner.temp }}/qodana/results/log/idea.log`.

Locations:

- `.github/workflows/tag.yml:19`
- `.github/workflows/release.yml:26`
- `.github/workflows/release.yml:28`
- `.github/workflows/release.yml:57`
- `.github/workflows/release.yml:75`
- `.github/workflows/release.yml:76`
- `.github/workflows/gradle.yml:50`
- `.github/workflows/node.yml:291`

### unpinned-uses (severity: high)

Multiple workflow files reference actions using mutable tag or branch refs instead of immutable 40-character SHA digests, making them vulnerable to supply-chain attacks. Failing references include: branch.yml — `actions/checkout@master`, `connor-baer/action-sync-branch@main`; code-quality.yml — `actions/checkout@v6`; gradle.yml — `actions/checkout@v6`, `gradle/wrapper-validation-action@v3.5.0`, `actions/setup-java@v5`, `actions/upload-artifact@v7`; maven.yml — `actions/checkout@v6`, `actions/setup-java@v5`, `actions/upload-artifact@v5`; node.yml — `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`, `actions/setup-go@v6`, `dorny/paths-filter@v4`; release.yml — `actions/checkout@v6`, `actions/setup-java@v5`, `actions/setup-node@v6`; tag.yml — `actions/checkout@v6`.

Locations:

- `.github/workflows/branch.yml:13`
- `.github/workflows/branch.yml:14`
- `.github/workflows/code-quality.yml:15`
- `.github/workflows/gradle.yml:29`
- `.github/workflows/gradle.yml:31`
- `.github/workflows/gradle.yml:44`
- `.github/workflows/gradle.yml:47`
- `.github/workflows/gradle.yml:53`
- `.github/workflows/maven.yml:27`
- `.github/workflows/maven.yml:30`
- `.github/workflows/maven.yml:47`
- `.github/workflows/node.yml:37`
- `.github/workflows/node.yml:40`
- `.github/workflows/node.yml:55`
- `.github/workflows/node.yml:63`
- `.github/workflows/node.yml:71`
- `.github/workflows/node.yml:270`
- `.github/workflows/node.yml:275`
- `.github/workflows/node.yml:285`
- `.github/workflows/release.yml:19`
- `.github/workflows/release.yml:22`
- `.github/workflows/release.yml:40`
- `.github/workflows/release.yml:46`
- `.github/workflows/release.yml:63`
- `.github/workflows/release.yml:66`
- `.github/workflows/tag.yml:14`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses

**Notes:**

Fixed all script-injection findings by moving ${{ }} expressions from run: shell commands into env: blocks and referencing them as plain environment variables. Fixed all unpinned-uses findings by replacing mutable tag/branch references with pinned 40-character SHA digests (with original tag preserved as a comment). Files modified: branch.yml, code-quality.yml, gradle.yml, maven.yml, node.yml, release.yml, tag.yml.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in `.github/workflows/tag.yml` 'Update version branch' step by double-quoting all expansions of derived variables `$BRANCH_NAME` and `$TAG_NAME` in shell commands: `git ls-remote --heads origin "$BRANCH_NAME"`, `git checkout -b "$BRANCH_NAME"`, `git checkout "$BRANCH_NAME"`, `git reset --hard "$TAG_NAME"`, and `git push -u origin "$BRANCH_NAME" --force`. Also added quotes to the initial assignments `TAG_REF="$GITHUB_REF_VALUE"`, `TAG_NAME="${TAG_REF:10}"`, and `BRANCH_VERSION="${TAG_NAME:0:7}"` for consistency and safety.

