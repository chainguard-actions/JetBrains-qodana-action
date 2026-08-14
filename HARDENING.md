<!-- markdownlint-disable -->

# Hardening Report: JetBrains--qodana-action/v2025.3.2

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **JetBrains--qodana-action/v2025.3.2** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files reference GitHub Actions using mutable tag or branch refs instead of immutable 40-character SHA digests, making them vulnerable to supply-chain attacks if the referenced action is compromised or its tag is moved.

branch.yml: actions/checkout@master, connor-baer/action-sync-branch@main
code-quality.yml: actions/checkout@v6
gradle.yml: actions/checkout@v6, gradle/wrapper-validation-action@v3.5.0, actions/setup-java@v5, actions/upload-artifact@v6
node.yml: actions/checkout@v6, actions/setup-node@v6, actions/upload-artifact@v6, actions/setup-go@v6, dorny/paths-filter@v3
release.yml: actions/checkout@v6, actions/setup-java@v5, actions/setup-node@v6
tag.yml: actions/checkout@v6

Locations:

- `.github/workflows/branch.yml:11`
- `.github/workflows/branch.yml:12`
- `.github/workflows/code-quality.yml:14`
- `.github/workflows/gradle.yml:22`
- `.github/workflows/gradle.yml:24`
- `.github/workflows/gradle.yml:38`
- `.github/workflows/gradle.yml:40`
- `.github/workflows/gradle.yml:49`
- `.github/workflows/node.yml:37`
- `.github/workflows/node.yml:42`
- `.github/workflows/node.yml:57`
- `.github/workflows/node.yml:67`
- `.github/workflows/node.yml:185`
- `.github/workflows/node.yml:188`
- `.github/workflows/node.yml:207`
- `.github/workflows/node.yml:218`
- `.github/workflows/node.yml:219`
- `.github/workflows/node.yml:224`
- `.github/workflows/node.yml:237`
- `.github/workflows/release.yml:19`
- `.github/workflows/release.yml:21`
- `.github/workflows/release.yml:42`
- `.github/workflows/release.yml:52`
- `.github/workflows/release.yml:54`
- `.github/workflows/tag.yml:12`

### script-injection (severity: high)

Several run: blocks interpolate ${{ }} expressions directly into shell commands, allowing an attacker to inject arbitrary shell commands if the expression value is attacker-controlled.

(a) tag.yml — `TAG_REF=${{ github.ref }}` directly in a run: block. github.ref is a GitHub context value that flows through YAML template substitution before the shell sees it.

(b) gradle.yml — `run: ./gradlew :plugin:test -PtestGradleVersion="${{ matrix.gradleVersion }}"`. matrix.gradleVersion is a workflow-controllable context value interpolated directly into the shell command.

(c) release.yml — `run: ./gradlew clean :plugin:build :plugin:publishPlugins ... -PbuildNumber=${{ env.PATCH_VERSION }}` and `run: ./gradlew :plugin:publish -PbuildNumber=${{ env.PATCH_VERSION }}`. env.PATCH_VERSION is a workflow-controllable context value interpolated directly into the shell command.

(d) node.yml — `run: cat ${{ runner.temp }}/qodana/results/log/idea.log`. runner.temp is a context value interpolated directly into the shell command string.

Locations:

- `.github/workflows/tag.yml:17`
- `.github/workflows/gradle.yml:47`
- `.github/workflows/release.yml:28`
- `.github/workflows/release.yml:31`
- `.github/workflows/node.yml:220`

### github-env-injection (severity: high)

In release.yml, the 'Extract version from tag' step derives PATCH_VERSION from the GITHUB_REF environment variable (a GitHub-provided, workflow-controlled value) using shell string manipulation, then writes it to $GITHUB_ENV without sanitization (`echo "PATCH_VERSION=${PATCH_VERSION}" >> $GITHUB_ENV`). An attacker who can influence the tag name could inject newlines into GITHUB_REF to set arbitrary environment variables for subsequent steps. The value should be sanitized with `printf '%s' "$PATCH_VERSION" | tr -d '\n\r'` before writing to $GITHUB_ENV.

Locations:

- `.github/workflows/release.yml:16`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, github-env-injection

**Notes:**

Fixed all findings across 6 workflow files:

**unpinned-uses** (25 locations):
- branch.yml: actions/checkout@master → @61b9e3751b92087fd0b06925ba6dd6314e06f089, connor-baer/action-sync-branch@main → @8155140e9d1b95a366a1484698c07cb9a4078f87
- code-quality.yml: actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803
- gradle.yml: actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803, gradle/wrapper-validation-action@v3.5.0 → @f9c9c575b8b21b6485636a91ffecd10e558c62f6, actions/setup-java@v5 → @03ad4de0992f5dab5e18fcb136590ce7c4a0ac95, actions/upload-artifact@v6 → @b7c566a772e6b6bfb58ed0dc250532a479d7789f
- node.yml: all actions/checkout@v6, actions/setup-node@v6, actions/upload-artifact@v6, actions/setup-go@v6, dorny/paths-filter@v3 pinned to their respective SHAs
- release.yml: actions/checkout@v6, actions/setup-java@v5, actions/setup-node@v6 pinned
- tag.yml: actions/checkout@v6 pinned

**script-injection** (5 locations):
- tag.yml: `TAG_REF=${{ github.ref }}` moved to env: block as TAG_REF
- gradle.yml: `${{ matrix.gradleVersion }}` moved to env: block as GRADLE_VERSION
- release.yml: `${{ env.PATCH_VERSION }}` moved to env: blocks as BUILD_NUMBER in both run steps; secrets also moved to env: blocks
- node.yml: `${{ runner.temp }}` moved to env: block as RUNNER_TEMP_DIR

**github-env-injection** (1 location):
- release.yml: PATCH_VERSION is now sanitized with `printf '%s' "$PATCH_VERSION" | tr -d '\n\r'` before writing to $GITHUB_ENV

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in .github/workflows/tag.yml by double-quoting all unquoted shell variable expansions of attacker-influenced values. The variables $BRANCH_NAME (derived from github.ref via TAG_REF) and $TAG_NAME were used unquoted in 5 git commands: `git ls-remote --heads origin`, `git checkout -b`, `git checkout`, `git reset --hard`, and `git push -u origin`. All have been double-quoted to prevent shell metacharacter injection. The ${{ github.ref }} expression was already correctly isolated in the step's env block.

