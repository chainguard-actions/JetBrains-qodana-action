import { AnnotationProperties } from '@actions/core';
export declare const ANNOTATION_FAILURE = "failure";
export declare const ANNOTATION_WARNING = "warning";
export declare const ANNOTATION_NOTICE = "notice";
declare const FAILURE_STATUS = "failure";
declare const NEUTRAL_STATUS = "neutral";
declare const SUCCESS_STATUS = "success";
export type Conclusion = typeof FAILURE_STATUS | typeof SUCCESS_STATUS | typeof NEUTRAL_STATUS | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | 'stale' | undefined;
/**
 * Publish SARIF to GitHub Checks.
 * @param name The name of the Check.
 * @param problems The output to publish.
 * @param failedByThreshold flag if the Qodana failThreshold was reached.
 * @param execute whether to execute the promise or not.
 */
export declare function publishAnnotations(name: string, problems: Output, failedByThreshold: boolean, execute: boolean): Promise<void>;
export interface Output {
    title: string;
    summary: string;
    text: string;
    annotations: Annotation[];
}
export interface Annotation {
    title: string | undefined;
    path: string;
    start_line: number;
    end_line: number;
    annotation_level: 'failure' | 'warning' | 'notice';
    message: string;
    start_column: number | undefined;
    end_column: number | undefined;
}
/**
 * Converts a SARIF from the given path to a GitHub Check Output.
 * @param path The SARIF path to convert.
 * @returns GitHub Check Outputs with annotations are created for each result.
 */
export declare function parseSarif(path: string): Output;
/**
 * Get a conclusion for the given set of annotations
 * @param annotations GitHub Check annotations.
 * @param failedByThreshold flag if the Qodana failThreshold was reached.
 * @returns The conclusion to use for the GitHub Check.
 */
export declare function getGitHubCheckConclusion(annotations: Annotation[], failedByThreshold: boolean): Conclusion;
/**
 * Converts Annotation to AnnotationProperties for core GitHub actions API.
 * @param a Annotation to convert.
 */
export declare function toAnnotationProperties(a: Annotation): AnnotationProperties;
export {};
