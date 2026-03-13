#!/usr/bin/env node

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_LIMIT = 25;
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const ALT_TEXT_PROMPT = `Write concise alt text for this image.
Rules:
- Max 125 characters.
- Describe only what is visibly important.
- Do not start with "Image of" or "Picture of".
- If the image is decorative, return exactly: ""
- If text appears in the image and is essential, include it briefly.
Return only the alt text.`;

function parseArgs(argv) {
  const args = {
    dryRun: false,
    limit: DEFAULT_LIMIT,
    pageSize: DEFAULT_PAGE_SIZE,
    startPage: 1,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--limit') {
      args.limit = Number(argv[i + 1] || DEFAULT_LIMIT);
      i += 1;
      continue;
    }

    if (arg === '--page-size') {
      args.pageSize = Number(argv[i + 1] || DEFAULT_PAGE_SIZE);
      i += 1;
      continue;
    }

    if (arg === '--start-page') {
      args.startPage = Number(argv[i + 1] || 1);
      i += 1;
      continue;
    }
  }

  return args;
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getWpBaseUrl() {
  return (
    process.env.WORDPRESS_BASE_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    ''
  ).replace(/\/$/, '');
}

function getWordPressAuthHeader() {
  const username = getRequiredEnv('WORDPRESS_USERNAME');
  const password = getRequiredEnv('WORDPRESS_APP_PASSWORD');

  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function listMediaPage({ page, pageSize, wpBaseUrl, authHeader }) {
  const url = new URL(`${wpBaseUrl}/wp-json/wp/v2/media`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(pageSize));
  url.searchParams.set('media_type', 'image');
  url.searchParams.set('_fields', 'id,source_url,alt_text,media_type,mime_type');

  return fetchJson(url.toString(), {
    headers: {
      Authorization: authHeader,
    },
  });
}

async function loadImageAsDataUrl(imageUrl) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Could not download image (${response.status}) from ${imageUrl}`);
  }

  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return `data:${contentType};base64,${base64}`;
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (!Array.isArray(payload.output)) {
    return '';
  }

  for (const item of payload.output) {
    if (!Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (typeof content.text === 'string' && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return '';
}

function normalizeAltText(text) {
  const normalized = text.trim().replace(/^["']|["']$/g, '');
  return normalized === '""' ? '' : normalized;
}

async function generateAltText({ imageUrl, model, apiKey }) {
  const imageDataUrl = await loadImageAsDataUrl(imageUrl);
  const payload = await fetchJson(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: ALT_TEXT_PROMPT,
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
            },
          ],
        },
      ],
      max_output_tokens: 80,
    }),
  });

  return normalizeAltText(extractOutputText(payload));
}

async function updateMediaAltText({ wpBaseUrl, authHeader, mediaId, altText }) {
  return fetchJson(`${wpBaseUrl}/wp-json/wp/v2/media/${mediaId}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      alt_text: altText,
    }),
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const wpBaseUrl = getWpBaseUrl();
  const authHeader = getWordPressAuthHeader();
  const apiKey = getRequiredEnv('OPENAI_API_KEY');
  const model = DEFAULT_MODEL;

  if (!wpBaseUrl) {
    throw new Error(
      'Missing WordPress base URL. Set WORDPRESS_BASE_URL or NEXT_PUBLIC_WORDPRESS_URL.'
    );
  }

  let processed = 0;
  let page = args.startPage;

  console.log(`Scanning ${wpBaseUrl} for images with empty alt text...`);

  while (processed < args.limit) {
    const items = await listMediaPage({
      page,
      pageSize: args.pageSize,
      wpBaseUrl,
      authHeader,
    });

    const candidates = items.filter((item) => !item.alt_text && item.source_url);

    if (items.length === 0) {
      break;
    }

    for (const item of candidates) {
      if (processed >= args.limit) {
        break;
      }

      console.log(`\n[${processed + 1}/${args.limit}] Media #${item.id}`);

      try {
        const altText = await generateAltText({
          imageUrl: item.source_url,
          model,
          apiKey,
        });

        if (!altText) {
          console.log('Skipped: model marked the image as decorative or returned empty text.');
          processed += 1;
          continue;
        }

        if (args.dryRun) {
          console.log(`Dry run: ${altText}`);
        } else {
          await updateMediaAltText({
            wpBaseUrl,
            authHeader,
            mediaId: item.id,
            altText,
          });
          console.log(`Updated alt text: ${altText}`);
        }
      } catch (error) {
        console.error(`Failed for media #${item.id}: ${error.message}`);
      }

      processed += 1;
    }

    page += 1;
  }

  console.log(`\nFinished. Processed ${processed} image(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
