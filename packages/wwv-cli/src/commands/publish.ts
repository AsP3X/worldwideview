import { Command } from 'commander';

export const publishCommand = new Command('publish')
  .description('Publish the plugin to NPM')
  .action(() => {
    console.log('Publish command stub');
  });
