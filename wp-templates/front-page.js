import { useQuery, gql } from '@apollo/client';
import {
  Footer,
  Header,
  Main,
  Posts,
  LoadMore,
  NavigationMenu,
  SEO,
} from '../components';
import styles from '../styles/pages/_Home.module.scss';
import * as MENUS from '../constants/menus';
import { BlogInfoFragment } from '../fragments/GeneralSettings';
import { buildKeywordString, buildMetaDescription } from '../utilities';

const postsPerPage = 8;

export default function Component() {
  const { data, loading, fetchMore } = useQuery(Component.query, {
    variables: Component.variables(),
  });
  if (loading) {
    return null;
  }

  const { title: siteTitle, description: siteDescription } =
    data?.generalSettings;
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];
  const homePosts = data?.posts?.nodes ?? [];
  const homeContent = homePosts
    .map((post) => `${post?.title ?? ''} ${post?.excerpt ?? ''}`)
    .join(' ');
  const description = buildMetaDescription({
    title: siteTitle,
    content: `${siteDescription ?? ''} ${homeContent}`,
    fallback: siteDescription,
  });
  const keywords = buildKeywordString({
    title: siteTitle,
    content: `${siteDescription ?? ''} ${homeContent}`,
    seedKeywords: ['home', 'inside cal poly'],
  });

  return (
    <>
      <SEO title={siteTitle} description={description} keywords={keywords} />

      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />

      <Main className={styles.home}>
        <div className="container">
          <h1 className={styles.hidden}>Inside Cal Poly</h1>
          <section className={styles.posts}>
            <Posts posts={homePosts} id="posts-list" />
            <LoadMore
              className="text-center"
              hasNextPage={data.nodeByUri?.contentNodes?.pageInfo.hasNextPage}
              endCursor={data.nodeByUri?.contentNodes?.pageInfo.endCursor}
              isLoading={loading}
              fetchMore={fetchMore}
            />
          </section>
        </div>
      </Main>
      <Footer menuItems={footerMenu} />
    </>
  );
}

Component.variables = () => {
  return {
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
    first: postsPerPage,
  };
};

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${Posts.fragments.entry}
  query GetPageData(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
    $first: Int
  ) {
    posts(first: $first) {
      nodes {
        ...PostsItemFragment
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
