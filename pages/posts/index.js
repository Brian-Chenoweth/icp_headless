import * as MENUS from '@constants/menus';

import { gql, useQuery } from '@apollo/client';
import React from 'react';
import {
  FeaturedImage,
  Footer,
  EntryHeader,
  Header,
  LoadMore,
  Main,
  NavigationMenu,
  Posts,
  SEO,
} from '@components';
import { getNextStaticProps } from '@faustwp/core';
import {
  buildKeywordString,
  buildMetaDescription,
  pageTitle,
} from '@utilities';
import { BlogInfoFragment } from '@fragments/GeneralSettings';
import appConfig from '@config';

export default function Page() {
  const { data, loading, fetchMore } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  if (loading) {
    return <></>;
  }

  const { title: siteTitle, description: siteDescription } =
    data?.generalSettings;
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];
  const postList = data.posts.edges.map((el) => el.node);
  const listingTitle = 'Latest Posts';
  const listingContent = postList
    .map((post) => `${post?.title ?? ''} ${post?.excerpt ?? ''}`)
    .join(' ');
  const description = buildMetaDescription({
    title: listingTitle,
    content: listingContent,
    fallback: siteDescription,
  });
  const keywords = buildKeywordString({
    title: listingTitle,
    content: listingContent,
    seedKeywords: ['latest posts', 'blog'],
  });

  return (
    <>
      <SEO
        title={pageTitle(data?.generalSettings, listingTitle)}
        description={description}
        keywords={keywords}
      />

      <Header menuItems={primaryMenu} />

      <Main>
        <EntryHeader title={listingTitle} />
        <div className="container">
          <Posts posts={postList} id="post-list" />
          <LoadMore
            className="text-center"
            hasNextPage={data?.posts?.pageInfo?.hasNextPage}
            endCursor={data?.posts?.pageInfo?.endCursor}
            isLoading={loading}
            fetchMore={fetchMore}
          />
        </div>
      </Main>

      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Page.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  ${Posts.fragments.entry}
  query GetPostsPage(
    $first: Int!
    $after: String
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    posts(first: $first, after: $after) {
      edges {
        node {
          ...PostsItemFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
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

Page.variables = () => {
  return {
    first: appConfig.postsPerPage,
    after: '',
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
  };
};

export async function getStaticProps(context) {
  return getNextStaticProps(context, {
    Page,
  });
}
