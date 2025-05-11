import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  children?: React.ReactNode;
}

/**
 * SEO component for managing meta tags and structured data
 * This is a simplified version that updates document title and meta description
 */
const SEO: React.FC<SEOProps> = ({
  title = 'FAIT Co-op Platform',
  description = 'FAIT Co-op platform enables contractors, clients, and allied service providers to collaborate through a cooperative platform with standardized pricing and streamlined communication.',
  keywords = ['FAIT', 'co-op', 'contractors', 'clients', 'service providers', 'collaboration'],
  children,
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords.join(', '));
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', keywords.join(', '));
      document.head.appendChild(metaKeywords);
    }
  }, [title, description, keywords]);

  return <>{children}</>;
};

export default SEO;
