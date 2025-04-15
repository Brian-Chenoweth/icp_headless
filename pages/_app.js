import '../faust.config';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import ReactGA from 'react-ga4';

import 'normalize.css/normalize.css';
import '../styles/main.scss';
import ThemeStyles from '../components/ThemeStyles/ThemeStyles';

const GA_MEASUREMENT_ID = 'G-BRV0397C54'; // 🔁 Replace with real GA4 ID

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    ReactGA.initialize(GA_MEASUREMENT_ID);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });

    const handleRouteChange = (url) => {
      ReactGA.send({ hitType: "pageview", page: url });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <ThemeStyles />
      <FaustProvider pageProps={pageProps}>
        <Component {...pageProps} key={router.asPath} />
      </FaustProvider>
    </>
  );
}
