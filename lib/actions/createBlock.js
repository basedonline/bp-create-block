const prompt = require('prompt-sync')();
const pascalcase = require('pascalcase');
var shell = require('shelljs');
const { testBlockVersion } = require('../helpers');

/**
 * Setup block variables
 */
var blockVersion = null;
var block_slug;
var block_slug_upper;
var block_title;
var block_description;
var block_category;
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
   block_title = prompt(`Block title (can be translated later). Defaults to ${block_slug_upper}: `, block_slug_upper);
   block_description = prompt(`Block description: `);
   block_category = prompt(`Block category, defaults to category set in _example.php: `);
   block_icon = prompt(`dashicon without the dashicon prefix: `);
   block_keywords = prompt(`comma separated list of tags: `);
   block_keywords = block_keywords.replace(/\s*,\s*/g, ","); // remove space after comma.

   // replace spaces with dashes and transform to lowercase
   block_slug = block_slug.replace(/\s+/g, '-').toLowerCase();

   if (blockVersion === 'v1') {
      shell.echo(`Start ${blockVersion} block scaffolding for ${block_title}\n`);
      createV1Block();
   }
   else {
      shell.echo(`Start ${blockVersion} block scaffolding for ${block_title}\n`);
      createV2Block();
   }
}



/**
 * Run tests for v1 blocks
 */
function runV1Tests() {
   if (!shell.test('-e', '_example.php')) {
      shell.echo('Sorry, _example.php does not exist.')
      shell.exit(1)
   }

   if (!shell.test('-e', '../../resources/views/blocks/_example.twig')) {
      shell.echo('Sorry, /resources/views/blocks/_example.twig does not exist.')
      shell.exit(1)
   }

   if (!shell.test('-e', '../../resources/assets/styles/05-blocks/_index.scss')) {
      shell.echo('Sorry, /05-blocks/_index.scss does not exist')
      shell.exit(1)
   }
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


function createV1Block() {

   block_keywords = '\'' + block_keywords.split(',').forEach(function (item) {
      new_keywords += `_x('${item}', 'Block keyword', 'wp-lemon-child'),`;
   });

   shell.cp('_example.php', `${block_slug}.php`); // copy block
   shell.sed('-i', 'Example_Block', `${pascalcase(block_slug_upper)}_Block`, `${block_slug}.php`); // set block class
   shell.sed('-i', '//new', 'new', `${block_slug}.php`); // activate class
   shell.sed('-i', 'example', block_slug, `${block_slug}.php`); // set block slug
   shell.sed('-i', 'Example name', block_title, `${block_slug}.php`); // set block name
   shell.sed('-i', 'Example description', block_description, `${block_slug}.php`); // set description

   if (block_category !== '') {
      shell.sed('-i', 'wp-lemon-blocks', block_category, `${block_slug}.php`); // set category
   }

   shell.sed('-i', 'desktop', block_icon, `${block_slug}.php`); // set icon

   shell.exec(`sed -i '/Keyword/d' ${block_slug}.php`, { silent: true }).stdout
   var keywords_line = shell.exec(`grep -n keywords ${block_slug}.php`, { silent: true }).stdout.split(':')[0];
   var next_line = parseInt(keywords_line) + 1;
   shell.exec(`sed -i "${next_line}i ${new_keywords}" ${block_slug}.php`, { silent: true }).stdout

   shell.sed('-i', '// new', 'new', `${block_slug}.php`); // set block slug

   shell.echo(`✔️  New block created at ${block_slug}.php\n`);

   // cd to twig dir
   shell.cd('../../resources/views/blocks');

   // setup twig block
   shell.cp('_example.twig', `${block_slug}.twig`); // copy block
   shell.echo(`✔️  Created twig file at ${block_slug}.twig\n`);

   // cd to styles/blocks dir
   shell.cd(`../../assets/styles/05-blocks`);
   // setup style partial.
   shell.touch(`_acf-${block_slug}.scss`);
   shell.echo(`.${block_slug}{\n\n}`).to(`_acf-${block_slug}.scss`);
   shell.echo(`@import "acf-${block_slug}";`).toEnd("_index.scss");
   shell.echo(`✔️  Created scss file _acf-${block_slug}.scss and added to index.\n`);
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

   // make changes to block.json
   shell.sed('-i', 'acf/example', 'acf/' + block_slug, `block.json`); // set block slug
   shell.sed('-i', 'Example name', block_title, `block.json`); // set block name
   shell.sed('-i', 'Example description', block_description, `block.json`); // set description

   if (block_category !== '') {
      shell.sed('-i', 'wp-lemon-blocks', block_category, `block.json`); // set category
   }

   shell.sed('-i', 'desktop', block_icon, `block.json`); // set icon

   block_keywords = '\'' + block_keywords.split(',').forEach(function (item) {
      new_keywords += `"${item}",`;
   });

   // trim last comma
   new_keywords = new_keywords.replace(/,\s*$/, "");

   shell.sed('-i', '"Keyword", "Keyword", "Keyword", "Keyword"', new_keywords, `block.json`);
   shell.echo(`✔️  Made changes to blocks/${block_slug}/block.json\n`);

   shell.echo(`.${block_slug}{\n\n}`).to(`_acf-${block_slug}.scss`, { silent: true });
   shell.cd(`../../resources/assets/styles/05-blocks`);
   shell.echo(`@import "~blocks/${block_slug}/acf-${block_slug}";`).toEnd("_index.scss", { silent: true });
   shell.echo(`✔️  Created scss file _acf-${block_slug}.scss and added to index.\n`);
}

exports.actionCreateBlock = actionCreateBlock;