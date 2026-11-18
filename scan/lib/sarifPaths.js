"use strict";
/*
 * Copyright 2021-2026 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUriBaseId = resolveUriBaseId;
exports.resolveLocationUri = resolveLocationUri;
class CyclicUriBaseIdError extends Error {
}
function resolveUriBaseIdImpl(originalUriBaseIds, uriBaseId, visited) {
    var _a;
    if (visited.includes(uriBaseId)) {
        throw new CyclicUriBaseIdError();
    }
    visited.push(uriBaseId);
    const artifactLocation = originalUriBaseIds[uriBaseId];
    if (artifactLocation === undefined)
        return '';
    const uri = (_a = artifactLocation.uri) !== null && _a !== void 0 ? _a : '';
    const parentUriBaseId = artifactLocation.uriBaseId;
    const resolved = parentUriBaseId === undefined
        ? uri
        : resolveUriBaseIdImpl(originalUriBaseIds, parentUriBaseId, visited) + uri;
    // Directory URIs may omit the trailing separator. Normalize it before
    // appending an artifact URI, matching Qodana's SARIF report reader.
    return resolved === '' || resolved.endsWith('/') ? resolved : `${resolved}/`;
}
function resolveUriBaseId(originalUriBaseIds, uriBaseId) {
    try {
        return resolveUriBaseIdImpl(originalUriBaseIds, uriBaseId, []);
    }
    catch (error) {
        if (error instanceof CyclicUriBaseIdError)
            return '';
        throw error;
    }
}
function resolveLocationUri(location, originalUriBaseIds) {
    var _a;
    const artifactLocation = (_a = location.physicalLocation) === null || _a === void 0 ? void 0 : _a.artifactLocation;
    if (artifactLocation === undefined || artifactLocation.uri === undefined) {
        return null;
    }
    const uri = artifactLocation.uri;
    return artifactLocation.uriBaseId === undefined
        ? uri
        : resolveUriBaseId(originalUriBaseIds, artifactLocation.uriBaseId) + uri;
}
