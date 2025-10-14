const prompt = require('prompt-sync')();
const path = require('path');
var shell = require('shelljs');
const currentDir = process.cwd();
let renameBlock = false;
let blockPath = '';

function actionReuseBlock() {

   // check if this command runs from the blocks folder
   if (!currentDir.includes('blocks')) {
      shell.echo('Sorry, this command must run from the blocks folder.');
      return;
   }

   const BlockToCopy = prompt('Full absolute path to the block you want to reuse:');

   if (!shell.test('-e', BlockToCopy)) {
      shell.echo('Sorry, block does not exist.');
      return;
   }
   let blockName = BlockToCopy.split('/').pop();
   let sourceBlockName = blockName;
   let newBlockName = prompt(`Block name (defaults to ${sourceBlockName}):`, sourceBlockName);

   if (newBlockName != sourceBlockName) {
      renameBlock = true;
      blockName = newBlockName;
   }

   shell.cp('-R', BlockToCopy, currentDir);
   shell.echo(`Copying block ${blockName} to ${currentDir}`);

   blockPath = `${currentDir}/${blockName}`;

   if (renameBlock) {
      shell.echo(`Renaming ${sourceBlockName} to ${newBlockName}`);
   }

   if (renameBlock) {
      // rename all files in the block folder to the new block name
      const files = shell.ls();
      files.forEach(file => {
         const newFile = file.replace(sourceBlockName, newBlockName);
         shell.mv(file, newFile);
      });

      // search in all files for the old block name and replace it with the new block name
      const filesToSearch = shell.ls();
      filesToSearch.forEach(file => {
         shell.sed('-i', oldBlockName, newBlockName, file);
      });
   }

   // cd to styles/blocks dir
   shell.cd(`../../assets/styles/05-blocks`);
   shell.echo(`.${blockName}{\n\n}`).to(`_acf-${blockName}.scss`);
   shell.echo(`@import "acf-${blockName}";`).toEnd("_index.scss");
   shell.echo(`✔️  Created scss file _acf-${blockName}.scss and added to index.\n`)
}

exports.actionReuseBlock = actionReuseBlock;