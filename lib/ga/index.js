import ReactGA from 'react-ga4';

export const initGA = () => {
  if (process.env.NEXT_PUBLIC_GA_ID) {
    ReactGA.initialize(process.env.NEXT_PUBLIC_GA_ID);
  }
};

export const logPageView = (url) => {
  ReactGA.send({ hitType: 'pageview', page: url });
};
