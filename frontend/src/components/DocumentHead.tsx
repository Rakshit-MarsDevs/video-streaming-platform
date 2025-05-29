import React, { useEffect } from 'react';
import { generateFaviconDataUrl } from '../assets/icons/index.tsx';

interface DocumentHeadProps {
  title?: string;
}

const DocumentHead: React.FC<DocumentHeadProps> = ({ title = 'VideoStream' }) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update favicon
    const faviconUrl = generateFaviconDataUrl();
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    
    favicon.href = faviconUrl;

    // Add theme color meta tag for mobile browsers
    let themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }
    
    themeColor.content = '#1a1a2e'; // Match your navbar background color
  }, [title]);

  return null; // This component doesn't render anything
};

export default DocumentHead; 