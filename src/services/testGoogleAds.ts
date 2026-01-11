import { fetchSlideMetrics } from './googleAds';

/**
 * Test function to verify Google Ads API connectivity
 * Call this from the browser console to test if the API is working
 */
export async function testGoogleAdsAPI(
    customerId: string,
    campaignIds: string[],
    startDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    endDate: Date = new Date()
) {
    console.group('🧪 Testing Google Ads API');
    console.log('Parameters:', {
        customerId,
        campaignIds,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    });

    try {
        // Test Performance Overview
        console.log('\n📊 Testing Performance Overview...');
        const perfResult = await fetchSlideMetrics(
            customerId,
            campaignIds,
            startDate,
            endDate,
            'performance_overview'
        );

        if (perfResult.success) {
            console.log('✅ Performance Overview SUCCESS');
            console.log('Metrics:', perfResult.metrics);
        } else {
            console.error('❌ Performance Overview FAILED:', perfResult.error);
        }

        // Test Campaign Chart
        console.log('\n📈 Testing Campaign Chart...');
        const chartResult = await fetchSlideMetrics(
            customerId,
            campaignIds,
            startDate,
            endDate,
            'campaign_chart'
        );

        if (chartResult.success) {
            console.log('✅ Campaign Chart SUCCESS');
            console.log('Chart Data Points:', chartResult.chartData?.length);
            console.log('Campaigns:', chartResult.campaigns);
            console.log('Sample Data:', chartResult.chartData?.slice(0, 3));
        } else {
            console.error('❌ Campaign Chart FAILED:', chartResult.error);
        }

        console.groupEnd();
        return {
            performanceOverview: perfResult,
            campaignChart: chartResult
        };
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        console.groupEnd();
        throw error;
    }
}

/**
 * Example usage:
 * 
 * import { testGoogleAdsAPI } from './services/testGoogleAds';
 * 
 * // Replace with your actual customer ID and campaign IDs
 * testGoogleAdsAPI(
 *   'customers/1234567890',
 *   ['123456789', '987654321']
 * );
 */
