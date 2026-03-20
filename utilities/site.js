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

function normalizePublicUrl(value = '') {
  const trimmed = `${value ?? ''}`.trim();

  if (!trimmed) {
    return '';
  }

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const hasQueryOrHash = /[?#]/.test(trimmed);

  if (!hasProtocol && !hasQueryOrHash) {
    if (trimmed === '/') {
      return '/';
    }

    return trimmed.replace(/\/+$/, '');
  }

  try {
    if (hasProtocol) {
      const parsed = new URL(trimmed);

      if (parsed.pathname !== '/') {
        parsed.pathname = parsed.pathname.replace(/\/+$/, '');
      }

      return parsed.toString();
    }

    const [pathnameWithSearch, hash = ''] = trimmed.split('#');
    const [pathname = '', search = ''] = pathnameWithSearch.split('?');
    const normalizedPathname =
      pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

    return `${normalizedPathname}${search ? `?${search}` : ''}${
      hash ? `#${hash}` : ''
    }`;
  } catch {
    return trimmed;
  }
}

function getSiteUrl() {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL
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
    return normalizePublicUrl(path);
  }

  if (!siteUrl) {
    return normalizePublicUrl(path);
  }

  return normalizePublicUrl(new URL(path, `${siteUrl}/`).toString());
}

export {
  getSiteUrl,
  getSiteUrlFromRequest,
  normalizePublicUrl,
  normalizeSiteUrl,
  toAbsoluteUrl,
};
