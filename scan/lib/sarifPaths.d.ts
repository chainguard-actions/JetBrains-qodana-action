import type { ArtifactLocation, Location } from 'sarif';
export type OriginalUriBaseIds = Record<string, ArtifactLocation>;
export declare function resolveUriBaseId(originalUriBaseIds: OriginalUriBaseIds, uriBaseId: string): string;
export declare function resolveLocationUri(location: Location, originalUriBaseIds: OriginalUriBaseIds): string | null;
