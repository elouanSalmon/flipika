import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import type { Competitor } from '../../data/competitors';

interface ComparisonJSONLDProps {
    competitor: Competitor;
}

const ComparisonJSONLD: React.FC<ComparisonJSONLDProps> = ({ competitor }) => {
    const { t } = useTranslation();

    const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: 'Flipika',
        image: 'https://flipika.com/logo.png', // Replace with actual logo URL
        description: t('alternatives:schema.productDescription', { competitor: competitor.name }),
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
                name: t('alternatives:schema.faq.whyBest.question', { competitor: competitor.name }),
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: t('alternatives:schema.faq.whyBest.answer', { competitor: competitor.name }),
                },
            },
            {
                '@type': 'Question',
                name: t('alternatives:schema.faq.isCheaper.question', { competitor: competitor.name }),
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: t('alternatives:schema.faq.isCheaper.answer', { competitor: competitor.name }),
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
