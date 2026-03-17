function normalizeSiteUrl(value = '') {
  const trimmed = `${value ?? ''}`.trim();

  if (!trimmed) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, '');
}

function getSiteUrl() {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      process.env.NEXT_PUBLIC_WORDPRESS_URL
  );
}

function getSiteUrlFromRequest(req) {
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const forwardedHost = req?.headers?.['x-forwarded-host'];
  const host = forwardedHost || req?.headers?.host;

  if (!host) {
    return getSiteUrl();
  }

  const protocol =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ||
    (host.includes('localhost') ? 'http' : 'https');

  return normalizeSiteUrl(`${protocol}://${host}`);
}

function toAbsoluteUrl(path = '', siteUrl = getSiteUrl()) {
  if (!path) {
    return siteUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!siteUrl) {
    return path;
  }

  return new URL(path, `${siteUrl}/`).toString();
}

export { getSiteUrl, getSiteUrlFromRequest, normalizeSiteUrl, toAbsoluteUrl };
