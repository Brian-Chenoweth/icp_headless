import classNames from 'classnames/bind';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from 'react-icons/fa';

import appConfig from '../../app.config.js';
import { NavigationMenu } from '../';

import styles from './Footer.module.scss';

let cx = classNames.bind(styles);

/**
 * The Blueprint's Footer component
 * @return {React.ReactElement} The Footer component.
 */
export default function Footer({ menuItems }) {
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
                    <FaTwitter title="Twitter" className={cx('social-icon')} />
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

        <NavigationMenu className={cx('nav')} menuItems={menuItems} />

        {/* <div className={cx('copyright')}>
          &copy; {new Date().getFullYear()} Blueprint Media &#183; Powered By{' '}
          <a href="https://wpengine.com/headless-wordpress">
            Headless Platform
          </a>
        </div> */}
      </div>
    </footer>
  );
}
