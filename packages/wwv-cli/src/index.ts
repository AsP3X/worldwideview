import { Command } from "commander";

import { createPlugin } from "./commands/create";

const program = new Command();

program
  .name("wwv")
  .description("WorldWideView Plugin CLI")
  .version("1.0.0");

program
  .command("create <name>")
  .description("Scaffold a new WorldWideView plugin")
  .action(async (name) => {
      try {
          await createPlugin(name);
      } catch (err: any) {
          console.error("Error:", err.message);
          process.exit(1);
      }
  });

import { startDevServer } from "./commands/dev";

program
  .command("dev")
  .description("Start the plugin development server with hot-reload")
  .option("-t, --target <url>", "Target WorldWideView URL", "http://localhost:3000")
  .action(async (options) => {
      try {
          await startDevServer(options.target);
      } catch (err: any) {
          console.error("Error:", err.message);
          process.exit(1);
      }
  });

import { packagePlugin } from "./commands/package";
import { publishToNpm } from "./commands/publish";

program
  .command("package")
  .description("Build and package the plugin into a .wwvpkg file for sideloading")
  .action(async () => {
      try {
          await packagePlugin();
      } catch (err: any) {
          console.error("Error:", err.message);
          process.exit(1);
      }
  });

program
  .command("publish")
  .description("Publish the plugin to NPM and notify the WWV Marketplace")
  .action(async () => {
      try {
          await publishToNpm();
      } catch (err: any) {
          console.error("Error:", err.message);
          process.exit(1);
      }
  });

program.parse();
