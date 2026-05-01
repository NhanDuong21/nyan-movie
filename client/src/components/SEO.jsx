import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
    const siteTitle = 'Nyan Movie - The Next Generation Cinema';
    const defaultDescription = 'Watch the latest and greatest movies smoothly and continuously with Nyan Movie.';
    const defaultImage = 'https://nyanmovie.site/default-banner.jpg'; // Adjust to your actual default banner

    const seo = {
        title: title ? `${title} | Nyan Movie` : siteTitle,
        description: description || defaultDescription,
        image: image || defaultImage,
        url: url || window.location.href,
    };

    return (
        <Helmet>
            <title>{seo.title}</title>
            <meta name="description" content={seo.description} />

            <meta property="og:url" content={seo.url} />
            <meta property="og:title" content={seo.title} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:image" content={seo.image} />
            <meta property="og:type" content="website" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description} />
            <meta name="twitter:image" content={seo.image} />
        </Helmet>
    );
};

export default SEO;
