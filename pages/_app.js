import '../faust.config';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { FaustProvider } from '@faustwp/core';

import 'normalize.css/normalize.css';
import '../styles/main.scss';
import ThemeStyles from '../components/ThemeStyles/ThemeStyles';

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || 'G-BRV0397C54';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

    const trackPageView = (url) => {
      window.gtag?.('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    };

    trackPageView(window.location.pathname);

    const handleRouteChange = (url) => trackPageView(url);

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      ) : null}
      <ThemeStyles />
      <FaustProvider pageProps={pageProps}>
        <Component {...pageProps} key={router.asPath} />
      </FaustProvider>
    </>
  );
}
