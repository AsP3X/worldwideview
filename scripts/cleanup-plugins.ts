import { prisma } from "../src/lib/db";

async function main() {
    const plugins = await prisma.installedPlugin.findMany();
    // eslint-disable-next-line no-console
    console.log("Installed plugins:");
    // eslint-disable-next-line no-console
    plugins.forEach((p) => console.log(`  ${p.pluginId} | config: ${p.config.substring(0, 60)}`));

    const geojson = plugins.find((p) => p.pluginId === "geojson");
    if (geojson) {
        await prisma.installedPlugin.delete({ where: { id: geojson.id } });
        // eslint-disable-next-line no-console
        console.log("\nDeleted orphaned 'geojson' record.");
    } else {
        // eslint-disable-next-line no-console
        console.log("\nNo orphaned 'geojson' record found.");
    }

    const remaining = await prisma.installedPlugin.findMany();
    // eslint-disable-next-line no-console
    console.log("\nRemaining plugins:");
    // eslint-disable-next-line no-console
    remaining.forEach((p) => console.log(`  ${p.pluginId}`));

    await prisma.$disconnect();
}

// eslint-disable-next-line no-console
main().catch(console.error);
