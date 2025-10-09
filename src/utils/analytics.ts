// Google Analytics 4
export const initAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) return;

  // Load GA script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId);
};

// Track custom events
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
};

