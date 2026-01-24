import type { FlexibleDataConfig } from '../components/editor/blocks/FlexibleDataBlock';

interface GAQLScope {
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    campaignIds: string[];
}

export const buildFlexibleQuery = (config: FlexibleDataConfig, scope: GAQLScope): string => {
    const { metrics, dimension, limit = 10, sortBy, sortOrder = 'DESC' } = config;

    // Validate metrics
    if (!metrics || metrics.length === 0) {
        throw new Error("At least one metric must be selected.");
    }

    // Order By
    // Default to first metric if not specified
    const orderByField = sortBy || metrics[0];

    // Select clause
    const selectFields = Array.from(new Set([
        dimension,
        ...metrics,
        orderByField
    ])).filter(Boolean).join(', ');

    // From clause
    // If we are selecting metrics, 'campaign' is usually a safe main resource, 
    // or 'customer' if no specific lower-level resource is needed.
    // However, if we group by 'ad_group', we should select from 'ad_group'.
    // If we group by 'campaign', select from 'campaign'.
    // Logic: 
    // - if dimension starts with 'ad_group', use 'ad_group'
    // - if dimension starts with 'campaign', use 'campaign'
    // - otherwise 'campaign' is generally fine for broad metrics, or 'customer'

    let resource = 'campaign';
    if (dimension?.startsWith('ad_group')) resource = 'ad_group';
    // Add more resource inference if needed

    // Where clause
    const whereConditions = [
        `segments.date BETWEEN '${scope.startDate}' AND '${scope.endDate}'`
    ];

    if (scope.campaignIds.length > 0) {
        // GAQL IN clause
        const ids = scope.campaignIds.join(',');
        whereConditions.push(`campaign.id IN (${ids})`);
    }

    const whereClause = whereConditions.join(' AND ');

    const orderByClause = `ORDER BY ${orderByField} ${sortOrder}`;

    // Construct Query
    return `
        SELECT 
            ${selectFields}
        FROM 
            ${resource}
        WHERE 
            ${whereClause}
        ${orderByClause}
        LIMIT ${limit}
    `.replace(/\s+/g, ' ').trim();
};
