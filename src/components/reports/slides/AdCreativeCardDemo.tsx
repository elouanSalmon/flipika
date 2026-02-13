import React, { useState } from 'react';
import AdCreativeCard, { type AdCreativeData, type AdMetrics } from './AdCreativeCard';
import { defaultReportDesign } from '../../../types/reportTypes';
import type { ReportDesign } from '../../../types/reportTypes';

/**
 * Demo component to showcase AdCreativeCard with different ad types
 * This can be used for testing and as a reference for integration
 */
const AdCreativeCardDemo: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const design: ReportDesign = {
        ...defaultReportDesign,
        mode: theme,
        colorScheme: theme === 'dark'
            ? {
                primary: '#3b82f6',
                secondary: '#94a3b8',
                accent: '#06b6d4',
                background: '#141415',
                text: '#f1f5f9',
            }
            : defaultReportDesign.colorScheme,
    };

    // Example Search Ad
    const searchAdData: AdCreativeData = {
        type: 'search',
        headline: 'Logiciel de Gestion Google Ads - Essai Gratuit 14 Jours',
        description: 'Optimisez vos campagnes Google Ads avec Flipika. Rapports automatisés, analyses en temps réel et recommandations IA.',
        displayUrl: 'www.flipika.com/essai-gratuit',
        finalUrl: 'https://www.flipika.com/essai-gratuit',
    };

    const searchAdMetrics: AdMetrics = {
        ctr: {
            value: 4.25,
            formatted: '4.25%',
            change: 12.5,
        },
        conversions: {
            value: 47,
            formatted: '47',
            change: 8.3,
        },
        cost: {
            value: 1247.50,
            formatted: '1 247,50 €',
            change: -5.2,
        },
    };

    // Example Display Ad
    const displayAdData: AdCreativeData = {
        type: 'display',
        headline: 'Boostez vos performances Google Ads',
        description: 'Rapports automatisés et insights puissants pour vos campagnes.',
        displayUrl: 'www.flipika.com',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
        finalUrl: 'https://www.flipika.com',
    };

    const displayAdMetrics: AdMetrics = {
        ctr: {
            value: 2.15,
            formatted: '2.15%',
            change: -3.1,
        },
        conversions: {
            value: 23,
            formatted: '23',
            change: 15.7,
        },
        cost: {
            value: 892.30,
            formatted: '892,30 €',
            change: 2.4,
        },
    };

    return (
        <div style={{
            padding: '40px',
            background: design?.colorScheme?.background || '#ffffff',
            minHeight: '100vh',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                }}>
                    <h1 style={{
                        color: design?.colorScheme?.text || '#111827',
                        fontSize: '32px',
                        fontWeight: '700',
                        margin: 0,
                    }}>
                        AdCreativeCard Demo
                    </h1>
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        style={{
                            padding: '8px 16px',
                            background: design?.colorScheme?.primary || '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                        }}
                    >
                        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                }}>
                    <div>
                        <h2 style={{
                            color: design?.colorScheme?.text || '#111827',
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '16px',
                        }}>
                            Search Ad Example
                        </h2>
                        <AdCreativeCard
                            adData={searchAdData}
                            metrics={searchAdMetrics}
                            design={design}
                        />
                    </div>

                    <div>
                        <h2 style={{
                            color: design?.colorScheme?.text || '#111827',
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '16px',
                        }}>
                            Display Ad Example
                        </h2>
                        <AdCreativeCard
                            adData={displayAdData}
                            metrics={displayAdMetrics}
                            design={design}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdCreativeCardDemo;
