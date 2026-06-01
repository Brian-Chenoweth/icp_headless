# OpenAI Image Alt Text

This plugin generates alt text for new WordPress image uploads when the image alt field is empty.

## Version

- Current plugin version: 0.1.1

## Updates

- 0.1.1: Added AVIF and other unsupported image format handling by converting them to JPEG when the WordPress image editor can process them.
- 0.1.0: Initial release.

## What it does

- Queues generation 30 seconds after a new attachment is created.
- Skips non-image attachments.
- Sends JPEG, PNG, GIF, and WebP images directly to OpenAI.
- Converts other image formats, including AVIF, to JPEG first when the WordPress image editor can do so.
- Never overwrites existing alt text.
- Stores the generated alt text in `_wp_attachment_image_alt`.

## Setup

1. Copy `openai-image-alt-text.php` into a WordPress plugin directory.
2. Activate the plugin in WordPress.
3. Open `Settings -> OpenAI Image Alt Text`.
4. Enable auto-generation and add an OpenAI API key.
5. Upload a new image with an empty alt field.

## Notes

- This is intentionally minimal. It does not add retries, moderation, or manual review UI.
- If your media library uses remote/offloaded storage, test carefully because the plugin reads the local attached file path.
- AVIF uploads are supported only if your WordPress/PHP image editor can open and convert them.
- If conversion fails, the plugin logs an error and skips that attachment.
- The default model is configurable in settings.
