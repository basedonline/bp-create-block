/**
 * External dependencies
 */
const commander = require('commander');

const { actionCreateBlock } = require('./actions/createBlock');
const { actionMigrateBlocks } = require('./actions/migrateBlocks');
const { actionReuseBlock } = require('./actions/reuseBlock');
const { ACFv2toV3 } = require('./actions/v2-to-v3');
const commandName = 'bp-create-block';
const { version } = require('../package.json');

const program = new commander.Command();

program
   .command('create', { isDefault: true })
   .description('Create a new block')
   .action(() => {
      console.log('⚠️  Warning: wp-lemon-create is deprecated. Please use "npx wp-lemon block create" instead. ⚠️ \n');
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
      shell.echo('⚠️  Warning: wp-lemon-create is deprecated. Please use "npx wp-lemon block reuse" instead. ⚠️ \n');
      console.log(`Starting ${commandName} @${version} - reuse`);
      actionReuseBlock();
   });

program
   .command('v2-to-v3')
   .description('Update blocks from ACF version 2 to version 3')
   .action(() => {
      shell.echo('⚠️  Warning: wp-lemon-create is deprecated. Please use "npx wp-lemon blocks update" instead. ⚠️ \n');
      console.log(`Starting ${commandName} @${version} - v2-to-v3`);
      ACFv2toV3();
   });

program.parse(process.argv);
