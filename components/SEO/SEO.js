import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSiteUrl, toAbsoluteUrl } from '@utilities';

/**
 * Provide SEO related meta tags to a page.
 *
 * @param {Props} props The props object.
 * @param {string} props.title Used for the page title, og:title, twitter:title, etc.
 * @param {string} props.description Used for the meta description, og:description, twitter:description, etc.
 * @param {string} props.keywords Used for the keywords meta tag.
 * @param {string} props.imageUrl Used for the og:image and twitter:image.
 * @param {string} props.imageAlt Used for the og:image:alt and twitter:image:alt.
 * @param {string} props.url Used for the canonical url, og:url and twitter:url.
 * @param {string} props.siteName Used for og:site_name and structured data.
 * @param {string} props.type Used for og:type and page schema type.
 * @param {boolean} props.noIndex Prevents search engines from indexing the page.
 * @param {boolean} props.noFollow Prevents search engines from following links on the page.
 * @param {string} props.publishedTime Used for article published time.
 * @param {string} props.modifiedTime Used for article modified time.
 * @param {string|string[]} props.author Used for article author structured data.
 * @param {string[]} props.tags Used for article tag meta and structured data.
 * @param {object|object[]} props.structuredData Additional JSON-LD blocks to inject.
 *
 * @returns {React.ReactElement} The SEO component
 */
export default function SEO({
  title,
  description,
  keywords,
  imageUrl,
  imageAlt,
  url,
  siteName,
  type = 'website',
  noIndex = false,
  noFollow = false,
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  structuredData,
}) {
  const router = useRouter();
  const siteUrl = getSiteUrl();
  const resolvedUrl = toAbsoluteUrl(url || router?.asPath || '/', siteUrl);
  const robots = [noIndex ? 'noindex' : 'index', noFollow ? 'nofollow' : 'follow'].join(', ');
  const seoImageUrl = imageUrl ? toAbsoluteUrl(imageUrl, siteUrl) : '';
  const organizationName = siteName || title || '';
  const normalizedAuthors = [author].flat().filter(Boolean).map((name) => ({
    '@type': 'Person',
    name,
  }));
  const baseStructuredData = [];

  if (!title && !description && !keywords && !imageUrl && !url && !structuredData) {
    return null;
  }

  if (!noIndex && organizationName && siteUrl) {
    baseStructuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: organizationName,
      url: siteUrl,
    });
  }

  if (title && resolvedUrl) {
    baseStructuredData.push({
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebPage',
      name: title,
      headline: title,
      description,
      url: resolvedUrl,
      ...(siteName
        ? {
            isPartOf: {
              '@type': 'WebSite',
              name: siteName,
              url: siteUrl,
            },
          }
        : {}),
      ...(seoImageUrl ? { image: [seoImageUrl] } : {}),
      ...(publishedTime ? { datePublished: publishedTime } : {}),
      ...(modifiedTime ? { dateModified: modifiedTime } : {}),
      ...(normalizedAuthors.length > 0 ? { author: normalizedAuthors } : {}),
      ...(tags.length > 0 ? { keywords: tags } : {}),
    });
  }

  const jsonLdBlocks = [...baseStructuredData, ...[structuredData].flat().filter(Boolean)];

  return (
    <>
      <Head>
        <meta name="robots" content={robots} />
        <meta name="googlebot" content={robots} />
        <meta name="theme-color" content="#005030" />
        <meta property="og:type" content={type} />
        <meta property="twitter:card" content="summary_large_image" />
        {resolvedUrl && <link rel="canonical" href={resolvedUrl} />}

        {title && (
          <>
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta property="og:title" content={title} />
            <meta property="twitter:title" content={title} />
          </>
        )}

        {description && (
          <>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta property="twitter:description" content={description} />
          </>
        )}

        {keywords && <meta name="keywords" content={keywords} />}
        {siteName && <meta property="og:site_name" content={siteName} />}

        {seoImageUrl && (
          <>
            <meta property="og:image" content={seoImageUrl} />
            <meta property="twitter:image" content={seoImageUrl} />
            {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
            {imageAlt && <meta property="twitter:image:alt" content={imageAlt} />}
          </>
        )}

        {resolvedUrl && (
          <>
            <meta property="og:url" content={resolvedUrl} />
            <meta property="twitter:url" content={resolvedUrl} />
          </>
        )}

        {publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        {tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        {jsonLdBlocks.map((entry, index) => (
          <script
            key={`jsonld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(entry),
            }}
          />
        ))}
      </Head>
    </>
  );
}
