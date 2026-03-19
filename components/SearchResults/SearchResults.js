import Link from 'next/link';
import { FormatDate, LoadingSearchResult } from '../../components';
import { FaSearch } from 'react-icons/fa';

import styles from './SearchResults.module.scss';

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getHighlightPattern(searchQuery = '') {
  const normalizedQuery = searchQuery.trim();

  if (!normalizedQuery) {
    return null;
  }

  return new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'gi');
}

function highlightText(text = '', searchQuery = '') {
  const pattern = getHighlightPattern(searchQuery);

  if (!pattern || !text) {
    return text;
  }

  return text.split(pattern).map((part, index) =>
    part.match(pattern) ? (
      <mark key={`${part}-${index}`} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function highlightExcerpt(excerpt = '', searchQuery = '') {
  const pattern = getHighlightPattern(searchQuery);

  if (!pattern || !excerpt) {
    return excerpt;
  }

  return excerpt
    .split(/(<[^>]+>)/g)
    .map((segment) => {
      if (segment.startsWith('<') && segment.endsWith('>')) {
        return segment;
      }

      return segment.replace(
        pattern,
        `<mark class="${styles.highlight}">$1</mark>`
      );
    })
    .join('');
}

/**
 * Renders the search results list.
 *
 * @param {Props} props The props object.
 * @param {object[]} props.searchResults The search results list.
 * @param {boolean} props.isLoading Whether the search results are loading.
 * @param {string} props.searchQuery The active search query.
 * @returns {React.ReactElement} The SearchResults component.
 */
export default function SearchResults({
  searchResults,
  isLoading,
  searchQuery,
}) {
  // If there are no results, or are loading, return null.
  if (!isLoading && searchResults === undefined) {
    return null;
  }

  // If there are no results, return a message.
  if (!isLoading && !searchResults?.length) {
    return (
      <div className={styles['no-results']}>
        <FaSearch className={styles['no-results-icon']} />
        <div className={styles['no-results-text']}>No results</div>
      </div>
    );
  }

  return (
    <>
      {searchResults?.map((node) => (
        <div key={node.databaseId} className={styles.result}>
          <Link legacyBehavior href={node.uri}>
            <a>
              <h2 className={styles.title}>
                {highlightText(node.title, searchQuery)}
              </h2>
            </a>
          </Link>
          <div className={styles.meta}>
            <time className={styles.date} dateTime={node.date}>
              <FormatDate date={node.date} />
            </time>
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: highlightExcerpt(node.excerpt, searchQuery),
            }}
          ></div>
        </div>
      ))}

      {isLoading === true && (
        <>
          <LoadingSearchResult />
          <LoadingSearchResult />
          <LoadingSearchResult />
        </>
      )}
    </>
  );
}
