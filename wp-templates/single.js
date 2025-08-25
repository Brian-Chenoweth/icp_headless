import { gql } from '@apollo/client';
import Link from 'next/link';
import {
  Header,
  Footer,
  Main,
  EntryHeader,
  NavigationMenu,
  ContentWrapper,
  FeaturedImage,
  SEO,
  TaxonomyTerms,
} from '../components';

import * as MENUS from '../constants/menus';
import { pageTitle } from '../utilities';
import { BlogInfoFragment } from '../fragments/GeneralSettings';

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  const { title: siteTitle, description: siteDescription } =
    props?.data?.generalSettings;
  const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
  const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];

  const { title, content, featuredImage, date, author, databaseId } =
    props.data.post;

  // Recent posts (exclude the current post; cap to 5)
  const recent =
    props?.data?.recentPosts?.nodes
      ?.filter((p) => p.databaseId !== databaseId)
      ?.slice(0, 8) ?? [];

  return (
    <>
      <SEO
        title={pageTitle(
          props?.data?.generalSettings,
          title,
          props?.data?.generalSettings?.title
        )}
        description={siteDescription}
        imageUrl={featuredImage?.node?.sourceUrl}
      />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />
<div className="container">
      <Main>
        {/* 2-column layout: article + sidebar */}
        <div>
          <div className="cp-grid">

      <EntryHeader
        title={title}
        image={featuredImage?.node}
        date={date}
        author={author?.node?.name}
        isSingle={true}   // 👈 ensures container is NOT added
      />
        {/* Sidebar: Recent Posts */}
        <aside className="cp-sidebar" aria-label="Recent posts">
          <h3>Recent Posts</h3>
          <ul>
            {recent.map((p) => (
              <li key={p.databaseId}>
                <Link href={p.uri}>{p.title}</Link>
                {p.date ? (
                  <time dateTime={p.date}>
                    {new Date(p.date).toLocaleDateString()}
                  </time>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>

          </div>

            <article>
              <ContentWrapper content={content}>
                <TaxonomyTerms post={props.data.post} taxonomy={'categories'} />
                <TaxonomyTerms post={props.data.post} taxonomy={'tags'} />
              </ContentWrapper>
            </article>

        </div>
      </Main>
      </div>

      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  query GetPost(
    $databaseId: ID!
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
    $asPreview: Boolean = false
  ) {
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      databaseId
      title
      content
      date
      author {
        node {
          name
        }
      }
      tags {
        edges {
          node {
            name
            uri
          }
        }
      }
      categories {
        edges {
          node {
            name
            uri
          }
        }
      }
      ...FeaturedImageFragment
    }
    # Recent posts for sidebar
    recentPosts: posts(first: 9, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        title
        uri
        date
      }
    }
    generalSettings {
      ...BlogInfoFragment
    }
    headerMenuItems: menuItems(where: { location: $headerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
  }
`;

Component.variables = ({ databaseId }, ctx) => {
  return {
    databaseId,
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
    asPreview: ctx?.asPreview,
  };
};
