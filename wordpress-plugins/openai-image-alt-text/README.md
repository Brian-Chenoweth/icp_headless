# OpenAI Image Alt Text

This plugin generates alt text for new WordPress image uploads when the image alt field is empty.

## What it does

- Queues generation 30 seconds after a new attachment is created.
- Skips non-image attachments.
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
- The default model is configurable in settings.
