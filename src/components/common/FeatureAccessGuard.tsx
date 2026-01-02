import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import AccessDeniedPlaceholder from './AccessDeniedPlaceholder';
import Spinner from './Spinner';

interface FeatureAccessGuardProps {
    children: React.ReactNode;
    featureName?: string;
    requireSubscription?: boolean;
    requireGoogleAds?: boolean;
    /**
     * If true, allows access if demo mode is enabled, regardless of verification status.
     * Default: true
     */
    allowDemo?: boolean;
}

const FeatureAccessGuard: React.FC<FeatureAccessGuardProps> = ({
    children,
    featureName,
    requireSubscription = true,
    requireGoogleAds = true,
    allowDemo = true,
}) => {
    const { canAccess, loading: subLoading } = useSubscription();
    const { isConnected, loading: adsLoading } = useGoogleAds();
    const { isDemoMode } = useDemoMode();

    if (subLoading || adsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Spinner size={48} />
            </div>
        );
    }

    if (allowDemo && isDemoMode) {
        return <>{children}</>;
    }

    const hasSubscription = !requireSubscription || canAccess;
    const hasGoogleAds = !requireGoogleAds || isConnected;

    if (!hasSubscription && !hasGoogleAds) {
        return <AccessDeniedPlaceholder type="both" featureName={featureName} />;
    }

    if (!hasSubscription) {
        return <AccessDeniedPlaceholder type="subscription" featureName={featureName} />;
    }

    if (!hasGoogleAds) {
        return <AccessDeniedPlaceholder type="google-ads" featureName={featureName} />;
    }

    return <>{children}</>;
};

export default FeatureAccessGuard;
