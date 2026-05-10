import type { 
    WorldPlugin, 
    PluginContext, 
    TimeRange, 
    GeoEntity, 
    CesiumEntityOptions, 
    LayerConfig
} from "@worldwideview/wwv-plugin-sdk";
import { manifest } from "./manifest";

export class NzTrafficCamerasPlugin implements WorldPlugin {
    id = manifest.id;
    name = manifest.name;
    description = manifest.description;
    icon = "Camera"; // Placeholder for generic camera icon
    category = "infrastructure" as const;
    version = manifest.version;

    private context?: PluginContext;

    async initialize(ctx: PluginContext): Promise<void> {
        this.context = ctx;
    }

    destroy(): void {
        this.context = undefined;
    }

    getPollingInterval(): number {
        return 0; // 0 means WebSocket only stream. Polling is disabled.
    }

    async fetch(timeRange: TimeRange): Promise<GeoEntity[]> {
        // Return empty array. Data flows purely through WebSocket events emitted by the data engine.
        return [];
    }

    getLayerConfig(): LayerConfig {
        return {
            color: "#FFA500", // Orange
            clusterEnabled: true,
            clusterDistance: 50
        };
    }

    renderEntity(entity: GeoEntity): CesiumEntityOptions {
        // Ensure separation of billboard and point properties to prevent GPU clipping
        return {
            type: "billboard",
            color: "#FFA500",
            iconScale: 0.6
        };
    }
}

export default function createPlugin() {
    return new NzTrafficCamerasPlugin();
}
