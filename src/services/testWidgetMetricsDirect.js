/**
 * Script de test pour appeler directement getWidgetMetrics
 * Copier-coller ce code dans la console du navigateur
 */

async function testWidgetMetricsDirectly() {
    console.group('🧪 Test Direct de getWidgetMetrics');

    try {
        // 1. Obtenir le token Firebase
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('❌ Utilisateur non connecté');
            return;
        }

        const token = await user.getIdToken();
        console.log('✅ Token Firebase obtenu');

        // 2. Préparer les paramètres de test
        // IMPORTANT: Remplacez ces valeurs par vos vraies données
        const testParams = {
            customerId: 'customers/VOTRE_CUSTOMER_ID', // Ex: 'customers/1234567890'
            campaignIds: ['CAMPAIGN_ID_1', 'CAMPAIGN_ID_2'], // Ex: ['123456789', '987654321']
            startDate: '2025-12-20',
            endDate: '2025-12-27',
            widgetType: 'performance_overview' // ou 'campaign_chart'
        };

        console.log('📤 Paramètres de test:', testParams);

        // 3. Appeler la fonction
        const response = await fetch('https://us-central1-flipika.cloudfunctions.net/getWidgetMetrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testParams)
        });

        console.log('📊 Statut HTTP:', response.status);

        // 4. Lire la réponse
        const responseText = await response.text();
        console.log('📄 Réponse brute:', responseText);

        try {
            const data = JSON.parse(responseText);
            console.log('✅ Réponse JSON:', data);

            if (data.success) {
                console.log('🎉 SUCCÈS !');
                console.log('Données reçues:', data);
            } else {
                console.error('❌ Échec:', data.error);
            }
        } catch (e) {
            console.error('❌ Erreur de parsing JSON:', e);
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    console.groupEnd();

    // 5. Afficher les instructions pour voir les logs Firebase
    console.log('\n📋 Pour voir les logs Firebase détaillés:');
    console.log('1. Ouvrir: https://console.firebase.google.com/project/flipika/functions/logs');
    console.log('2. Filtrer par: getWidgetMetrics');
    console.log('3. Chercher les logs avec 📥, 🔧, 📝');
}

// Instructions d'utilisation
console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Test Direct de getWidgetMetrics                               ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  1. Modifiez les valeurs dans testParams:                     ║
║     - customerId: Votre ID de compte Google Ads               ║
║     - campaignIds: IDs de vos campagnes                       ║
║                                                                ║
║  2. Exécutez: testWidgetMetricsDirectly()                     ║
║                                                                ║
║  3. Vérifiez les logs dans la console et Firebase             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Pour obtenir vos IDs actuels depuis un rapport existant:
console.log('💡 Pour obtenir vos IDs depuis un rapport:');
console.log(`
// Dans la console, exécutez:
const report = /* votre objet report depuis ReportEditor */;
console.log('Customer ID:', report.accountId);
console.log('Campaign IDs:', report.campaignIds);
console.log('Start Date:', report.startDate);
console.log('End Date:', report.endDate);
`);
