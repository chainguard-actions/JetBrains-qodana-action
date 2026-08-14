import { GitHub } from '@actions/github/lib/utils';
import { Output } from './annotations';
import { Inputs, PushFixesType } from '../../common/qodana';
export declare const ANALYSIS_FINISHED_REACTION = "+1";
export declare const ANALYSIS_STARTED_REACTION = "eyes";
export declare const ENABLE_USE_CACHE_OPTION_WARNING = "Turn on \"use-cache\" option to use \"cache-default-branch-only\"";
type Reaction = '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray' | 'rocket' | 'eyes';
/**
 * The context for the action.
 * @returns The action inputs.
 */
export declare function getInputs(): Inputs;
export declare function qodana(inputs: Inputs, args?: string[]): Promise<number>;
export declare function pushQuickFixes(mode: PushFixesType, commitMessage: string): Promise<void>;
export declare function prepareAgent(args: string[], nightlyVersion?: string): Promise<void>;
/**
 * Uploads the Qodana report files from temp directory to GitHub job artifact.
 * @param resultsDir The path to upload report from.
 * @param artifactName Artifact upload name.
 * @param execute whether to execute promise or not.
 */
export declare function uploadArtifacts(resultsDir: string, artifactName: string, execute: boolean): Promise<void>;
/**
 * Uploads the cache to GitHub Actions cache from the given path.
 * @param cacheDir The path to upload the cache from.
 * @param primaryKey Addition to the generated cache hash
 * @param reservedCacheKey The cache key to check if the cache already exists.
 * @param execute whether to execute promise or not.
 */
export declare function uploadCaches(cacheDir: string, primaryKey: string, reservedCacheKey: string, execute: boolean): Promise<void>;
/**
 * Restores the cache from GitHub Actions cache to the given path.
 * @param cacheDir The path to restore the cache to.
 * @param primaryKey The primary cache key.
 * @param additionalCacheKey The additional cache key.
 * @param execute whether to execute promise or not.
 */
export declare function restoreCaches(cacheDir: string, primaryKey: string, additionalCacheKey: string, execute: boolean): Promise<string>;
/**
 * Check if need to upload the cache.
 */
export declare function isNeedToUploadCache(useCaches: boolean, cacheDefaultBranchOnly: boolean): boolean;
/**
 * Returns the URL to the current workflow run.
 */
export declare function getWorkflowRunUrl(): string;
/**
 * Post a new comment to the pull request.
 * @param toolName The name of the tool to mention in comment.
 * @param content The comment to post.
 * @param sourceDir The analyzed directory inside project
 * @param postComment Whether to post a comment or not.
 */
export declare function postResultsToPRComments(toolName: string, content: string, sourceDir: string, postComment: boolean): Promise<void>;
/**
 * Asynchronously finds a comment on the GitHub issue and returns its ID based on the provided tag. If the
 * comment is not found, returns -1. Utilizes GitHub's Octokit REST API client.
 *
 * @param client The Octokit REST API client to be used for searching for the comment.
 * @param tag The string to be searched for in the comments' body.
 * @returns A Promise resolving to the comment's ID if found, or -1 if not found or an error occurs.
 */
export declare function findCommentByTag(client: InstanceType<typeof GitHub>, tag: string): Promise<number>;
/**
 * Asynchronously creates a comment on the current issue using the provided body text.
 * @param client The Octokit REST API client to be used for creating the comment.
 * @param body The text content of the comment to be created.
 * @returns A Promise that resolves when the comment is successfully created.
 */
export declare function createComment(client: InstanceType<typeof GitHub>, body: string): Promise<void>;
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
export declare function updateComment(client: InstanceType<typeof GitHub>, comment_id: number, body: string): Promise<void>;
/**
 * Updates the reaction of a pull request review comment to the given 'newReaction'.
 * Removes the previous reaction if 'oldReaction' is non-empty.
 *
 * @param newReaction The new reaction to be added.
 * @param oldReaction The old reaction to be removed (if non-empty).
 * @returns A Promise resolving to void.
 */
export declare function putReaction(newReaction: Reaction, oldReaction: string): Promise<void>;
/**
 * Publish GitHub Checks output to GitHub Checks.
 * @param failedByThreshold flag if the Qodana failThreshold was reached.
 * @param name The name of the Check.
 * @param output The output to publish.
 */
export declare function publishGitHubCheck(failedByThreshold: boolean, name: string, output: Output): Promise<void>;
export {};
