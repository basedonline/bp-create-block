<?php

/**
 * ACF Block declaration
 *
 * @package WordPress
 * @subpackage WP_Lemon
 */

namespace WP_Lemon\Blocks;

use HighGround\Bulldozer\BlockRendererV2 as BlockRenderer;

/**
 * Example block that can be copied for making extra blocks.
 * Change the Example_Block class on rule 11 and below the class and uncomment the class call.
 * Don't include the render callback in the block register since we add that in our main BlockRenderer abstract class.
 *
 * Follow the API standard of https://www.advancedcustomfields.com/resources/acf_register_block_type/
 */
class Example_Block extends BlockRenderer
{

   /**
    * The name of the block.
    */
   const NAME = 'example';

   /**
    * Extend the base context of our block.
    * With this function we can add for example a query or
    * other custom content.
    *
    * @param array $context      Holds the block data.
    * @return array  $context    Returns the array with the extra content that merges into the original block context.
    */
   public function block_context($context): array
   {
      // $allowed_blocks  = apply_filters("wp-lemon/filter/block/{$this->slug}/allowed-blocks", ['core/heading', 'core/paragraph']);

      $args = [
         // 'InnerBlocks'     => '<InnerBlocks allowedBlocks="' . esc_attr(wp_json_encode($allowed_blocks)) . '" />',
      ];

      return array_merge($context, $args);
   }


   /**
    * Register fields to the block.
    *
    * The array is passed to the acf_register_block_type() function that registers the block with ACF.
    *
    * @link https://github.com/StoutLogic/acf-builder
    * @return FieldsBuilder
    */
   public function add_fields(): object
   {
      return $this->registered_fields;
   }
}

/**
 * Enable the class
 */
// new Example_Block();
