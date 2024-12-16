/**
 * External dependencies
 */
const commander = require('commander');

const { actionCreateBlock } = require('./actions/createBlock');
const { actionMigrateBlocks } = require('./actions/migrateBlocks');
const { actionReuseBlock } = require('./actions/reuseBlock');
const commandName = 'bp-create-block';
const { version } = require('../package.json');

const program = new commander.Command();

program
   .command('create', { isDefault: true })
   .description('Create a new block')
   .action(() => {
      console.log(`Starting ${commandName} @${version} - create`);
      actionCreateBlock();
   });

program
   .command('migrate')
   .description('Migration tool for upgrading blocks from v1 to v2')
   .action(() => {
      console.log(`Starting ${commandName} @${version} - migrate`);
      actionMigrateBlocks();
   });

program
   .command('reuse')
   .description('Reuse an existing block')
   .action(() => {
      console.log(`Starting ${commandName} @${version} - reuse`);
      actionReuseBlock();
   });


program.parse(process.argv);
