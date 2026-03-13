<?php
/**
 * Plugin Name: OpenAI Image Alt Text
 * Description: Generates alt text for newly uploaded images with the OpenAI Responses API.
 * Version: 0.1.0
 * Author: Codex
 */

if (!defined('ABSPATH')) {
	exit;
}

final class OpenAI_Image_Alt_Text {
	const OPTION_GROUP = 'openai_image_alt_text';
	const OPTION_ENABLED = 'openai_image_alt_text_enabled';
	const OPTION_API_KEY = 'openai_image_alt_text_api_key';
	const OPTION_MODEL = 'openai_image_alt_text_model';
	const CRON_HOOK = 'openai_image_alt_text_process_attachment';
	const DEFAULT_MODEL = 'gpt-4.1-mini';

	public static function init() {
		add_action('admin_init', array(__CLASS__, 'register_settings'));
		add_action('admin_menu', array(__CLASS__, 'register_settings_page'));
		add_action('add_attachment', array(__CLASS__, 'queue_attachment'));
		add_action(self::CRON_HOOK, array(__CLASS__, 'process_attachment'));
	}

	public static function register_settings() {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_ENABLED,
			array(
				'type' => 'boolean',
				'sanitize_callback' => static function( $value ) {
					return (bool) $value;
				},
				'default' => false,
			)
		);

		register_setting(
			self::OPTION_GROUP,
			self::OPTION_API_KEY,
			array(
				'type' => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default' => '',
			)
		);

		register_setting(
			self::OPTION_GROUP,
			self::OPTION_MODEL,
			array(
				'type' => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default' => self::DEFAULT_MODEL,
			)
		);
	}

	public static function register_settings_page() {
		add_options_page(
			'OpenAI Image Alt Text',
			'OpenAI Image Alt Text',
			'manage_options',
			'openai-image-alt-text',
			array(__CLASS__, 'render_settings_page')
		);
	}

	public static function render_settings_page() {
		?>
		<div class="wrap">
			<h1>OpenAI Image Alt Text</h1>
			<form method="post" action="options.php">
				<?php settings_fields(self::OPTION_GROUP); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row">Enable auto-generation</th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr(self::OPTION_ENABLED); ?>" value="1" <?php checked((bool) get_option(self::OPTION_ENABLED, false)); ?> />
								Generate alt text for new image uploads when the alt field is empty.
							</label>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="openai-image-alt-text-api-key">OpenAI API key</label></th>
						<td>
							<input id="openai-image-alt-text-api-key" class="regular-text" type="password" name="<?php echo esc_attr(self::OPTION_API_KEY); ?>" value="<?php echo esc_attr(get_option(self::OPTION_API_KEY, '')); ?>" autocomplete="off" />
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="openai-image-alt-text-model">Model</label></th>
						<td>
							<input id="openai-image-alt-text-model" class="regular-text" type="text" name="<?php echo esc_attr(self::OPTION_MODEL); ?>" value="<?php echo esc_attr(get_option(self::OPTION_MODEL, self::DEFAULT_MODEL)); ?>" />
							<p class="description">Use a vision-capable model supported by the OpenAI Responses API.</p>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	public static function queue_attachment( $attachment_id ) {
		if (!self::is_enabled()) {
			return;
		}

		if (!wp_attachment_is_image($attachment_id)) {
			return;
		}

		if (self::has_alt_text($attachment_id)) {
			return;
		}

		if (!wp_next_scheduled(self::CRON_HOOK, array($attachment_id))) {
			wp_schedule_single_event(time() + 30, self::CRON_HOOK, array($attachment_id));
		}
	}

	public static function process_attachment( $attachment_id ) {
		if (!self::is_enabled()) {
			return;
		}

		if (!wp_attachment_is_image($attachment_id) || self::has_alt_text($attachment_id)) {
			return;
		}

		$api_key = trim((string) get_option(self::OPTION_API_KEY, ''));
		if ($api_key === '') {
			return;
		}

		$file_path = get_attached_file($attachment_id);
		if (!$file_path || !file_exists($file_path)) {
			return;
		}

		$mime_type = (string) get_post_mime_type($attachment_id);
		$file_contents = file_get_contents($file_path);
		if ($file_contents === false) {
			return;
		}

		$payload = array(
			'model' => self::get_model(),
			'input' => array(
				array(
					'role' => 'user',
					'content' => array(
						array(
							'type' => 'input_text',
							'text' => self::get_prompt(),
						),
						array(
							'type' => 'input_image',
							'image_url' => 'data:' . $mime_type . ';base64,' . base64_encode($file_contents),
						),
					),
				),
			),
			'max_output_tokens' => 80,
		);

		$response = wp_remote_post(
			'https://api.openai.com/v1/responses',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type' => 'application/json',
				),
				'timeout' => 45,
				'body' => wp_json_encode($payload),
			)
		);

		if (is_wp_error($response)) {
			error_log('OpenAI Image Alt Text error: ' . $response->get_error_message());
			return;
		}

		$status = (int) wp_remote_retrieve_response_code($response);
		$body = json_decode((string) wp_remote_retrieve_body($response), true);

		if ($status >= 400) {
			error_log('OpenAI Image Alt Text API error: ' . wp_json_encode($body));
			return;
		}

		$alt_text = self::normalize_alt_text(self::extract_output_text($body));
		if ($alt_text === '') {
			return;
		}

		update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt_text);
	}

	private static function is_enabled() {
		return (bool) get_option(self::OPTION_ENABLED, false);
	}

	private static function get_model() {
		$model = trim((string) get_option(self::OPTION_MODEL, self::DEFAULT_MODEL));
		return $model !== '' ? $model : self::DEFAULT_MODEL;
	}

	private static function get_prompt() {
		return "Write concise alt text for this image.\nRules:\n- Max 125 characters.\n- Describe only what is visibly important.\n- Do not start with \"Image of\" or \"Picture of\".\n- If the image is decorative, return exactly: \"\"\n- If text appears in the image and is essential, include it briefly.\nReturn only the alt text.";
	}

	private static function has_alt_text( $attachment_id ) {
		return trim((string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true)) !== '';
	}

	private static function normalize_alt_text( $text ) {
		$normalized = trim((string) $text);
		$normalized = preg_replace('/^["\']|["\']$/', '', $normalized);

		if ($normalized === '""') {
			return '';
		}

		return sanitize_text_field($normalized);
	}

	private static function extract_output_text( $payload ) {
		if (!is_array($payload)) {
			return '';
		}

		if (!empty($payload['output_text']) && is_string($payload['output_text'])) {
			return $payload['output_text'];
		}

		if (empty($payload['output']) || !is_array($payload['output'])) {
			return '';
		}

		foreach ($payload['output'] as $item) {
			if (empty($item['content']) || !is_array($item['content'])) {
				continue;
			}

			foreach ($item['content'] as $content) {
				if (!empty($content['text']) && is_string($content['text'])) {
					return $content['text'];
				}
			}
		}

		return '';
	}
}

OpenAI_Image_Alt_Text::init();
