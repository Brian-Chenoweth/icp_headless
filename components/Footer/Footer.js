import { useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames/bind';
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import appConfig from '../../app.config.js';
import { NavigationMenu } from '../';

import styles from './Footer.module.scss';

let cx = classNames.bind(styles);

/**
 * The Blueprint's Footer component
 * @return {React.ReactElement} The Footer component.
 */
export default function Footer({ menuItems }) {

  const [isNavShown] = useState(false);
  const navClasses = cx(
    'primary-navigation',
    isNavShown ? cx('show') : undefined
  );


  return (
    <footer className={cx('footer')}>
      <div className="container">
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
      </div>
    </footer>
  );
}
