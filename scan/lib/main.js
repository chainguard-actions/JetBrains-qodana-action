"use strict";
/*
 * Copyright 2021-2026 JetBrains s.r.o.
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
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const qodana_1 = require("../../common/qodana");
const utils_1 = require("./utils");
const output_1 = require("./output");
// Catch and log any unhandled exceptions.  These exceptions can leak out of the uploadChunk method in
// @actions/toolkit when a failed upload closes the file descriptor causing any in-process reads to
// throw an uncaught exception.  Instead of failing this action, just warn.
process.on('uncaughtException', e => core.warning(e.message));
function setFailed(message) {
    core.setFailed(message);
}
/**
 * Main Qodana GitHub Action entrypoint.
 * - gathers all action inputs
 * - loads caches
 * - creates the directories for Qodana results to ensure the correct permissions
 * - runs the Qodana image
 * - uploads the report as the job artifact
 * - saves caches
 * - uploads action annotations
 * Every step except the Qodana image run is optional.
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = (0, utils_1.getInputs)();
            yield io.mkdirP(inputs.resultsDir);
            yield io.mkdirP(inputs.cacheDir);
            const restoreCachesPromise = (0, utils_1.restoreCaches)(inputs.cacheDir, inputs.primaryCacheKey, inputs.additionalCacheKey, inputs.useCaches);
            yield Promise.all([
                (0, utils_1.putReaction)(utils_1.ANALYSIS_STARTED_REACTION, utils_1.ANALYSIS_FINISHED_REACTION),
                (0, utils_1.prepareAgent)(inputs.args, inputs.nightlyVersion),
                restoreCachesPromise
            ]);
            const reservedCacheKey = yield restoreCachesPromise;
            const exitCode = (yield (0, utils_1.qodana)(inputs));
            const canUploadCache = (0, utils_1.isNeedToUploadCache)(inputs.useCaches, inputs.cacheDefaultBranchOnly) &&
                (0, qodana_1.isExecutionSuccessful)(exitCode);
            yield Promise.all([
                (0, utils_1.pushQuickFixes)(inputs.pushFixes, inputs.commitMessage),
                (0, utils_1.uploadArtifacts)(inputs.resultsDir, inputs.artifactName, inputs.uploadResult),
                (0, utils_1.uploadCaches)(inputs.cacheDir, inputs.primaryCacheKey, reservedCacheKey, canUploadCache),
                (0, output_1.publishOutput)(exitCode === qodana_1.QodanaExitCode.FailThreshold, (0, qodana_1.extractArg)('-i', '--project-dir', inputs.args), (0, qodana_1.extractArg)('-d', '--source-directory', inputs.args), inputs.resultsDir, inputs.useAnnotations, inputs.postComment, inputs.prMode, (0, qodana_1.isExecutionSuccessful)(exitCode))
            ]);
            if (!(0, qodana_1.isExecutionSuccessful)(exitCode)) {
                setFailed(`qodana scan failed with exit code ${exitCode}`);
            }
            else if (exitCode === qodana_1.QodanaExitCode.FailThreshold) {
                setFailed(qodana_1.FAIL_THRESHOLD_OUTPUT);
            }
        }
        catch (error) {
            setFailed(error.message);
        }
    });
}
void main();
