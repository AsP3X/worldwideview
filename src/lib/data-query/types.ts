import type { GeoEntity } from "@worldwideview/wwv-plugin-sdk";
import type { FilterValue } from "@/core/plugins/PluginTypes";

export interface SearchOptions {
    query: string;
    pluginId?: string;
    limit?: number;
    /** Optional inline filters keyed by entity property key (FILT-04, D-07). */
    filters?: Record<string, FilterValue>;
}

export interface SearchResult {
    id: string;
    pluginId: string;
    name?: string;
    latitude: number;
    longitude: number;
}

export interface RegionOptions {
    north: number;
    south: number;
    east: number;
    west: number;
    pluginId?: string;
    limit?: number;
}

export interface DetailResult {
    id: string;
    pluginId: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp: Date;
    label?: string;
    properties: Record<string, unknown>;
}

export interface PluginDataSnapshot {
    pluginId: string;
    entities: GeoEntity[];
    timestamp: Date;
}
