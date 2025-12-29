#!/usr/bin/env node

/**
 * Test script to simulate a Stripe webhook event locally
 * This helps debug the timestamp conversion issue without deploying
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
    projectId: 'flipika',
});

const db = admin.firestore();

// Simulate the exact Stripe subscription object structure
const mockSubscription = {
    id: 'sub_test123',
    object: 'subscription',
    customer: 'cus_test123',
    status: 'trialing',
    current_period_start: 1735483458,  // Unix timestamp in seconds
    current_period_end: 1738075458,    // Unix timestamp in seconds
    trial_end: 1736693058,             // Unix timestamp in seconds
    cancel_at_period_end: false,
    metadata: {
        userId: 'ZQt6gfWwS8YHiXdDAUnSATDkOuE2'
    },
    items: {
        object: 'list',
        data: [
            {
                id: 'si_test123',
                object: 'subscription_item',
                price: {
                    id: 'price_test123',
                    object: 'price'
                },
                quantity: 1
            }
        ]
    }
};

async function testTimestampConversion() {
    console.log('Testing Stripe timestamp conversion...\n');

    const sub = mockSubscription;

    console.log('Raw Stripe timestamps:');
    console.log('  current_period_start:', sub.current_period_start, '(type:', typeof sub.current_period_start, ')');
    console.log('  current_period_end:', sub.current_period_end, '(type:', typeof sub.current_period_end, ')');
    console.log('  trial_end:', sub.trial_end, '(type:', typeof sub.trial_end, ')');

    // Test the conversion
    const currentPeriodStart = sub.current_period_start;
    const currentPeriodEnd = sub.current_period_end;

    console.log('\nValidation:');
    console.log('  currentPeriodStart exists?', !!currentPeriodStart);
    console.log('  currentPeriodEnd exists?', !!currentPeriodEnd);

    if (!currentPeriodStart || !currentPeriodEnd) {
        console.error('ERROR: Missing timestamps!');
        return;
    }

    // Convert to milliseconds
    const currentPeriodStartMs = Math.floor(currentPeriodStart * 1000);
    const currentPeriodEndMs = Math.floor(currentPeriodEnd * 1000);

    console.log('\nConverted to milliseconds:');
    console.log('  currentPeriodStartMs:', currentPeriodStartMs);
    console.log('  currentPeriodEndMs:', currentPeriodEndMs);
    console.log('  Are they integers?', Number.isInteger(currentPeriodStartMs), Number.isInteger(currentPeriodEndMs));

    // Try creating Firestore Timestamps
    try {
        const firestoreStart = admin.firestore.Timestamp.fromMillis(currentPeriodStartMs);
        const firestoreEnd = admin.firestore.Timestamp.fromMillis(currentPeriodEndMs);

        console.log('\n✅ SUCCESS: Firestore Timestamps created:');
        console.log('  Start:', firestoreStart.toDate().toISOString());
        console.log('  End:', firestoreEnd.toDate().toISOString());

        // Test trial_end if present
        if (sub.trial_end) {
            const trialEndMs = Math.floor(sub.trial_end * 1000);
            const firestoreTrialEnd = admin.firestore.Timestamp.fromMillis(trialEndMs);
            console.log('  Trial End:', firestoreTrialEnd.toDate().toISOString());
        }

        console.log('\n✅ All timestamp conversions successful!');

    } catch (error) {
        console.error('\n❌ ERROR creating Firestore Timestamps:');
        console.error('  Message:', error.message);
        console.error('  Stack:', error.stack);
    }
}

testTimestampConversion()
    .then(() => {
        console.log('\nTest completed.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nTest failed:', error);
        process.exit(1);
    });
