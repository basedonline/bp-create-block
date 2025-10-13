# bp-create-block

A CLI tool for creating and managing ACF (Advanced Custom Fields) blocks with Twig templates.

## How to run

```bash
npx bp-create-block
```

## Commands

### Create Block (Default)
Creates a new ACF block with Twig template.

```bash
npx bp-create-block create
# or simply
npx bp-create-block
```

**Interactive prompts:**
- Block slug
- Block title (defaults to formatted slug)
- Block description
- Block category
- Dashicon (without prefix)
- Keywords (comma-separated)
- Post type restrictions (optional)
- Full alignment support (y/n)

### Migrate Blocks
Migrates blocks from v1 to v2 structure.

```bash
npx bp-create-block migrate
```

Automatically updates:
- Moves blocks folder to theme root
- Updates example folder structure
- Modifies functions.php
- Converts block structure to v2 format

### Reuse Block
Copies an existing block for reuse and customization.

```bash
npx bp-create-block reuse
```

**Requirements:**
- Must be run from blocks folder
- Prompts for source block path
- Option to rename the copied block

### Update ACF Version
Updates blocks from ACF version 2 to version 3.

```bash
npx bp-create-block v2-to-v3
```

Automatically updates `blockVersion` to 3 in all `block.json` files.

## License

MIT