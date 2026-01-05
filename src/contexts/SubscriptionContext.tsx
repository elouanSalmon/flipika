import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Subscription } from '../types/subscriptionTypes';
import { isSubscriptionActive, canAccessPaidFeatures } from '../types/subscriptionTypes';

interface SubscriptionContextType {
    subscription: Subscription | null;
    loading: boolean;
    isActive: boolean;
    canAccess: boolean;
    createCheckout: (priceId: string) => Promise<string>;
    openCustomerPortal: () => Promise<string>;
    syncBilling: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        // Listen to subscription changes in real-time
        const unsubscribe = onSnapshot(
            doc(db, 'subscriptions', user.uid),
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setSubscription({
                        userId: data.userId,
                        stripeCustomerId: data.stripeCustomerId,
                        stripeSubscriptionId: data.stripeSubscriptionId,
                        stripePriceId: data.stripePriceId,
                        status: data.status,
                        currentSeats: data.currentSeats,
                        trialEndsAt: data.trialEndsAt?.toDate(),
                        currentPeriodStart: data.currentPeriodStart?.toDate(),
                        currentPeriodEnd: data.currentPeriodEnd?.toDate(),
                        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
                        createdAt: data.createdAt?.toDate(),
                        updatedAt: data.updatedAt?.toDate(),
                    });
                } else {
                    setSubscription(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching subscription:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const createCheckout = async (priceId: string): Promise<string> => {
        const functions = getFunctions();
        const createCheckoutFn = httpsCallable(functions, 'createStripeCheckout');

        const result = await createCheckoutFn({
            priceId,
            successUrl: `${window.location.origin}/app/billing?session=success`,
            cancelUrl: `${window.location.origin}/app/billing?session=canceled`,
            trialPeriodDays: 14,
        });

        const data = result.data as { url: string };
        return data.url;
    };

    const openCustomerPortal = async (): Promise<string> => {
        const functions = getFunctions();
        const createPortalFn = httpsCallable(functions, 'createStripePortal');

        const result = await createPortalFn({
            returnUrl: `${window.location.origin}/app/billing?from=stripe-portal`,
        });

        const data = result.data as { url: string };
        return data.url;
    };

    const syncBilling = async (): Promise<void> => {
        const functions = getFunctions();
        const syncBillingFn = httpsCallable(functions, 'syncBillingManual');

        await syncBillingFn();
    };

    const value: SubscriptionContextType = {
        subscription,
        loading,
        isActive: isSubscriptionActive(subscription),
        canAccess: canAccessPaidFeatures(subscription),
        createCheckout,
        openCustomerPortal,
        syncBilling,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
