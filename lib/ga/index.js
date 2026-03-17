export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    send_page_view: false,
  });
};

export const logPageView = (url) => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) {
    return;
  }

  window.gtag?.('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
