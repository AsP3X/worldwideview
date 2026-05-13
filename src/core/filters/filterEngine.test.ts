import { describe, it, expect } from "vitest";
import { applyFilters } from "./filterEngine";
import type { GeoEntity, FilterDefinition, FilterValue } from "@/core/plugins/PluginTypes";
import fc from "fast-check";

const geoEntityArbitrary = fc.record({
    id: fc.string(),
    pluginId: fc.string(),
    name: fc.string(),
    description: fc.string(),
    position: fc.record({
        lat: fc.double({ noNaN: true }),
        lon: fc.double({ noNaN: true }),
        alt: fc.double({ noNaN: true })
    }),
    properties: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.double(), fc.boolean()))
}) as fc.Arbitrary<GeoEntity>;

describe("applyFilters", () => {
    it("property test: returns the exact original array when no active filters are provided", () => {
        fc.assert(
            fc.property(
                fc.array(geoEntityArbitrary),
                (entities) => {
                    const definitions: FilterDefinition[] = [];
                    const activeFilters: Record<string, FilterValue> = {};
                    const result = applyFilters(entities, definitions, activeFilters);
                    expect(result).toEqual(entities);
                }
            )
        );
    });

    it("property test: returns a subset or equal array of original entities when filtering by text", () => {
        fc.assert(
            fc.property(
                fc.array(geoEntityArbitrary),
                fc.dictionary(
                    fc.string(),
                    fc.record({
                        type: fc.constant("text" as const),
                        value: fc.string()
                    })
                ),
                (entities, activeFilters) => {
                    const definitions: FilterDefinition[] = Object.keys(activeFilters).map(id => ({
                        id,
                        label: id,
                        type: "text",
                        propertyKey: id
                    }));
                    const result = applyFilters(entities, definitions, activeFilters as Record<string, FilterValue>);
                    expect(result.length).toBeLessThanOrEqual(entities.length);
                    // Every item in result must exist in original entities
                    result.forEach(item => {
                        expect(entities).toContainEqual(item);
                    });
                }
            )
        );
    });

    it("traditional test: handles various filter types correctly", () => {
        const entities: GeoEntity[] = [
            {
                id: "1",
                pluginId: "test",
                name: "test1",
                description: "",
                position: { lat: 0, lon: 0, alt: 0 },
                properties: { category: "A", speed: 50, active: true, invalidNum: "NaN" },
            },
            {
                id: "2",
                pluginId: "test",
                name: "test2",
                description: "",
                position: { lat: 0, lon: 0, alt: 0 },
                properties: { category: "B", speed: 100, active: false, noProp: undefined },
            }
        ];

        // 1. Missing definition
        expect(applyFilters(entities, [], { "missing": { type: "boolean", value: true } as FilterValue })).toEqual(entities);

        // 2. Select filter
        const selectDef: FilterDefinition = { id: "cat", label: "Category", type: "select", propertyKey: "category" };
        expect(
            applyFilters(entities, [selectDef], { "cat": { type: "select", values: ["A"] } })
        ).toEqual([entities[0]]);
        
        expect(
            applyFilters(entities, [selectDef], { "cat": { type: "select", values: [] } })
        ).toEqual(entities); // empty select = no filter

        expect(
            applyFilters(entities, [selectDef], { "cat": { type: "select", values: ["C"] } })
        ).toEqual([]);

        // 3. Range filter
        const rangeDef: FilterDefinition = { id: "spd", label: "Speed", type: "range", propertyKey: "speed", min: 0, max: 200 };
        expect(
            applyFilters(entities, [rangeDef], { "spd": { type: "range", min: 60, max: 150 } })
        ).toEqual([entities[1]]);

        const invalidRangeDef: FilterDefinition = { id: "inv", label: "Invalid", type: "range", propertyKey: "invalidNum", min: 0, max: 200 };
        expect(
            applyFilters(entities, [invalidRangeDef], { "inv": { type: "range", min: 0, max: 100 } })
        ).toEqual([entities[1]]); // entities[0] is "NaN" -> fails. entities[1] is undefined -> 0 -> matches

        // 4. Boolean filter
        const boolDef: FilterDefinition = { id: "act", label: "Active", type: "boolean", propertyKey: "active" };
        expect(
            applyFilters(entities, [boolDef], { "act": { type: "boolean", value: false } })
        ).toEqual([entities[1]]);

        // 5. Default fallback (unknown filter type)
        const unknownDef: FilterDefinition = { id: "unk", label: "Unknown", type: "unknown" as any, propertyKey: "active" };
        expect(
            applyFilters(entities, [unknownDef], { "unk": { type: "unknown" as any } as any })
        ).toEqual(entities);
        
        // 6. Text filter (empty value)
        const textDef: FilterDefinition = { id: "txt", label: "Text", type: "text", propertyKey: "name" };
        expect(
            applyFilters(entities, [textDef], { "txt": { type: "text", value: "" } })
        ).toEqual(entities);
    });
});
