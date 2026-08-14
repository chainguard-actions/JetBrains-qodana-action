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
exports.ANNOTATION_NOTICE = exports.ANNOTATION_WARNING = exports.ANNOTATION_FAILURE = void 0;
exports.publishAnnotations = publishAnnotations;
exports.parseSarif = parseSarif;
exports.getGitHubCheckConclusion = getGitHubCheckConclusion;
exports.toAnnotationProperties = toAnnotationProperties;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const utils_1 = require("./utils");
const output_1 = require("../../common/output");
const utils_2 = require("../../common/utils");
function getQodanaHelpString() {
    return `This result was published with [Qodana GitHub Action](${(0, utils_1.getWorkflowRunUrl)()})`;
}
exports.ANNOTATION_FAILURE = 'failure';
exports.ANNOTATION_WARNING = 'warning';
exports.ANNOTATION_NOTICE = 'notice';
const FAILURE_STATUS = 'failure';
const NEUTRAL_STATUS = 'neutral';
const SUCCESS_STATUS = 'success';
const MAX_ANNOTATIONS = 50;
/**
 * Publish SARIF to GitHub Checks.
 * @param name The name of the Check.
 * @param problems The output to publish.
 * @param failedByThreshold flag if the Qodana failThreshold was reached.
 * @param execute whether to execute the promise or not.
 */
function publishAnnotations(name, problems, failedByThreshold, execute) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!execute) {
            return;
        }
        try {
            if (problems.annotations.length >= MAX_ANNOTATIONS) {
                for (let i = 0; i < problems.annotations.length; i += MAX_ANNOTATIONS) {
                    yield (0, utils_1.publishGitHubCheck)(failedByThreshold, name, {
                        title: problems.title,
                        text: getQodanaHelpString(),
                        summary: problems.summary,
                        annotations: problems.annotations.slice(i, i + MAX_ANNOTATIONS)
                    });
                }
            }
            else {
                yield (0, utils_1.publishGitHubCheck)(failedByThreshold, name, problems);
            }
        }
        catch (error) {
            core.info(`Not able to publish annotations with Checks API – ${error.message}, 
    using limited (10 problems per level) output instead. Check job permissions (checks: write, pull-requests: write needed)`);
            for (const p of problems.annotations) {
                const properties = toAnnotationProperties(p);
                switch (p.annotation_level) {
                    case exports.ANNOTATION_FAILURE:
                        core.error(p.message, properties);
                        break;
                    case exports.ANNOTATION_WARNING:
                        core.warning(p.message, properties);
                        break;
                    default:
                        core.notice(p.message, properties);
                }
            }
        }
    });
}
/**
 * Converts a SARIF result to a GitHub Check Annotation.
 * @param result The SARIF log to convert.
 * @param rules The map of SARIF rule IDs to their descriptions.
 * @returns GitHub Check annotations are created for each result.
 */
function parseResult(result, rules) {
    var _a, _b;
    if (!result.locations ||
        result.locations.length === 0 ||
        !result.locations[0].physicalLocation) {
        return null;
    }
    const location = result.locations[0].physicalLocation;
    const region = location.region;
    return {
        message: (_a = result.message.markdown) !== null && _a !== void 0 ? _a : result.message.text,
        title: (_b = rules.get(result.ruleId)) === null || _b === void 0 ? void 0 : _b.shortDescription,
        path: location.artifactLocation.uri,
        start_line: (region === null || region === void 0 ? void 0 : region.startLine) || 0,
        end_line: (region === null || region === void 0 ? void 0 : region.endLine) || (region === null || region === void 0 ? void 0 : region.startLine) || 1,
        start_column: (region === null || region === void 0 ? void 0 : region.startLine) === (region === null || region === void 0 ? void 0 : region.endColumn) ? region === null || region === void 0 ? void 0 : region.startColumn : undefined,
        end_column: (region === null || region === void 0 ? void 0 : region.startLine) === (region === null || region === void 0 ? void 0 : region.endColumn) ? region === null || region === void 0 ? void 0 : region.endColumn : undefined,
        annotation_level: (() => {
            switch (result.level) {
                case 'error':
                    return exports.ANNOTATION_FAILURE;
                case 'warning':
                    return exports.ANNOTATION_WARNING;
                default:
                    return exports.ANNOTATION_NOTICE;
            }
        })()
    };
}
/**
 * Converts a SARIF from the given path to a GitHub Check Output.
 * @param path The SARIF path to convert.
 * @returns GitHub Check Outputs with annotations are created for each result.
 */
function parseSarif(path) {
    var _a;
    const sarif = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
    const run = sarif.runs[0];
    const rules = (0, utils_2.parseRules)(run.tool);
    let title = 'No new problems found by ';
    let annotations = [];
    if ((_a = run.results) === null || _a === void 0 ? void 0 : _a.length) {
        annotations = run.results
            .filter(result => result.baselineState !== 'unchanged' &&
            result.baselineState !== 'absent')
            .map(result => parseResult(result, rules))
            .filter((a) => a !== null && a !== undefined);
        title = `${annotations.length} ${(0, output_1.getProblemPlural)(annotations.length)} found by `;
    }
    const name = run.tool.driver.fullName || 'Qodana';
    title += name;
    return {
        title,
        text: getQodanaHelpString(),
        summary: title,
        annotations
    };
}
/**
 * Get a conclusion for the given set of annotations
 * @param annotations GitHub Check annotations.
 * @param failedByThreshold flag if the Qodana failThreshold was reached.
 * @returns The conclusion to use for the GitHub Check.
 */
function getGitHubCheckConclusion(annotations, failedByThreshold) {
    if (failedByThreshold) {
        return FAILURE_STATUS;
    }
    const s = new Set(annotations.map(a => a.annotation_level));
    if (s.has(exports.ANNOTATION_FAILURE) ||
        s.has(exports.ANNOTATION_NOTICE) ||
        s.has(exports.ANNOTATION_WARNING)) {
        return NEUTRAL_STATUS;
    }
    return SUCCESS_STATUS;
}
/**
 * Converts Annotation to AnnotationProperties for core GitHub actions API.
 * @param a Annotation to convert.
 */
function toAnnotationProperties(a) {
    return {
        title: a.title,
        file: a.path,
        startLine: a.start_line || 0,
        endLine: a.end_line || 1,
        startColumn: a.start_column,
        endColumn: a.end_column
    };
}
