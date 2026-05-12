import { Command } from 'commander';

export const createCommand = new Command('create')
  .description('Scaffold a new WorldWideView plugin in the local-plugins sandbox')
  .action(() => {
    console.log('Create command stub');
  });
