const { testBlockVersion } = require('../helpers');
const fs = require('fs');
const path = require('path');
var colors = require('colors');
// path of this file
const dirname = path.dirname(__filename);
const packageRoot = path.resolve(dirname, '../../');
const oldBlocks = path.resolve('./');
const themeRoot = path.resolve(oldBlocks, '../../');
const newBlocks = path.resolve(themeRoot, 'blocks');
const viewsFolder = path.resolve(themeRoot, 'resources/views/blocks');
const scssFolder = path.resolve(themeRoot, 'resources/assets/styles/05-blocks');
colors.enable()
function actionMigrateBlocks() {
   const version = testBlockVersion();

   if (version != 'v1') {
      console.log('Already migrated to v2. Exiting...');
      return;
   }

   /**
    * Step 1 - move blocks folder to theme root
    */
   moveBlocksFolder();

   /**
    * Step 2 - update example folder
    */
   replaceExample();

   /**
    * Step 3 - update functions.php
    */
   updateFunctions();

   files = fs.readdirSync(newBlocks);
   files.forEach(file => {
      if (file.endsWith('.php')) {
         console.log(`Migrating ${file}`);
         updateBlock(file);
      }
   });
}
exports.actionMigrateBlocks = actionMigrateBlocks;


/**
 * Step 1 - move blocks folder to theme root
 */
function moveBlocksFolder() {
   fs.mkdirSync(newBlocks);
   const files = fs.readdirSync(oldBlocks);
   files.forEach(file => {
      const src = path.resolve(oldBlocks, file);
      const dest = path.resolve(newBlocks, file);
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
   });

   // fs.rmdirSync(oldBlocks);
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
   const findInContent = `$autoloader = new Autoloader();`;
   // if findInContent is found, add a new line below
   if (content.includes(findInContent)) {
      // add a new line below with $autoloader->child_blocks();
      const replace = `$autoloader = new Autoloader();
$autoloader->child_blocks();`;
      content = content.replace(findInContent, replace);
      fs.writeFileSync(functionsFile, content);
      console.log(`Updating functions.php successful`);
   }
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
   views.forEach(file => {
      if (file.startsWith(name)) {
         const src = path.resolve(viewsFolder, file);
         const dest = path.resolve(blockFolder, file);
         fs.copyFileSync(src, dest);
         fs.unlinkSync(src);

         console.log(`1. Succesfully moved ${file}`);
         return;
      }
   });

   // find scss file and move it to blockFolder
   const scss = fs.readdirSync(scssFolder);
   scss.forEach(file => {
      if (file.startsWith(name)) {
         const src = path.resolve(scssFolder, file);
         const dest = path.resolve(blockFolder, file);
         fs.copyFileSync(src, dest);
         fs.unlinkSync(src);
         console.log(`2. Succesfully moved ${file}`);
         return;
      }
   });

   // open scssFolder/_index.scss
   const indexFile = path.resolve(scssFolder, '_index.scss');
   var content = fs.readFileSync(indexFile, 'utf8');

   //find = `@import "acf-${name}";`; and replace it with `@import "~blocks/${name}/acf-${name}";`
   const find = `@import "acf-${name}";`;
   const replace = `@import "~blocks/${name}/acf-${name}";`;
   content = content.replace(find, replace);

   if (!content.includes(replace)) {
      console.warn(`3. Error moving acf-${name}.scss`.red);
   } else {
      fs.writeFileSync(indexFile, content);
      console.log(`3. Succesfully moved acf-${name}.scss`);
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
   content = content.replace(`BlockRendererV1;`, `BlockRendererV2`);
   fs.writeFileSync(phpFile, content);
   console.log(`updating ${file} successful`);

   console.log('\n');
}