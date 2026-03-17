import { getSiteUrlFromRequest, toAbsoluteUrl } from '@utilities';

export default function RobotsTxt() {
  return null;
}

export async function getServerSideProps({ req, res }) {
  const siteUrl = getSiteUrlFromRequest(req);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.write(`User-agent: *
Allow: /
Disallow: /preview
Disallow: /search

Sitemap: ${toAbsoluteUrl('/sitemap.xml', siteUrl)}
`);
  res.end();

  return {
    props: {},
  };
}

