import { getSiteUrlFromRequest, toAbsoluteUrl } from '@utilities';

const WP_GRAPHQL_ENDPOINT = `${(process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/+$/, '')}/graphql`;
const PAGE_SIZE = 100;

const SITEMAP_COLLECTIONS = [
  {
    key: 'posts',
    queryName: 'posts',
    nodeFields: 'uri modified',
  },
  {
    key: 'pages',
    queryName: 'pages',
    nodeFields: 'uri modified',
  },
  {
    key: 'projects',
    queryName: 'projects',
    nodeFields: 'uri modified',
  },
  {
    key: 'categories',
    queryName: 'categories',
    nodeFields: 'uri',
  },
  {
    key: 'tags',
    queryName: 'tags',
    nodeFields: 'uri',
  },
];

function escapeXml(value = '') {
  return `${value}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function fetchWordPressGraphQL(query, variables = {}) {
  if (!WP_GRAPHQL_ENDPOINT) {
    throw new Error('Missing NEXT_PUBLIC_WORDPRESS_URL for sitemap generation.');
  }

  const response = await fetch(WP_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`WordPress GraphQL request failed with ${response.status}.`);
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  return payload.data;
}

async function fetchCollectionEntries({ queryName, nodeFields }) {
  const entries = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await fetchWordPressGraphQL(
      `query GetSitemapEntries($first: Int!, $after: String) {
        ${queryName}(first: $first, after: $after) {
          nodes {
            ${nodeFields}
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        first: PAGE_SIZE,
        after,
      }
    );

    const connection = data?.[queryName];
    const nodes = connection?.nodes ?? [];

    entries.push(...nodes);
    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    after = connection?.pageInfo?.endCursor ?? null;
  }

  return entries;
}

export default function SitemapXml() {
  return null;
}

export async function getServerSideProps({ req, res }) {
  const siteUrl = getSiteUrlFromRequest(req);
  const staticEntries = [
    { loc: toAbsoluteUrl('/', siteUrl) },
    { loc: toAbsoluteUrl('/posts', siteUrl) },
    { loc: toAbsoluteUrl('/projects', siteUrl) },
  ];

  let dynamicEntries = [];

  try {
    const collections = await Promise.all(
      SITEMAP_COLLECTIONS.map(async (collection) => ({
        key: collection.key,
        nodes: await fetchCollectionEntries(collection),
      }))
    );

    dynamicEntries = collections.flatMap(({ nodes }) =>
      nodes
        .filter((node) => node?.uri)
        .map((node) => ({
          loc: toAbsoluteUrl(node.uri, siteUrl),
          lastmod: node?.modified ? new Date(node.modified).toISOString() : null,
        }))
    );
  } catch (error) {
    console.error('Unable to generate full sitemap.', error);
  }

  const uniqueEntries = [...staticEntries, ...dynamicEntries].filter(
    (entry, index, allEntries) =>
      entry.loc &&
      allEntries.findIndex((candidate) => candidate.loc === entry.loc) === index
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueEntries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${
      entry.lastmod ? `
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.write(xml);
  res.end();

  return {
    props: {},
  };
}
