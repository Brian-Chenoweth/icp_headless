import { gql } from '@apollo/client';
import {
  Header,
  EntryHeader,
  Footer,
  ProjectHeader,
  ContentWrapper,
  NavigationMenu,
  FeaturedImage,
  Main,
  SEO,
} from '../components';

import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import {
  buildKeywordString,
  buildMetaDescription,
  pageTitle,
} from '../utilities';

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }
  const { title: siteTitle, description: siteDescription } =
    props?.data?.generalSettings;
  const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
  const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];
  const { featuredImage, uri, modified } = props.data.project;
  const { title, summary, contentArea } = props.data.project.projectFields;
  const seoContent = `${summary ?? ''} ${contentArea ?? ''}`;
  const description = buildMetaDescription({
    title,
    content: seoContent,
    fallback: siteDescription,
  });
  const keywords = buildKeywordString({
    title,
    content: seoContent,
    seedKeywords: ['project', 'portfolio'],
  });

  return (
    <>
      <SEO
        title={pageTitle(props?.data?.generalSettings, title, siteTitle)}
        description={description}
        keywords={keywords}
        imageUrl={featuredImage?.node?.sourceUrl}
        imageAlt={featuredImage?.node?.altText}
        siteName={siteTitle}
        url={uri}
        modifiedTime={modified}
      />

      <Header menuItems={primaryMenu} />

      <Main>
        <EntryHeader title={title} />
        <ProjectHeader
          image={featuredImage?.node}
          summary={summary}
          title={title}
        />
        <div className="container">
          <ContentWrapper content={contentArea} />
        </div>
      </Main>

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
    project(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      uri
      modified
      projectFields {
        title: projectTitle
        summary
        contentArea
      }
      ...FeaturedImageFragment
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
