export type SubscriptionStatus =
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'unpaid';

export interface Subscription {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentSeats: number; // Number of active Google Ads accounts
    trialEndsAt?: Date;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface BillingEvent {
    userId: string;
    subscriptionId: string;
    eventType: 'sync' | 'payment_succeeded' | 'payment_failed' | 'subscription_updated' | 'subscription_created' | 'subscription_canceled';
    previousSeats?: number;
    newSeats?: number;
    amount?: number;
    currency?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface CreateCheckoutSessionParams {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trialPeriodDays?: number;
}

export interface SubscriptionSyncResult {
    success: boolean;
    previousSeats: number;
    newSeats: number;
    updated: boolean;
    error?: string;
}

// Helper functions
export const isSubscriptionActive = (subscription: Subscription | null): boolean => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trialing';
};

export const isInTrialPeriod = (subscription: Subscription | null): boolean => {
    if (!subscription || subscription.status !== 'trialing') return false;
    if (!subscription.trialEndsAt) return false;
    return new Date(subscription.trialEndsAt) > new Date();
};

export const getDaysUntilTrialEnd = (subscription: Subscription | null): number => {
    if (!subscription || !subscription.trialEndsAt) return 0;
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

export const canAccessPaidFeatures = (subscription: Subscription | null): boolean => {
    if (!subscription) return false;
    return isSubscriptionActive(subscription) && subscription.status !== 'past_due';
};

export const formatSubscriptionEndDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date));
};

export const isCanceledButActive = (subscription: Subscription | null): boolean => {
    if (!subscription) return false;
    return subscription.cancelAtPeriodEnd && isSubscriptionActive(subscription);
};
