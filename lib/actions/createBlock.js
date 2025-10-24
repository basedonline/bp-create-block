const prompt = require('prompt-sync')();
const pascalcase = require('pascalcase');
var shell = require('shelljs');
const fs = require('fs');
const { testBlockVersion } = require('../helpers');
const editJsonFile = require("edit-json-file");
/**
 * Setup block variables
 */
var blockVersion = null;
var block_slug;
var block_slug_upper;
var block_title;
var block_description;
var block_category;
var block_posttypes = null;
var block_full_alignment = 'n';
var block_icon;
var block_keywords;
var new_keywords = '';

function actionCreateBlock() {

   shell.echo('\n');
   blockVersion = testBlockVersion();

   if (blockVersion === 'v1') {
      runV1Tests();
   }
   else {
      runV2Tests();
   }

   block_slug = prompt('Block slug:');
   block_slug_upper = block_slug.charAt(0).toUpperCase() + block_slug.slice(1);

   // replace - with a space
   block_slug_upper = block_slug_upper.replace(/-/g, ' ');

   block_title = prompt(`Block title (can be translated later). Defaults to ${block_slug_upper}: `, block_slug_upper);
   block_description = prompt(`Block description: `);
   block_category = prompt(`Block category, defaults to category set in _example.php: `);
   shell.echo(`\n`);
   shell.echo(`Pick a dashicon via: https://developer.wordpress.org/resource/dashicons/\n`);
   block_icon = prompt(`dashicon without the dashicon prefix: `);
   block_keywords = prompt(`comma separated list of tags: `);
   block_keywords = block_keywords.replace(/\s*,\s*/g, ","); // remove space after comma.
   block_posttypes = prompt(`Make block available on specific post types? Provide a comma separated list or leave empty for all post types: `);
   block_posttypes = block_posttypes.replace(/\s*,\s*/g, ","); // remove space after comma.
   block_full_alignment = prompt(`Support full alignment? (y/n defaults to n) `, 'n');

   // replace spaces with dashes and transform to lowercase
   block_slug = block_slug.replace(/\s+/g, '-').toLowerCase();

   if (blockVersion === 'v1') {
      shell.echo('Sorry, v1 block scaffolding is deprecated. Please use v2 blocks.\n')
      shell.exit(1)
   }

   shell.echo(`Start ${blockVersion} block scaffolding for ${block_title}\n`);
   createV2Block();
}

/**
 * Run tests for v2 blocks
 */
function runV2Tests() {
   if (!shell.test('-e', '_example/example.php')) {
      shell.echo('Sorry, _example/example.php does not exist.')
      shell.exit(1)
   }

   if (!shell.test('-e', '_example/example.twig')) {
      shell.echo('Sorry, _example/example.twig does not exist.')
      shell.exit(1)
   }

   if (!shell.test('-e', '_example/_acf-example.scss')) {
      shell.echo('Sorry, /05-blocks/_index.scss does not exist')
      shell.exit(1)
   }
}

function createV2Block() {


   // check if block exists
   if (shell.test('-e', `${block_slug}`)) {
      shell.echo(`Sorry, ${block_slug} already exists.`)
      shell.exit(1)
   }

   // copy folder
   shell.cp('-R', '_example/', `${block_slug}`);

   // cd to block dir
   shell.cd(`${block_slug}`);

   // rename files
   shell.mv('example.php', `${block_slug}.php`);
   shell.mv('example.twig', `${block_slug}.twig`);
   shell.mv('_acf-example.scss', `_acf-${block_slug}.scss`);
   shell.echo(`✔️  Created folder at blocks/${block_slug}`);

   // make changes to php file
   shell.sed('-i', 'Example_Block', `${pascalcase(block_slug_upper)}_Block`, `${block_slug}.php`); // set block class
   shell.sed('-i', '// new', 'new', `${block_slug}.php`); // activate class
   shell.sed('-i', 'example', block_slug, `${block_slug}.php`); // set block slug
   shell.echo(`✔️  Made changes to blocks/${block_slug}/${block_slug}.php`);

   // parse block.json file
   let file = editJsonFile(`block.json`);

   file.set('name', 'acf/' + block_slug);
   file.set('title', block_title);
   file.set('description', block_description);
   file.set('icon', block_icon);
   file.set('keywords', block_keywords.split(','));

   if (block_full_alignment === 'y') {
      file.set('attributes.align.type', 'string');
      file.set('attributes.align.default', 'full');
      file.set('supports.align', ["full"]);
   }

   if (block_posttypes !== '') {
      file.set('acf.postTypes', block_posttypes.split(','));
   }

   if (block_category !== '') {
      file.set('category', block_category);
   }

   file.save();
   shell.echo(`✔️  Made changes to blocks/${block_slug}/block.json`);
   fs.writeFileSync(`_acf-${block_slug}.scss`, `.${block_slug}{\n\n}`);
   fs.appendFileSync("../../resources/assets/styles/05-blocks/_index.scss", `@import "~blocks/${block_slug}/acf-${block_slug}";`);
   shell.echo(`✔️  Created scss file _acf-${block_slug}.scss and added to index.\n`);
}

exports.actionCreateBlock = actionCreateBlock;