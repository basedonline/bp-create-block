/**
 * External dependencies
 */
const { program } = require('commander');
var shell = require('shelljs');
const commandName = 'bp-create-block';
const { engines, version } = require('../package.json');
var async = require('async');
const prompt = require('prompt-sync')();

program
   .name(commandName).description(
      'Generates PHP, Twig and scss code for registering a block for a WordPress plugin.\n\n'
   )
   .version(version)
   .action((name, options, command) => {

      if (!shell.test('-e', '_example.php')) {
         shell.echo('Sorry, _example.php does not exist.')
         shell.exit(1)
      }

      if (!shell.test('-e', '../../resources/views/blocks/_example.twig')) {
         shell.echo('Sorry, /resources/views/blocks/_example.twig does not exist.')
         shell.exit(1)
      }

      if (!shell.test('-e', '../../resources/assets/styles/4_blocks/_index.scss')) {
         shell.echo('Sorry, /resources/assets/styles/4_blocks/_index.scss does not exist')
         shell.exit(1)
      }

      var block_slug;
      var block_slug_upper;
      var block_title;
      var block_description;
      var block_category;
      var block_icon;
      var block_keywords;

      console.log(`Starting $${commandName} @${version}`);

      shell.echo('\n');
      block_slug = prompt('Block slug:');
      block_slug_upper = block_slug.charAt(0).toUpperCase() + block_slug.slice(1);

      block_title = prompt(`Block title (can be translated later). Defaults to ${block_slug_upper}:`, block_slug_upper);
      block_description = prompt(`Block description:`);
      block_category = prompt(`Block category, defaults to category set in _example.php:`);
      block_icon = prompt(`dashicon without the dashicon prefix:`);
      block_keywords = prompt(`comma seperated list of tags`);
      block_keywords = '\'' + block_keywords.split(',').join('\',\'') + '\'';


      shell.echo('\n');

      // setup php block
      shell.cp('_example.php', `${block_slug}.php`); // copy block
      shell.sed('-i', 'Example_Block', `${block_slug_upper}_Block`, `${block_slug}.php`); // set block class
      shell.sed('-i', '//new', 'new', `${block_slug}.php`); // activate class
      shell.sed('-i', 'block_slug', block_title, `${block_slug}.php`); // set block slug
      shell.sed('-i', 'Example name', block_title, `${block_slug}.php`); // set block name
      shell.sed('-i', 'Example description', block_description, `${block_slug}.php`); // set description

      if (block_category !== '') {
         shell.sed('-i', 'wp-lemon-blocks', block_category, `${block_slug}.php`); // set category
      }

      shell.sed('-i', 'desktop', block_icon, `${block_slug}.php`); // set icon
      shell.sed('-i', "'tag1', 'tag2', 'tag3'", block_keywords, `${block_slug}.php`); // set tags

      shell.echo(`✔️  New block created at ${block_slug}.php\n`);

      // cd to twig dir
      shell.cd('../../resources/views/blocks');

      // setup twig block
      shell.cp('_example.twig', `${block_slug}.twig`); // copy block
      shell.echo(`✔️  Created twig file at ${block_slug}.twig\n`);

      // cd to styles/blocks dir
      shell.cd('../assets/styles/4_blocks');
      // setup style partial.
      shell.touch(`_acf-${block_slug}.scss`);
      `acf-${block_slug}`.to("_index.scss");
      shell.echo(`✔️  Created scss file _acf-${block_slug}.scss and added to index.\n`);
   })
   .parse(process.argv);