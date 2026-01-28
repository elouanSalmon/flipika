import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { Competitor } from '../../data/competitors';

interface ComparisonJSONLDProps {
    competitor: Competitor;
}

const ComparisonJSONLD: React.FC<ComparisonJSONLDProps> = ({ competitor }) => {
    const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: 'Flipika',
        image: 'https://flipika.com/logo.png', // Replace with actual logo URL
        description: `Best ${competitor.name} alternative for Google Ads reporting. Save time and automate your reports.`,
        brand: {
            '@type': 'Brand',
            name: 'Flipika',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9', // Flipika's rating
            reviewCount: '150',
        },
        offers: {
            '@type': 'Offer',
            url: 'https://flipika.com/billing',
            priceCurrency: 'EUR',
            price: '29',
            priceValidUntil: '2026-12-31',
            availability: 'https://schema.org/InStock',
        },
    };

    const comparisonSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `Why is Flipika the best ${competitor.name} alternative?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Flipika offers better speed, more specialized Google Ads insights, and a presentation-first layout compared to ${competitor.name}.`,
                },
            },
            {
                '@type': 'Question',
                name: `Is Flipika cheaper than ${competitor.name}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Flipika offers competitive plans starting at 29€/month with unlimited reports, often making it more cost-effective than ${competitor.name}.`,
                },
            },
        ],
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(productSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(comparisonSchema)}
            </script>
        </Helmet>
    );
};

export default ComparisonJSONLD;
