import React, { useState } from 'react';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { executeQuery } from '../services/googleAds';
import { AlertCircle, Play, FileJson } from 'lucide-react';
import toast from 'react-hot-toast';

const GoogleAdsPlayground: React.FC = () => {
    const { customerId } = useGoogleAds();
    const [query, setQuery] = useState(`SELECT 
  campaign.id, 
  campaign.name, 
  campaign.status,
  metrics.impressions,
  metrics.clicks
FROM campaign 
WHERE campaign.status != 'REMOVED'
LIMIT 10`);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunQuery = async () => {
        if (!customerId) {
            toast.error("Please select a Google Ads customer first");
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await executeQuery(customerId, query);

            if (response.success) {
                setResults(response.results);
                toast.success(`Query executed: ${response.results.length} rows returned`);
            } else {
                setError(response.error || "Query failed");
                toast.error("Query failed");
            }
        } catch (err: any) {
            setError(err.message || "An unknown error occurred");
            toast.error("An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-4">Google Ads API Playground</h1>

            {!customerId && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                You need to select a Client (Google Ads Account) in the sidebar or header to run queries.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            GAQL Query
                        </label>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-800"
                            placeholder="SELECT ..."
                        />
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                Customer ID: {customerId || 'Not Selected'}
                            </span>
                            <button
                                onClick={handleRunQuery}
                                disabled={loading || !customerId}
                                className={`flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading || !customerId ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Running...' : (
                                    <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Run Query
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Useful Snippets</h3>
                        <div className="space-y-2 text-xs">
                            <button onClick={() => setQuery(`SELECT campaign.id, campaign.name, metrics.clicks FROM campaign LIMIT 5`)} className="block text-blue-600 hover:underline">
                                Get Campaigns
                            </button>
                            <button onClick={() => setQuery(`SELECT ad_group_ad.ad.id, ad_group_ad.ad.type, ad_group_ad.ad.responsive_search_ad.headlines FROM ad_group_ad WHERE ad_group_ad.status = 'ENABLED' LIMIT 5`)} className="block text-blue-600 hover:underline">
                                Get Responsive Search Ads
                            </button>
                            <button onClick={() => setQuery(`SELECT asset.id, asset.name, asset.type, asset.image_asset.full_size.url FROM asset WHERE asset.type = 'IMAGE' LIMIT 5`)} className="block text-blue-600 hover:underline">
                                Get Image Assets
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg shadow overflow-hidden flex flex-col h-[600px]">
                    <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                        <span className="text-gray-300 text-sm font-mono flex items-center">
                            <FileJson className="h-4 w-4 mr-2" />
                            Results
                        </span>
                        {results && (
                            <span className="text-gray-400 text-xs">
                                {results.length} rows
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                        {error ? (
                            <div className="text-red-400 font-mono text-sm">
                                Error:<br />
                                {error}
                            </div>
                        ) : results ? (
                            <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">
                                {JSON.stringify(results, null, 2)}
                            </pre>
                        ) : (
                            <div className="text-gray-500 font-mono text-sm italic">
                                Run a query to see results...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleAdsPlayground;
