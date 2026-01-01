// Script de test pour vérifier les données d'abonnement dans Firestore
// Usage: node check-subscription-data.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkSubscriptionData() {
    try {
        console.log('🔍 Vérification des données d\'abonnement...\n');

        const subscriptionsSnapshot = await db.collection('subscriptions').get();

        if (subscriptionsSnapshot.empty) {
            console.log('❌ Aucun abonnement trouvé dans Firestore');
            return;
        }

        subscriptionsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📋 Abonnement pour userId: ${doc.id}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Cancel at period end: ${data.cancelAtPeriodEnd}`);
            console.log(`   Canceled at: ${data.canceledAt ? data.canceledAt.toDate() : 'N/A'}`);
            console.log(`   Current period end: ${data.currentPeriodEnd ? data.currentPeriodEnd.toDate() : 'N/A'}`);
            console.log(`   Trial ends at: ${data.trialEndsAt ? data.trialEndsAt.toDate() : 'N/A'}`);
            console.log(`   Stripe subscription ID: ${data.stripeSubscriptionId}`);
            console.log('');
        });

        console.log('✅ Vérification terminée');
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit(0);
    }
}

checkSubscriptionData();
