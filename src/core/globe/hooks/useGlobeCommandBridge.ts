import { useEffect } from "react";
import { dataBus } from "@/core/data/DataBus";
import { useStore } from "@/core/state/store";
import { isValidGlobeCommand } from "@/core/globe/types/GlobeCommand";
import type { GlobeCommand } from "@/core/globe/types/GlobeCommand";

function dispatchCommand(cmd: GlobeCommand): void {
    switch (cmd.type) {
        case "pan":
            dataBus.emit("cameraGoTo", {
                lat: cmd.lat,
                lon: cmd.lon,
                alt: cmd.alt,
                // cameraGoTo exposes maxPitch (a clamp), not a target pitch angle,
                // so cmd.pitch is intentionally not forwarded here.
                ...(cmd.heading !== undefined ? { heading: cmd.heading } : {}),
            });
            break;

        case "focusEntity":
            if (cmd.lat !== undefined && cmd.lon !== undefined) {
                dataBus.emit("cameraGoTo", {
                    lat: cmd.lat,
                    lon: cmd.lon,
                    alt: 0,
                });
            } else if (cmd.entityId !== undefined) {
                // Entity-id-only resolution is not yet wired to the entity registry.
                // Provide lat/lon alongside entityId to trigger a camera move.
                console.warn(
                    "[useGlobeCommandBridge] focusEntity by id not yet supported; provide lat/lon",
                    cmd.entityId,
                );
            }
            break;

        case "toggleLayer": {
            const state = useStore.getState();
            if (cmd.enabled !== undefined) {
                state.setLayerEnabled(cmd.layerId, cmd.enabled);
            } else {
                state.toggleLayer(cmd.layerId);
            }
            break;
        }

        case "setTimeline": {
            const state = useStore.getState();
            if (cmd.timeWindow !== undefined) {
                // cmd.timeWindow is narrowed to TimeWindowLiteral by isValidGlobeCommand.
                state.setTimeWindow(cmd.timeWindow);
            }
            if (cmd.isPlaybackMode !== undefined) {
                state.setPlaybackMode(cmd.isPlaybackMode);
            }
            if (cmd.currentTime !== undefined) {
                const d = new Date(cmd.currentTime);
                if (!Number.isNaN(d.getTime())) {
                    state.setCurrentTime(d);
                }
            }
            break;
        }
    }
}

export function useGlobeCommandBridge(sessionId: string): void {
    useEffect(() => {
        if (!sessionId) return;

        const es = new EventSource(
            `/api/globe/commands/stream?sessionId=${encodeURIComponent(sessionId)}`,
        );

        es.onmessage = (event: MessageEvent) => {
            try {
                const parsed: unknown = JSON.parse(event.data as string);
                if (
                    parsed !== null &&
                    typeof parsed === "object" &&
                    "commands" in parsed &&
                    Array.isArray((parsed as { commands: unknown }).commands)
                ) {
                    (parsed as { commands: unknown[] }).commands
                        .filter(isValidGlobeCommand)
                        .forEach(dispatchCommand);
                }
            } catch (err) {
                console.error("[useGlobeCommandBridge] Failed to parse SSE message:", err);
            }
        };

        es.onerror = (err: Event) => {
            console.error("[useGlobeCommandBridge] EventSource error:", err);
            // EventSource auto-reconnects; no manual action needed.
        };

        return () => {
            es.close();
        };
    }, [sessionId]);
}
