const fs = require('fs');
const path = require('path');
var colors = require('colors');
const editJsonFile = require("edit-json-file");
const { exit } = require('process');
// path of this file
const blocks = path.resolve('./');

colors.enable();

function ACFv2toV3() {
   const files = fs.readdirSync(blocks);

   // foreach folder, find the .json file
   files.forEach(file => {
      const blockPath = path.resolve(blocks, file);
      const blockName = path.basename(blockPath);
      if (fs.lstatSync(blockPath).isDirectory()) {
         const jsonFile = path.resolve(blockPath, `block.json`);
         if (fs.existsSync(jsonFile)) {
            let file = editJsonFile(jsonFile);
            file.set("acf.blockVersion", 3);
            file.save();
            console.log(colors.green(`✔️  Updated blockVersion to 3 in ${blockName}/block.json`));
         }
      }
   });
}
exports.ACFv2toV3 = ACFv2toV3;