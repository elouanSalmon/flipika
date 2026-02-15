import type { Client, DataSource, AdPlatform } from './client';

/**
 * Get the Google Ads account ID from a client.
 * Checks dataSources first, falls back to deprecated googleAdsCustomerId.
 */
export function getGoogleAdsAccountId(client: Client): string | null {
    const ds = client.dataSources?.find(d => d.platform === 'google_ads');
    if (ds) return ds.accountId;
    return client.googleAdsCustomerId || null;
}

/**
 * Get the Meta Ads account ID from a client.
 */
export function getMetaAdsAccountId(client: Client): string | null {
    const ds = client.dataSources?.find(d => d.platform === 'meta_ads');
    return ds?.accountId ?? null;
}

export function hasGoogleAds(client: Client): boolean {
    return getGoogleAdsAccountId(client) !== null;
}

export function hasMetaAds(client: Client): boolean {
    return getMetaAdsAccountId(client) !== null;
}

/**
 * Get all data sources for a client, including legacy field.
 * Returns a normalized array even for clients without dataSources[].
 */
export function getDataSources(client: Client): DataSource[] {
    if (client.dataSources && client.dataSources.length > 0) {
        return client.dataSources;
    }
    if (client.googleAdsCustomerId) {
        return [{
            platform: 'google_ads',
            accountId: client.googleAdsCustomerId,
            addedAt: client.createdAt,
        }];
    }
    return [];
}

export function getDataSourceByPlatform(client: Client, platform: AdPlatform): DataSource | null {
    return getDataSources(client).find(d => d.platform === platform) ?? null;
}
