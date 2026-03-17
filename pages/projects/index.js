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
  Projects,
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
  const projectList = data?.projects?.nodes ?? [];
  const listingTitle = 'Projects';
  const listingContent = projectList
    .map(
      (project) =>
        `${project?.projectFields?.title ?? ''} ${
          project?.projectFields?.summary ?? ''
        }`
    )
    .join(' ');
  const description = buildMetaDescription({
    title: listingTitle,
    content: listingContent,
    fallback: siteDescription,
  });
  const keywords = buildKeywordString({
    title: listingTitle,
    content: listingContent,
    seedKeywords: ['projects', 'portfolio'],
  });

  return (
    <>
      <SEO
        title={pageTitle(data?.generalSettings, listingTitle)}
        description={description}
        keywords={keywords}
        siteName={siteTitle}
        url="/projects"
      />

      <Header menuItems={primaryMenu} />

      <Main>
        <EntryHeader title={listingTitle} />
        <div className="container">
          <Projects projects={projectList} id="project-list" />
          <LoadMore
            className="text-center"
            hasNextPage={data.projects.pageInfo.hasNextPage}
            endCursor={data.projects.pageInfo.endCursor}
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
  ${Projects.fragments.entry}
  query GetProjectsPage(
    $first: Int!
    $after: String!
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    projects(first: $first, after: $after) {
      nodes {
        ...ProjectsFragment
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
    first: appConfig.projectsPerPage,
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
