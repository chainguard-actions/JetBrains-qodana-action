<!-- markdownlint-disable -->

# Hardening Report: JetBrains--qodana-action/v2026.2.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **JetBrains--qodana-action/v2026.2.0** was hardened automatically. 11 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

All `uses:` references in branch.yml use mutable tags instead of full SHA digests: `actions/checkout@master`, `connor-baer/action-sync-branch@main`.

Locations:

- `.github/workflows/branch.yml:12`
- `.github/workflows/branch.yml:13`

### unpinned-uses (severity: high)

All `uses:` references in code-quality.yml use mutable tags instead of full SHA digests: `actions/checkout@v6`.

Locations:

- `.github/workflows/code-quality.yml:14`

### unpinned-uses (severity: high)

All `uses:` references in gradle.yml use mutable tags instead of full SHA digests: `actions/checkout@v6`, `gradle/wrapper-validation-action@v3.5.0`, `actions/setup-java@v5`, `actions/upload-artifact@v7`.

Locations:

- `.github/workflows/gradle.yml:27`
- `.github/workflows/gradle.yml:29`
- `.github/workflows/gradle.yml:38`
- `.github/workflows/gradle.yml:42`
- `.github/workflows/gradle.yml:48`

### unpinned-uses (severity: high)

All `uses:` references in maven.yml use mutable tags instead of full SHA digests: `actions/checkout@v6`, `actions/setup-java@v5`, `actions/upload-artifact@v5`.

Locations:

- `.github/workflows/maven.yml:30`
- `.github/workflows/maven.yml:34`
- `.github/workflows/maven.yml:51`

### unpinned-uses (severity: high)

All `uses:` references in node.yml use mutable tags instead of full SHA digests: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-artifact@v7`, `actions/setup-go@v6`, `dorny/paths-filter@v4`.

Locations:

- `.github/workflows/node.yml:37`
- `.github/workflows/node.yml:40`
- `.github/workflows/node.yml:57`
- `.github/workflows/node.yml:67`
- `.github/workflows/node.yml:75`
- `.github/workflows/node.yml:83`
- `.github/workflows/node.yml:88`
- `.github/workflows/node.yml:96`
- `.github/workflows/node.yml:104`
- `.github/workflows/node.yml:112`
- `.github/workflows/node.yml:120`
- `.github/workflows/node.yml:128`
- `.github/workflows/node.yml:136`
- `.github/workflows/node.yml:144`
- `.github/workflows/node.yml:152`
- `.github/workflows/node.yml:160`
- `.github/workflows/node.yml:168`
- `.github/workflows/node.yml:176`
- `.github/workflows/node.yml:184`
- `.github/workflows/node.yml:192`
- `.github/workflows/node.yml:200`
- `.github/workflows/node.yml:208`
- `.github/workflows/node.yml:216`
- `.github/workflows/node.yml:224`
- `.github/workflows/node.yml:232`
- `.github/workflows/node.yml:240`
- `.github/workflows/node.yml:248`
- `.github/workflows/node.yml:256`
- `.github/workflows/node.yml:264`
- `.github/workflows/node.yml:272`
- `.github/workflows/node.yml:280`
- `.github/workflows/node.yml:288`
- `.github/workflows/node.yml:296`
- `.github/workflows/node.yml:304`
- `.github/workflows/node.yml:312`
- `.github/workflows/node.yml:320`
- `.github/workflows/node.yml:328`
- `.github/workflows/node.yml:336`
- `.github/workflows/node.yml:344`
- `.github/workflows/node.yml:352`
- `.github/workflows/node.yml:360`
- `.github/workflows/node.yml:368`
- `.github/workflows/node.yml:376`
- `.github/workflows/node.yml:384`
- `.github/workflows/node.yml:392`
- `.github/workflows/node.yml:400`
- `.github/workflows/node.yml:408`
- `.github/workflows/node.yml:416`
- `.github/workflows/node.yml:424`
- `.github/workflows/node.yml:432`
- `.github/workflows/node.yml:440`
- `.github/workflows/node.yml:448`
- `.github/workflows/node.yml:456`
- `.github/workflows/node.yml:464`
- `.github/workflows/node.yml:472`
- `.github/workflows/node.yml:480`
- `.github/workflows/node.yml:488`
- `.github/workflows/node.yml:496`
- `.github/workflows/node.yml:504`
- `.github/workflows/node.yml:512`
- `.github/workflows/node.yml:520`
- `.github/workflows/node.yml:528`
- `.github/workflows/node.yml:536`
- `.github/workflows/node.yml:544`
- `.github/workflows/node.yml:552`
- `.github/workflows/node.yml:560`
- `.github/workflows/node.yml:568`
- `.github/workflows/node.yml:576`
- `.github/workflows/node.yml:584`
- `.github/workflows/node.yml:592`
- `.github/workflows/node.yml:600`
- `.github/workflows/node.yml:608`
- `.github/workflows/node.yml:616`
- `.github/workflows/node.yml:624`
- `.github/workflows/node.yml:632`
- `.github/workflows/node.yml:640`
- `.github/workflows/node.yml:648`
- `.github/workflows/node.yml:656`
- `.github/workflows/node.yml:664`
- `.github/workflows/node.yml:672`
- `.github/workflows/node.yml:680`
- `.github/workflows/node.yml:688`
- `.github/workflows/node.yml:696`
- `.github/workflows/node.yml:704`
- `.github/workflows/node.yml:712`
- `.github/workflows/node.yml:720`
- `.github/workflows/node.yml:728`
- `.github/workflows/node.yml:736`
- `.github/workflows/node.yml:744`
- `.github/workflows/node.yml:752`
- `.github/workflows/node.yml:760`
- `.github/workflows/node.yml:768`
- `.github/workflows/node.yml:776`
- `.github/workflows/node.yml:784`
- `.github/workflows/node.yml:792`
- `.github/workflows/node.yml:800`
- `.github/workflows/node.yml:808`
- `.github/workflows/node.yml:816`
- `.github/workflows/node.yml:824`
- `.github/workflows/node.yml:832`
- `.github/workflows/node.yml:840`
- `.github/workflows/node.yml:848`
- `.github/workflows/node.yml:856`
- `.github/workflows/node.yml:864`
- `.github/workflows/node.yml:872`
- `.github/workflows/node.yml:880`
- `.github/workflows/node.yml:888`
- `.github/workflows/node.yml:896`
- `.github/workflows/node.yml:904`
- `.github/workflows/node.yml:912`
- `.github/workflows/node.yml:920`
- `.github/workflows/node.yml:928`
- `.github/workflows/node.yml:936`
- `.github/workflows/node.yml:944`
- `.github/workflows/node.yml:952`
- `.github/workflows/node.yml:960`
- `.github/workflows/node.yml:968`
- `.github/workflows/node.yml:976`
- `.github/workflows/node.yml:984`
- `.github/workflows/node.yml:992`
- `.github/workflows/node.yml:1000`

### unpinned-uses (severity: high)

All `uses:` references in release.yml use mutable tags instead of full SHA digests: `actions/checkout@v6`, `actions/setup-java@v5`, `actions/setup-node@v6`.

Locations:

- `.github/workflows/release.yml:19`
- `.github/workflows/release.yml:21`
- `.github/workflows/release.yml:34`
- `.github/workflows/release.yml:43`
- `.github/workflows/release.yml:50`
- `.github/workflows/release.yml:60`
- `.github/workflows/release.yml:68`

### unpinned-uses (severity: high)

The `uses:` reference in tag.yml uses a mutable tag instead of a full SHA digest: `actions/checkout@v6`.

Locations:

- `.github/workflows/tag.yml:14`

### script-injection (severity: high)

Sub-rule (a): `${{ github.ref }}` is interpolated directly inside a `run:` shell command string: `TAG_REF=${{ github.ref }}`. This allows the tag ref value to be injected into the shell before quoting, enabling command injection.

Locations:

- `.github/workflows/tag.yml:18`

### script-injection (severity: high)

Sub-rule (a): `${{ matrix.gradleVersion }}` is interpolated directly inside a `run:` shell command string: `./gradlew :plugin:test -PtestGradleVersion="${{ matrix.gradleVersion }}"`.

Locations:

- `.github/workflows/gradle.yml:47`

### script-injection (severity: high)

Sub-rule (a): `${{ runner.temp }}` is interpolated directly inside a `run:` shell command string: `run: cat ${{ runner.temp }}/qodana/results/log/idea.log`.

Locations:

- `.github/workflows/node.yml:296`

### script-injection (severity: high)

Sub-rule (a): Multiple `${{ ... }}` expressions are interpolated directly inside `run:` shell command strings in release.yml: (1) `./gradlew clean :plugin:build :plugin:publishPlugins -Pgradle.publish.key=${{ secrets.GRADLE_KEY }} -Pgradle.publish.secret=${{ secrets.GRADLE_TOKEN }} -PbuildNumber=${{ env.PATCH_VERSION }}`; (2) `./gradlew :plugin:publish -PbuildNumber=${{ env.PATCH_VERSION }}`; (3) `echo "${{ secrets.GPG_PRIVATE_KEY }}" | gpg --batch --import`; (4) `mvn versions:set -DnewVersion=${{ env.VERSION }} ... -Dgpg.passphrase=${{ secrets.GPG_PASSPHRASE }}`.

Locations:

- `.github/workflows/release.yml:26`
- `.github/workflows/release.yml:28`
- `.github/workflows/release.yml:66`
- `.github/workflows/release.yml:87`
- `.github/workflows/release.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection

**Notes:**

Fixed all unpinned `uses:` references across 7 workflow files by replacing mutable tags/branches with full SHA digests: actions/checkout@master→61b9e37, actions/checkout@v6→d23441a, connor-baer/action-sync-branch@main→d7c15e4, gradle/wrapper-validation-action@v3.5.0→f9c9c57, actions/setup-java@v5→03ad4de, actions/upload-artifact@v7→043fb46, actions/upload-artifact@v5→330a01c, actions/setup-node@v6→2499707, actions/setup-go@v6→924ae3a, dorny/paths-filter@v4→7b450ff. Fixed script injections by moving all ${{ }} expressions from run: shell strings into env: blocks: tag.yml (${{ github.ref }}), gradle.yml (${{ matrix.gradleVersion }}), node.yml (${{ runner.temp }}), and release.yml (secrets.GRADLE_KEY, secrets.GRADLE_TOKEN, env.PATCH_VERSION, secrets.GPG_PRIVATE_KEY, env.VERSION, secrets.GPG_PASSPHRASE).

