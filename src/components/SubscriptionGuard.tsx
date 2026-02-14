import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Loader2, Lock } from 'lucide-react';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const { subscription, loading, canAccess } = useSubscription();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // If user has no subscription or subscription is not active, redirect to billing
    if (!subscription || !canAccess) {
        return <Navigate to="/billing" state={{ from: location }} replace />;
    }

    // If subscription is past_due, show warning but allow access
    if (subscription.status === 'past_due') {
        return (
            <div className="min-h-screen bg-neutral-50">
                <div className="bg-yellow-50 border-b border-yellow-200 p-4">
                    <div className="max-w-7xl mx-auto flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-yellow-600" />
                        <div>
                            <p className="text-sm font-medium text-yellow-900">
                                Votre paiement a échoué
                            </p>
                            <p className="text-sm text-yellow-700">
                                Veuillez mettre à jour votre moyen de paiement pour continuer à utiliser Flipika.{' '}
                                <a href="/billing" className="underline font-medium">
                                    Gérer mon abonnement
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        );
    }

    return <>{children}</>;
}
