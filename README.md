# Headless Platform Blueprint Portfolio

This repository contains a starter Blueprint to get you up and running quickly on [WP Engine's Headless Platform](https://wpengine.com/atlas/) with a WordPress site complete with a blog, portfolio and testimonials.

## For more information

For more information on this Blueprint please check out the following sources:

- [WP Engine's Headless Platform](https://wpengine.com/atlas/)
- [Faust.js](https://faustjs.org)
- [WPGraphQL](https://www.wpgraphql.com)
- [Atlas Content Modeler](https://wordpress.org/plugins/atlas-content-modeler/)
- [WP Engine's Headless Platform developer community](https://developers.wpengine.com)

## AI Alt Text

This repo includes two starter paths for AI-generated image alt text:

- `npm run alt-text:backfill -- --dry-run --limit 10` runs a one-off Node script for existing WordPress media items with empty alt text.
- `wordpress-plugins/openai-image-alt-text` contains a minimal WordPress plugin scaffold for auto-generating alt text on new uploads.

Backfill script environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-4.1-mini`
- `WORDPRESS_BASE_URL` optional, falls back to `NEXT_PUBLIC_WORDPRESS_URL`
- `WORDPRESS_USERNAME`
- `WORDPRESS_APP_PASSWORD`

### Contributor License Agreement

All external contributors to WP Engine products must have a signed Contributor License Agreement (CLA) in place before the contribution may be accepted into any WP Engine codebase.

1. [Submit your name and email](https://wpeng.in/cla/)
2. 📝 Sign the CLA emailed to you
3. 📥 Receive copy of signed CLA

❤️ Thank you for helping us fulfill our legal obligations in order to continue empowering builders through headless WordPress. test deploy
