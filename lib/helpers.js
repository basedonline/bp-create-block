/**
 * Sub commands
 */
var shell = require('shelljs');
function testBlockVersion() {
   var blockVersion = '';
   if (shell.test('-e', '_example.php')) {
      blockVersion = 'v1';
   }

   if (shell.test('-e', '_example/example.php')) {
      blockVersion = 'v2';
   }
   shell.echo(`Tested project for block support and found: ${blockVersion}\n`);
   return blockVersion;
}

exports.testBlockVersion = testBlockVersion;