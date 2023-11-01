const { testBlockVersion } = require('../helpers');
const fs = require('fs');
const path = require('path');
// path of this file
const dirname = path.dirname(__filename);
const packageRoot = path.resolve(dirname, '../../');
var blocks = path.resolve('./');
const themeRoot = path.resolve(blocks, '../../');

function actionMigrateBlocks() {
   const version = testBlockVersion();

   if (version != 'v1') {
      console.log('Already migrated to v2. Exiting...');
      return;
   }
   console.log(blocks);
   var files = fs.readdirSync(blocks);
   moveBlocksFolder();

   files = fs.readdirSync(blocks);
   replaceExample(files);

   files.forEach(file => {
      if (file.endsWith('.php')) {
         console.log(`Migrating ${file}`);
      }
   });
}
exports.actionMigrateBlocks = actionMigrateBlocks;



function moveBlocksFolder() {
   // move blocks folder to ../blocks
   var oldBlocks = blocks;
   blocks = path.resolve(themeRoot, 'blocks');
   fs.mkdirSync(blocks);

   // move files
   const files = fs.readdirSync(oldBlocks);
   files.forEach(file => {
      const src = path.resolve(oldBlocks, file);
      const dest = path.resolve(blocks, file);
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
   });

   fs.rmdirSync(oldBlocks);
}

/**
 *  Step 2 - update example folder
 * @param {*} files 
 */
function replaceExample(files) {
   // remove _example.php
   files.forEach(file => {
      if (file.endsWith('_example.php')) {
         //fs.unlinkSync(file);
      }
   });

   // copy packageRoot/examples/v2 to dir/_example folder
   const exampleDir = path.resolve(packageRoot, 'examples/v2');
   const exampleFiles = fs.readdirSync(exampleDir);

   // create _example folder in blocks
   const exampleFolder = path.resolve(blocks, '_example');
   fs.mkdirSync(exampleFolder);

   // copy files
   exampleFiles.forEach(file => {
      const src = path.resolve(exampleDir, file);
      const dest = path.resolve(exampleFolder, file);
      fs.copyFileSync(src, dest);
   });

}