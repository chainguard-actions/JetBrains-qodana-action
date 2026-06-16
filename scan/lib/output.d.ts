import { Annotation } from './annotations';
import { ProblemDescriptor } from '../../common/output';
export declare const DEPENDENCY_CHARS_LIMIT = 65000;
export declare const VIEW_REPORT_OPTIONS: string;
/**
 * Publish Qodana results to GitHub: comment, job summary, annotations.
 * @param failedByThreshold flag if the Qodana failThreshold was reached.
 * @param projectDir The path to the project.
 * @param sourceDir The path to the analyzed directory inside the project.
 * @param resultsDir The path to the results.
 * @param postComment whether to post a PR comment or not.
 * @param isPrMode
 * @param execute whether to execute the promise or not.
 * @param useAnnotations whether to publish annotations or not.
 */
export declare function publishOutput(failedByThreshold: boolean, projectDir: string, sourceDir: string, resultsDir: string, useAnnotations: boolean, postComment: boolean, isPrMode: boolean, execute: boolean): Promise<void>;
export declare function annotationsToProblemDescriptors(annotations: Annotation[] | undefined): ProblemDescriptor[];
export declare function prFixesBody(jobUrl: string): string;
