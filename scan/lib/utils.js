"use strict";
/*
 * Copyright 2021-2025 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLE_USE_CACHE_OPTION_WARNING = exports.ANALYSIS_STARTED_REACTION = exports.ANALYSIS_FINISHED_REACTION = void 0;
exports.getInputs = getInputs;
exports.qodana = qodana;
exports.pushQuickFixes = pushQuickFixes;
exports.prepareAgent = prepareAgent;
exports.uploadArtifacts = uploadArtifacts;
exports.uploadCaches = uploadCaches;
exports.restoreCaches = restoreCaches;
exports.isNeedToUploadCache = isNeedToUploadCache;
exports.getWorkflowRunUrl = getWorkflowRunUrl;
exports.postResultsToPRComments = postResultsToPRComments;
exports.findCommentByTag = findCommentByTag;
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.putReaction = putReaction;
exports.publishGitHubCheck = publishGitHubCheck;
const cache = __importStar(require("@actions/cache"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const github = __importStar(require("@actions/github"));
const tc = __importStar(require("@actions/tool-cache"));
const artifact_1 = __importDefault(require("@actions/artifact"));
const annotations_1 = require("./annotations");
const qodana_1 = require("../../common/qodana");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const output_1 = require("./output");
const output_2 = require("../../common/output");
const utils_1 = require("../../common/utils");
exports.ANALYSIS_FINISHED_REACTION = '+1';
exports.ANALYSIS_STARTED_REACTION = 'eyes';
exports.ENABLE_USE_CACHE_OPTION_WARNING = 'Turn on "use-cache" option to use "cache-default-branch-only"';
/**
 * The context for the action.
 * @returns The action inputs.
 */
function getInputs() {
    const rawArgs = core.getInput('args');
    const argList = (0, utils_1.parseRawArguments)(rawArgs);
    return {
        args: argList,
        resultsDir: core.getInput('results-dir'),
        cacheDir: core.getInput('cache-dir'),
        primaryCacheKey: core.getInput('primary-cache-key'),
        additionalCacheKey: core.getInput('additional-cache-key'),
        cacheDefaultBranchOnly: core.getBooleanInput('cache-default-branch-only'),
        uploadResult: core.getBooleanInput('upload-result'),
        uploadSarif: false, // not used by the action
        artifactName: core.getInput('artifact-name'),
        useCaches: core.getBooleanInput('use-caches'),
        useAnnotations: core.getBooleanInput('use-annotations'),
        prMode: core.getBooleanInput('pr-mode'),
        postComment: core.getBooleanInput('post-pr-comment'),
        githubToken: core.getInput('github-token'),
        pushFixes: core.getInput('push-fixes'),
        commitMessage: core.getInput('commit-message'),
        useNightly: core.getBooleanInput('use-nightly'),
        // not used by the action
        workingDirectory: ''
    };
}
function getPrSha() {
    return __awaiter(this, void 0, void 0, function* () {
        const pr = github.context.payload.pull_request;
        if (process.env.QODANA_PR_SHA) {
            return process.env.QODANA_PR_SHA;
        }
        if (pr) {
            const output = yield gitOutput(['merge-base', pr.base.sha, pr.head.sha], {
                ignoreReturnCode: true
            });
            if (output.exitCode === 0) {
                return output.stdout.trim();
            }
            else {
                core.warning('Qodana needs git history to extract merge-base. Please specify fetch-depth: 0 in your workflow.');
                return pr.base.sha;
            }
        }
        return '';
    });
}
function getHeadSha() {
    const c = github.context;
    const pr = c.payload.pull_request;
    if (process.env.QODANA_REVISION) {
        return process.env.QODANA_REVISION;
    }
    if (pr) {
        return pr.head.sha;
    }
    return c.sha;
}
function qodana(inputs_1) {
    return __awaiter(this, arguments, void 0, function* (inputs, args = []) {
        if (args.length === 0) {
            args = (0, qodana_1.getQodanaScanArgs)(inputs.args, inputs.resultsDir, inputs.cacheDir);
            if (inputs.prMode) {
                const sha = yield getPrSha();
                if (sha !== '') {
                    args.push('--commit', sha);
                }
            }
        }
        const exit = yield exec.getExecOutput(qodana_1.EXECUTABLE, args, {
            ignoreReturnCode: true,
            env: Object.assign(Object.assign({}, process.env), { QODANA_REVISION: getHeadSha(), NONINTERACTIVE: '1' })
        });
        return exit.exitCode;
    });
}
function pushQuickFixes(mode, commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (mode === qodana_1.NONE) {
            return;
        }
        try {
            const c = github.context;
            const pr = c.payload.pull_request;
            let currentBranch = c.ref;
            if ((_a = pr === null || pr === void 0 ? void 0 : pr.head) === null || _a === void 0 ? void 0 : _a.ref) {
                currentBranch = pr.head.ref;
            }
            const currentCommit = (yield exec.getExecOutput('git', ['rev-parse', 'HEAD'])).stdout.trim();
            currentBranch = (0, qodana_1.validateBranchName)(currentBranch);
            yield git(['config', 'user.name', output_2.COMMIT_USER]);
            yield git(['config', 'user.email', output_2.COMMIT_EMAIL]);
            yield git(['add', '.']);
            let exitCode = yield git(['commit', '-m', commitMessage], {
                ignoreReturnCode: true
            });
            if (exitCode !== 0) {
                return;
            }
            // Check for any files that may interfere with pull --rebase
            const statusOutput = yield gitOutput(['status', '--porcelain'], {
                ignoreReturnCode: true
            });
            if (statusOutput.stdout.trim() !== '') {
                core.info(`Git status before pull --rebase:\n${statusOutput.stdout}`);
            }
            exitCode = yield git(['pull', '--rebase', 'origin', currentBranch]);
            if (exitCode !== 0) {
                return;
            }
            if (mode === qodana_1.BRANCH) {
                if ((_b = pr === null || pr === void 0 ? void 0 : pr.head) === null || _b === void 0 ? void 0 : _b.ref) {
                    const commitToCherryPick = (yield exec.getExecOutput('git', ['rev-parse', 'HEAD'])).stdout.trim();
                    yield git(['checkout', currentBranch]);
                    yield git(['cherry-pick', commitToCherryPick]);
                }
                yield git(['push', 'origin', currentBranch]);
                core.info(`Pushed quick-fixes to branch ${currentBranch}`);
            }
            else if (mode === qodana_1.PULL_REQUEST) {
                const newBranch = `qodana/quick-fixes-${currentCommit.slice(0, 7)}`;
                yield git(['checkout', '-b', newBranch]);
                yield git(['push', 'origin', newBranch]);
                yield createPr(commitMessage, `${c.repo.owner}/${c.repo.repo}`, currentBranch, newBranch);
                core.info(`Pushed quick-fixes to branch ${newBranch} and created pull request`);
            }
        }
        catch (error) {
            core.warning(`Failed to push quick fixes – ${error.message}`);
        }
    });
}
function prepareAgent(args_1) {
    return __awaiter(this, arguments, void 0, function* (args, useNightly = false) {
        const arch = (0, qodana_1.getProcessArchName)();
        const platform = (0, qodana_1.getProcessPlatformName)();
        const temp = yield tc.downloadTool((0, qodana_1.getQodanaUrl)(arch, platform, useNightly));
        if (!useNightly) {
            const expectedChecksum = (0, qodana_1.getQodanaSha256)(arch, platform);
            const actualChecksum = (0, qodana_1.sha256sum)(temp);
            if (expectedChecksum !== actualChecksum) {
                core.setFailed((0, qodana_1.getQodanaSha256MismatchMessage)(expectedChecksum, actualChecksum));
            }
        }
        let extractRoot;
        if (process.platform === 'win32') {
            extractRoot = yield tc.extractZip(temp);
        }
        else {
            extractRoot = yield tc.extractTar(temp);
        }
        core.addPath(yield tc.cacheDir(extractRoot, qodana_1.EXECUTABLE, useNightly ? 'nightly' : qodana_1.VERSION));
        if (!(0, qodana_1.isNativeMode)(args)) {
            const exitCode = yield qodana(getInputs(), (0, qodana_1.getQodanaPullArgs)(args));
            if (exitCode !== 0) {
                core.setFailed(`qodana pull failed with exit code ${exitCode}`);
                return;
            }
        }
    });
}
/**
 * Uploads the Qodana report files from temp directory to GitHub job artifact.
 * @param resultsDir The path to upload report from.
 * @param artifactName Artifact upload name.
 * @param execute whether to execute promise or not.
 */
function uploadArtifacts(resultsDir, artifactName, execute) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!execute) {
            return;
        }
        try {
            const workingDir = path_1.default.dirname(resultsDir);
            const archivePath = path_1.default.join(workingDir, `${artifactName}.zip`);
            yield (0, qodana_1.compressFolder)(resultsDir, archivePath);
            yield artifact_1.default.uploadArtifact(artifactName, [archivePath], workingDir);
        }
        catch (error) {
            core.warning(`Failed to upload report – ${error.message}`);
        }
    });
}
/**
 * Uploads the cache to GitHub Actions cache from the given path.
 * @param cacheDir The path to upload the cache from.
 * @param primaryKey Addition to the generated cache hash
 * @param reservedCacheKey The cache key to check if the cache already exists.
 * @param execute whether to execute promise or not.
 */
function uploadCaches(cacheDir, primaryKey, reservedCacheKey, execute) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!execute) {
            return;
        }
        if (primaryKey === reservedCacheKey) {
            core.info(`Cache with key ${primaryKey} already exists, skipping cache uploading...`);
            return;
        }
        try {
            yield cache.saveCache([cacheDir], primaryKey);
        }
        catch (error) {
            const errorMessage = error.message;
            if (errorMessage.includes('Cache already exists.')) {
                core.info(`Cache with key ${primaryKey} already exists, skipping cache uploading...`);
            }
            else {
                core.warning(`Failed to upload caches – ${errorMessage}`);
            }
        }
    });
}
/**
 * Restores the cache from GitHub Actions cache to the given path.
 * @param cacheDir The path to restore the cache to.
 * @param primaryKey The primary cache key.
 * @param additionalCacheKey The additional cache key.
 * @param execute whether to execute promise or not.
 */
function restoreCaches(cacheDir, primaryKey, additionalCacheKey, execute) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!execute) {
            return '';
        }
        const restoreKeys = [additionalCacheKey].filter(k => k);
        try {
            const cacheKey = yield cache.restoreCache([cacheDir], primaryKey, restoreKeys);
            if (!cacheKey) {
                core.info(`No cache found for input keys: ${[primaryKey, ...restoreKeys].join(', ')}.
          With cache the pipeline would be faster.`);
                return '';
            }
            return cacheKey;
        }
        catch (error) {
            core.warning(`Failed to restore cache with key ${primaryKey} – ${error.message}`);
        }
        return '';
    });
}
/**
 * Check if need to upload the cache.
 */
function isNeedToUploadCache(useCaches, cacheDefaultBranchOnly) {
    var _a;
    if (!useCaches && cacheDefaultBranchOnly) {
        core.warning(exports.ENABLE_USE_CACHE_OPTION_WARNING);
    }
    if (useCaches && cacheDefaultBranchOnly) {
        const currentBranch = github.context.ref;
        const defaultBranch = (_a = github.context.payload.repository) === null || _a === void 0 ? void 0 : _a.default_branch;
        core.debug(`Current branch: ${currentBranch} | Default branch: ${defaultBranch}`);
        return currentBranch === `refs/heads/${defaultBranch}`;
    }
    return useCaches;
}
/**
 * Returns the URL to the current workflow run.
 */
function getWorkflowRunUrl() {
    if (!process.env['GITHUB_REPOSITORY']) {
        return '';
    }
    const runId = github.context.runId;
    const repo = github.context.repo;
    const serverUrl = process.env['GITHUB_SERVER_URL'] || 'https://github.com';
    return `${serverUrl}/${repo.owner}/${repo.repo}/actions/runs/${runId}`;
}
/**
 * Post a new comment to the pull request.
 * @param toolName The name of the tool to mention in comment.
 * @param content The comment to post.
 * @param sourceDir The analyzed directory inside project
 * @param postComment Whether to post a comment or not.
 */
function postResultsToPRComments(toolName, content, sourceDir, postComment) {
    return __awaiter(this, void 0, void 0, function* () {
        const pr = github.context.payload.pull_request;
        if (!postComment || !pr) {
            return;
        }
        // source dir needed in case of monorepo with projects analyzed by the same tool
        const comment_tag_pattern = (0, output_2.getCommentTag)(toolName, sourceDir);
        const body = `${content}\n${comment_tag_pattern}`;
        const client = github.getOctokit(getInputs().githubToken);
        const comment_id = yield findCommentByTag(client, comment_tag_pattern);
        if (comment_id !== -1) {
            yield updateComment(client, comment_id, body);
        }
        else {
            yield createComment(client, body);
        }
    });
}
/**
 * Asynchronously finds a comment on the GitHub issue and returns its ID based on the provided tag. If the
 * comment is not found, returns -1. Utilizes GitHub's Octokit REST API client.
 *
 * @param client The Octokit REST API client to be used for searching for the comment.
 * @param tag The string to be searched for in the comments' body.
 * @returns A Promise resolving to the comment's ID if found, or -1 if not found or an error occurs.
 */
function findCommentByTag(client, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data: comments } = yield client.rest.issues.listComments(Object.assign(Object.assign({}, github.context.repo), { issue_number: github.context.issue.number }));
            const comment = comments.find(c => { var _a; return (_a = c === null || c === void 0 ? void 0 : c.body) === null || _a === void 0 ? void 0 : _a.includes(tag); });
            return comment ? comment.id : -1;
        }
        catch (error) {
            core.debug(`Failed to find comment by tag – ${error.message}`);
            return -1;
        }
    });
}
/**
 * Asynchronously creates a comment on the current issue using the provided body text.
 * @param client The Octokit REST API client to be used for creating the comment.
 * @param body The text content of the comment to be created.
 * @returns A Promise that resolves when the comment is successfully created.
 */
function createComment(client, body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.rest.issues.createComment({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: github.context.issue.number,
                body
            });
        }
        catch (error) {
            core.debug(`Failed to post comment – ${error.message}`);
        }
    });
}
/**
 * Asynchronously updates a GitHub comment with the provided `comment_id` and new content/`body`.
 * Handles any occurring errors
 * internally by debugging them.
 *
 * @param client The Octokit REST API client to be used for updating the comment.
 * @param comment_id The ID of the GitHub comment to be updated.
 * @param body The new content of the comment.
 * @returns A Promise that resolves to void after attempted comment update.
 */
function updateComment(client, comment_id, body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.rest.issues.updateComment({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                comment_id,
                body
            });
        }
        catch (error) {
            core.debug(`Failed to update comment – ${error.message}`);
        }
    });
}
/**
 * Updates the reaction of a pull request review comment to the given 'newReaction'.
 * Removes the previous reaction if 'oldReaction' is non-empty.
 *
 * @param newReaction The new reaction to be added.
 * @param oldReaction The old reaction to be removed (if non-empty).
 * @returns A Promise resolving to void.
 */
function putReaction(newReaction, oldReaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const pr = github.context.payload.pull_request;
        if (!pr) {
            return;
        }
        const client = github.getOctokit(getInputs().githubToken);
        const issue_number = pr.number;
        if (oldReaction !== '') {
            try {
                const { data: reactions } = yield client.rest.reactions.listForIssue(Object.assign(Object.assign({}, github.context.repo), { issue_number }));
                const previousReaction = reactions.find(r => r.content === oldReaction);
                if (previousReaction) {
                    yield client.rest.reactions.deleteForIssue(Object.assign(Object.assign({}, github.context.repo), { issue_number, reaction_id: previousReaction.id }));
                }
            }
            catch (error) {
                core.debug(`Failed to delete the initial reaction – ${error.message}`);
            }
        }
        try {
            yield client.rest.reactions.createForIssue(Object.assign(Object.assign({}, github.context.repo), { issue_number, content: newReaction }));
        }
        catch (error) {
            core.debug(`Failed to set reaction – ${error.message}`);
        }
    });
}
/**
 * Publish GitHub Checks output to GitHub Checks.
 * @param failedByThreshold flag if the Qodana failThreshold was reached.
 * @param name The name of the Check.
 * @param output The output to publish.
 */
function publishGitHubCheck(failedByThreshold, name, output) {
    return __awaiter(this, void 0, void 0, function* () {
        const conclusion = (0, annotations_1.getGitHubCheckConclusion)(output.annotations, failedByThreshold);
        const c = github.context;
        const pr = c.payload.pull_request;
        let sha = c.sha;
        if (pr) {
            sha = pr.head.sha;
        }
        const client = github.getOctokit(getInputs().githubToken);
        const result = yield client.rest.checks.listForRef(Object.assign(Object.assign({}, github.context.repo), { ref: sha }));
        const checkExists = result.data.check_runs.find(check => check.name === name);
        if (checkExists) {
            yield updateCheck(client, conclusion, checkExists.id, output);
        }
        else {
            yield createCheck(client, conclusion, sha, name, output);
        }
    });
}
/**
 * Creates a GitHub Check.
 * @param client The Octokit REST API client to be used for creating the Check.
 * @param conclusion The conclusion to use for the GitHub Check.
 * @param head_sha The SHA of the head commit.
 * @param name The name of the Check.
 * @param output The Check Output to use.
 */
function createCheck(client, conclusion, head_sha, name, output) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.rest.checks.create(Object.assign(Object.assign({}, github.context.repo), { accept: 'application/vnd.github.v3+json', status: 'completed', head_sha,
            conclusion,
            name,
            output }));
    });
}
/**
 * Updates a GitHub Check.
 * @param client The Octokit REST API client to be used for updating the Check.
 * @param conclusion The conclusion to use for the GitHub Check.
 * @param check_run_id The ID of the GitHub Check to use for the update.
 * @param output The Check Output to use.
 */
function updateCheck(client, conclusion, check_run_id, output) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.rest.checks.update(Object.assign(Object.assign({}, github.context.repo), { accept: 'application/vnd.github.v3+json', status: 'completed', conclusion,
            check_run_id,
            output }));
    });
}
function git(args_1) {
    return __awaiter(this, arguments, void 0, function* (args, options = {}) {
        return (yield exec.getExecOutput('git', args, options)).exitCode;
    });
}
function gitOutput(args_1) {
    return __awaiter(this, arguments, void 0, function* (args, options = {}) {
        const originalIgnoreReturnCode = options.ignoreReturnCode;
        const result = yield exec.getExecOutput('git', args, Object.assign(Object.assign({}, options), { ignoreReturnCode: true }));
        if (result.exitCode !== 0 && originalIgnoreReturnCode) {
            core.warning(`Git command failed: git ${args.join(' ')}\nExit code: ${result.exitCode}\nStdout: ${result.stdout}\nStderr: ${result.stderr}`);
        }
        else if (result.exitCode !== 0) {
            throw new Error(`Git command failed: git ${args.join(' ')} with exit code ${result.exitCode}. Stdout: ${result.stdout}. Stderr: ${result.stderr}`);
        }
        return result;
    });
}
function createPr(title, repo, base, head) {
    return __awaiter(this, void 0, void 0, function* () {
        const prBodyFile = path_1.default.join(os.tmpdir(), 'pr-body.txt');
        fs.writeFileSync(prBodyFile, (0, output_1.prFixesBody)(getWorkflowRunUrl()));
        yield exec.getExecOutput('gh', [
            'pr',
            'create',
            '--repo',
            repo,
            '--title',
            title,
            '--body-file',
            prBodyFile,
            '--base',
            base,
            '--head',
            head
        ], {
            env: Object.assign(Object.assign({}, process.env), { GH_TOKEN: getInputs().githubToken })
        });
    });
}
