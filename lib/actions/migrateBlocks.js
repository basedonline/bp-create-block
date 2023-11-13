const { testBlockVersion } = require('../helpers');
const fs = require('fs');
const path = require('path');
var colors = require('colors');
var runner = require('child_process');

const { exit } = require('process');
// path of this file
const dirname = path.dirname(__filename);
const packageRoot = path.resolve(dirname, '../../');
const oldBlocks = path.resolve('./');
const prompt = require('prompt-sync')();
const themeRoot = path.resolve(oldBlocks, '../../');
const blockRenderer = path.resolve(packageRoot, 'lib/actions/blockrenderer.php');
const newBlocks = path.resolve(themeRoot, 'blocks');
const viewsFolder = path.resolve(themeRoot, 'resources/views/blocks');
const scssFolder = path.resolve(themeRoot, 'resources/assets/styles/05-blocks');
var alreadyRun = false;
colors.enable()


function actionMigrateBlocks() {
   const version = testBlockVersion();

   if (version != 'v1') {
      console.log('Already migrated to v2. Exiting...');
      return;
   }

   console.log(`Before you continue, make sure that all your work is commited.\n`.yellow);
   const confirm = prompt(`Are you sure you want to migrate to v2? (y/n) `);

   if (confirm != 'y') {
      console.log(`Exiting...`.yellow);
      return;
   }
   /**
    * Step 1 - move blocks folder to theme root
    */
   moveBlocksFolder();


   if (false == alreadyRun) {
      /**
 * Step 2 - update example folder
 */
      replaceExample();

      /**
 * Step 3 - update functions.php
 */
      updateFunctions();
   }

   files = fs.readdirSync(newBlocks);

   const total = files.length - 1;
   var counter = 0;
   files.forEach(file => {

      // if file starts with _ , skip
      if (file.startsWith('_')) {
         return;
      }

      if (file.endsWith('.php')) {
         counter++;
         console.log(`${counter}/${total} - Start Migrating ${file}`.green);
         updateBlock(file);
      }
   });

   console.log(`Migration to v2 is finished, make sure to double-check your site.`.green);
}
exports.actionMigrateBlocks = actionMigrateBlocks;


/**
 * Step 1 - move blocks folder to theme root
 */
function moveBlocksFolder() {

   // check if newBlocks exists
   if (fs.existsSync(newBlocks)) {
      console.log(`Folder ${newBlocks} already exists. Continuing process.`.yellow);
      alreadyRun = true;
   } else {
      fs.mkdirSync(newBlocks);
   }

   const files = fs.readdirSync(oldBlocks);
   files.forEach(file => {
      const src = path.resolve(oldBlocks, file);
      const dest = path.resolve(newBlocks, file);
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
   });

   fs.rmdirSync(oldBlocks);
}

/**
 *  Step 2 - update example folder
 * @param {*} files 
 */
function replaceExample() {
   // remove newBlocks/_example.php
   const examplePHP = path.resolve(newBlocks, '_example.php');
   const exampleTwig = path.resolve(viewsFolder, '_example.twig');

   fs.unlinkSync(examplePHP);
   fs.unlinkSync(exampleTwig);


   // copy packageRoot/examples/v2 to dir/_example folder
   const exampleDir = path.resolve(packageRoot, 'examples/v2');
   const exampleFiles = fs.readdirSync(exampleDir);

   // create _example folder in blocks
   const exampleFolder = path.resolve(newBlocks, '_example');
   fs.mkdirSync(exampleFolder);

   // copy example files
   exampleFiles.forEach(file => {
      const src = path.resolve(exampleDir, file);
      const dest = path.resolve(exampleFolder, file);
      fs.copyFileSync(src, dest);
   });
}

/**
 * Step 3 - update functions.php
 */
function updateFunctions() {
   // open root/functions.php
   const functionsFile = path.resolve(themeRoot, 'functions.php');
   var content = fs.readFileSync(functionsFile, 'utf8');

   // find $autoloader->child(['models']) and add something to the line below
   const find = `$autoloader->child(['models']);`;
   // find this in the content
   var findInContent = `$autoloader = new Autoloader();`;
   // if findInContent is found, add a new line below
   if (content.includes(findInContent)) {
      // add a new line below with $autoloader->child_blocks();
      const replace = `$autoloader = new Autoloader();
      $autoloader->child_blocks();`;
      content = content.replace(findInContent, replace);

      if (!content.includes(replace)) {
         console.warn(`Error altering functions.php`.red);
         exit();
      }
      console.log('')
   }

   //find , 'blocks' and remove it
   const find2 = `, 'blocks'`;
   content = content.replace(find2, '');
   fs.writeFileSync(functionsFile, content);
   console.log(`Updating functions.php successful`);
   console.log()
}

function updateBlock(file) {
   // file name without extension
   const name = file.replace('.php', '');

   // create folder with name in blocks
   const blockFolder = path.resolve(newBlocks, name);
   fs.mkdirSync(blockFolder);

   // move file to folder
   const src = path.resolve(newBlocks, file);
   const dest = path.resolve(blockFolder, file);
   fs.copyFileSync(src, dest);
   fs.unlinkSync(src);

   // find twig file and move it to blockFolder
   const views = fs.readdirSync(viewsFolder);
   var foundFile = false;
   views.forEach(file => {
      if (file.startsWith(name)) {
         const src = path.resolve(viewsFolder, file);

         // if folder
         if (fs.lstatSync(src).isDirectory()) {
            fs.mkdirSync(dest);
            const files = fs.readdirSync(src);
            files.forEach(file => {
               const src2 = path.resolve(src, dest);
               fs.copyFileSync(src2, dest);
               fs.unlinkSync(src2);
            });

            fs.rmdirSync(src);
         } else {
            fs.copyFileSync(src, dest);
            fs.unlinkSync(src);
         }

         console.log(`1. Succesfully moved ${file}`);
         foundFile = true;
         return;
      }
   });

   if (!foundFile) {
      console.warn(`1. Error moving ${name}.twig`.red);
   }

   // find scss file and move it to blockFolder
   const scss = fs.readdirSync(scssFolder);
   foundFile = false;
   scss.forEach(file => {
      if (file.startsWith('_acf-' + name)) {
         const src = path.resolve(scssFolder, file);
         const dest = path.resolve(blockFolder, file);
         fs.copyFileSync(src, dest);
         fs.unlinkSync(src);
         console.log(`2. Succesfully moved ${file}`);
         foundFile = true;
         return;
      }
   });

   if (!foundFile) {
      console.warn(`2. Error moving ${name}.scss`.red);
   }

   // open scssFolder/_index.scss
   const indexFile = path.resolve(scssFolder, '_index.scss');
   var content = fs.readFileSync(indexFile, 'utf8');

   //find = `@import "acf-${name}";`; and replace it with `@import "~blocks/${name}/acf-${name}";`
   const find = `@import "acf-${name}";`;
   const replace = `@import "~blocks/${name}/acf-${name}";`;
   content = content.replace(find, replace);

   if (!content.includes(replace)) {
      console.warn(`3. Error altering import of acf-${name}.scss`.red);
   } else {
      fs.writeFileSync(indexFile, content);
      console.log(`3. Succesfully altering import of acf-${name}.scss`);
   }



   // create empty index.js file in blockFolder
   const jsFile = path.resolve(blockFolder, 'index.js');
   fs.writeFileSync(jsFile, '');
   console.log(`4. Succesfully created index.js`);

   // copy exampleFolder/block.json to blockFolder/block.json
   const exampleFolder = path.resolve(newBlocks, '_example');
   const exampleFiles = fs.readdirSync(exampleFolder);

   // find block.json in exampleFolder
   exampleFiles.forEach(file => {
      if (file.startsWith('block.json')) {
         const src = path.resolve(exampleFolder, file);
         const dest = path.resolve(blockFolder, file);
         fs.copyFileSync(src, dest);
         console.log(`5. Succesfully created block.json`);
         return;
      }
   });

   // update php.file
   const phpFile = path.resolve(blockFolder, file);
   content = fs.readFileSync(phpFile, 'utf8');
   content = content.replace(`BlockRendererV1`, `BlockRendererV2`);

   if (!content.includes('BlockRendererV2')) {
      console.warn(`6. Error altering BlockRendererV1 to BlockRendererV2`.red);
   } else {
      fs.writeFileSync(phpFile, content);
      console.log(`6. Succesfully updated ${file}`);
   }

   // find first "{" and add a new line below
   const find3 = `{`;
   const replace3 = `{\n\tconst NAME = '${name}';\n`;

   content = content.replace(find3, replace3);
   fs.writeFileSync(phpFile, content);

   // find "$block = [" until the next "];" and copy it to block.json
   const from = content.indexOf('$block = [');
   const to = content.indexOf('];', from) + 2;
   const block = content.substring(from, to);
   const blockJSON = path.resolve(blockFolder, 'block.json');

   // write blockJSON to the end of block.json
   fs.appendFileSync(blockJSON, block);
   console.log()
   console.log(`Automatic tasks for ${name} done`.green);
   console.log()
   console.log(`Please do the following manually for ${name}:`.yellow);
   console.log(`1. Update block.json`.yellow);
   console.log(`2. Remove block_register() method from the php file.`.yellow);
   console.log()
   prompt(`When you are done with ${name}, press any key to continue...`);
   console.log('\n');
}