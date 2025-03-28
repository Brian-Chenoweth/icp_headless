import { useState } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';
import { NavigationMenu, SkipNavigationLink } from '../';
import {
  FaBars,
  FaSearch,
} from 'react-icons/fa';
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from 'react-icons/fa6';
import styles from './Header.module.scss'
import appConfig from '../../app.config.js';;
let cx = classNames.bind(styles);
/**
 * A Header component
 * @param {Props} props The props object.
 * @param {string} props.className An optional className to be added to the container.
 * @return {React.ReactElement} The FeaturedImage component.
 */
export default function Header({ className, menuItems }) {
  const [isNavShown, setIsNavShown] = useState(false);

  const headerClasses = cx('header', className);
  const navClasses = cx(
    'primary-navigation',
    isNavShown ? cx('show') : undefined
  );

  return (
    <header className={headerClasses}>
      <SkipNavigationLink />
      <div className="container">
        <div className={cx('bar')}>
          <div className={cx('logo')}>
            <Link legacyBehavior href="/">
              <a title="Home">
                <Image
                  src="/logo.png"
                  width={400}
                  height={80}
                  alt="Blueprint media logo"
                  layout="responsive"
                />
              </a>
            </Link>
          </div>
          {/* <div><p>An inside look at living, studying and working at Cal Poly.</p></div> */}
          <button
            type="button"
            className={cx('nav-toggle')}
            onClick={() => setIsNavShown(!isNavShown)}
            aria-label="Toggle navigation"
            aria-controls={cx('primary-navigation')}
            aria-expanded={isNavShown}
          >
            <FaBars />
          </button>
        </div>
      </div>
      <div className={cx('navbar')}>
      <div className={cx('container')}>
      <div className={cx('navbarContainer')}>
          <NavigationMenu
              id={cx('primary-navigation')}
              className={navClasses}
              menuItems={menuItems}
            >
              <li>
                <Link legacyBehavior href="/search">
                  <a>
                    <FaSearch title="Search" role="img" />
                  </a>
                </Link>
              </li>
            </NavigationMenu>
            {appConfig?.socialLinks && (
          <div className={cx('social-links')}>
            <ul aria-label="Social media">
              {appConfig.socialLinks?.twitterUrl && (
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx('social-icon-link')}
                    href={appConfig.socialLinks.twitterUrl}
                  >
                    <FaXTwitter title="Twitter" className={cx('social-icon')} />
                  </a>
                </li>
              )}

              {appConfig.socialLinks?.facebookUrl && (
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx('social-icon-link')}
                    href={appConfig.socialLinks.facebookUrl}
                  >
                    <FaFacebookF
                      title="Facebook"
                      className={cx('social-icon')}
                    />
                  </a>
                </li>
              )}

              {appConfig.socialLinks?.instagramUrl && (
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cx('social-icon-link')}
                    href={appConfig.socialLinks.instagramUrl}
                  >
                    <FaInstagram
                      title="Instagram"
                      className={cx('social-icon')}
                    />
                  </a>
                </li>
              )}


            </ul>
          </div>
              )}
        </div>
      </div>

      </div>
    </header>
  );
}
