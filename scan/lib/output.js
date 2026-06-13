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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIEW_REPORT_OPTIONS = exports.DEPENDENCY_CHARS_LIMIT = void 0;
exports.publishOutput = publishOutput;
exports.annotationsToProblemDescriptors = annotationsToProblemDescriptors;
exports.prFixesBody = prFixesBody;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const core = __importStar(require("@actions/core"));
const qodana_1 = require("../../common/qodana");
const utils_1 = require("./utils");
const annotations_1 = require("./annotations");
const output_1 = require("../../common/output");
exports.DEPENDENCY_CHARS_LIMIT = 65000; // 65k chars is the GitHub limit for a comment
exports.VIEW_REPORT_OPTIONS = `To be able to view the detailed Qodana report, you can either:
  - Register at [Qodana Cloud](https://qodana.cloud/) and [configure the action](https://github.com/jetbrains/qodana-action#qodana-cloud)
  - Use [GitHub Code Scanning with Qodana](https://github.com/jetbrains/qodana-action#github-code-scanning)
  - Host [Qodana report at GitHub Pages](https://github.com/JetBrains/qodana-action/blob/3a8e25f5caad8d8b01c1435f1ef7b19fe8b039a0/README.md#github-pages)
  - Inspect and use \`qodana.sarif.json\` (see [the Qodana SARIF format](https://www.jetbrains.com/help/qodana/qodana-sarif-output.html#Report+structure) for details)

To get \`*.log\` files or any other Qodana artifacts, run the action with \`upload-result\` option set to \`true\`, 
so that the action will upload the files as the job artifacts:
\`\`\`yaml
      - name: 'Qodana Scan'
        uses: JetBrains/qodana-action@v${qodana_1.VERSION}
        with:
          upload-result: true
\`\`\`
`;
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
function publishOutput(failedByThreshold, projectDir, sourceDir, resultsDir, useAnnotations, postComment, isPrMode, execute) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!execute) {
            return;
        }
        try {
            const problems = (0, annotations_1.parseSarif)(`${resultsDir}/${qodana_1.QODANA_SARIF_NAME}`);
            const reportUrl = (0, output_1.getReportURL)(resultsDir);
            const coverageInfo = (0, output_1.getCoverageStats)((0, qodana_1.getCoverageFromSarif)(`${resultsDir}/${qodana_1.QODANA_SHORT_SARIF_NAME}`), true);
            const licensesInfo = (0, output_1.getLicenseInfo)(resultsDir);
            const problemsDescriptions = annotationsToProblemDescriptors(problems.annotations);
            const toolName = (_a = problems.title.split('found by ')[1]) !== null && _a !== void 0 ? _a : output_1.QODANA_CHECK_NAME;
            problems.summary = (0, output_1.getSummary)(toolName, projectDir, sourceDir, problemsDescriptions, coverageInfo, licensesInfo.packages, licensesInfo.licenses, reportUrl, isPrMode, exports.DEPENDENCY_CHARS_LIMIT, exports.VIEW_REPORT_OPTIONS);
            // source dir is needed for project distinction in monorepo
            const jobName = `${toolName}` + (sourceDir === '' ? '' : ` (${sourceDir})`);
            yield Promise.all([
                (0, utils_1.putReaction)(utils_1.ANALYSIS_FINISHED_REACTION, utils_1.ANALYSIS_STARTED_REACTION),
                (0, utils_1.postResultsToPRComments)(toolName, problems.summary, sourceDir, postComment),
                core.summary.addRaw(problems.summary).write(),
                (0, annotations_1.publishAnnotations)(jobName, problems, failedByThreshold, useAnnotations)
            ]);
        }
        catch (error) {
            core.warning(`Qodana has problems with publishing results to GitHub – ${error.message}`);
        }
    });
}
function annotationsToProblemDescriptors(annotations) {
    var _a;
    return ((_a = annotations === null || annotations === void 0 ? void 0 : annotations.map(annotation => {
        return {
            title: annotation.title,
            level: (() => {
                switch (annotation.annotation_level) {
                    case annotations_1.ANNOTATION_FAILURE:
                        return output_1.FAILURE_LEVEL;
                    case annotations_1.ANNOTATION_WARNING:
                        return output_1.WARNING_LEVEL;
                    default:
                        return output_1.NOTICE_LEVEL;
                }
            })()
        };
    })) !== null && _a !== void 0 ? _a : []);
}
/*
 * The pull request with quick-fixes body template.
 */
function prFixesBody(jobUrl) {
    return ` 🖐 Hey there!

This pull request has been auto-generated by the [Qodana Scan workflow](${jobUrl}) configured in your repository.
It has performed code analysis and applied some suggested fixes to improve your code quality 🧹✨

> **Warning**
>  It's crucial to review these changes to ensure everything shipshape manually. Please take a moment to examine the changes here. Remember to run your integration tests against this PR to validate the fixes and ensure everything's functioning as expected.

_💻🔍 Happy reviewing and testing!
Best,
[Qodana Scan 🤖](https://github.com/marketplace/actions/qodana-scan)_`;
}
