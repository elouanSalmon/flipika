/**
 * Script pour inspecter les données d'un rapport dans ReportEditor
 * À exécuter dans la console du navigateur quand vous êtes sur la page d'édition d'un rapport
 */

// Fonction pour extraire les données du rapport depuis le DOM/React
function inspectCurrentReport() {
    console.group('🔍 Inspection du Rapport Actuel');

    try {
        // Essayer de trouver les données React
        const rootElement = document.querySelector('#root');
        if (!rootElement) {
            console.error('❌ Element #root non trouvé');
            return;
        }

        // Chercher les clés React Fiber
        const reactKey = Object.keys(rootElement).find(key =>
            key.startsWith('__reactContainer') || key.startsWith('_reactRootContainer')
        );

        if (!reactKey) {
            console.warn('⚠️ Impossible de trouver les données React directement');
            console.log('💡 Essayez plutôt:');
            console.log('1. Ouvrez React DevTools');
            console.log('2. Sélectionnez le composant ReportEditor');
            console.log('3. Dans la console, tapez: $r.state ou $r.props');
            return;
        }

        console.log('✅ Données React trouvées');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    console.groupEnd();
}

// Fonction helper pour afficher les paramètres d'un widget
window.inspectWidgetParams = function (accountId, campaignIds, startDate, endDate) {
    console.group('📊 Paramètres du Widget');

    console.log('Account ID:', accountId);
    console.log('  Type:', typeof accountId);
    console.log('  Valeur:', accountId);

    console.log('\nCampaign IDs:', campaignIds);
    console.log('  Type:', typeof campaignIds);
    console.log('  Est un Array:', Array.isArray(campaignIds));
    console.log('  Longueur:', campaignIds?.length);
    console.log('  Valeurs:', campaignIds);

    console.log('\nStart Date:', startDate);
    console.log('  Type:', typeof startDate);
    console.log('  Est une Date:', startDate instanceof Date);
    console.log('  ISO String:', startDate instanceof Date ? startDate.toISOString() : 'N/A');

    console.log('\nEnd Date:', endDate);
    console.log('  Type:', typeof endDate);
    console.log('  Est une Date:', endDate instanceof Date);
    console.log('  ISO String:', endDate instanceof Date ? endDate.toISOString() : 'N/A');

    // Formatter pour l'API
    const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return null;
    };

    console.log('\n📤 Paramètres formatés pour l\'API:');
    const apiParams = {
        customerId: accountId,
        campaignIds: campaignIds,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        widgetType: 'performance_overview'
    };
    console.log(JSON.stringify(apiParams, null, 2));

    console.groupEnd();

    return apiParams;
};

// Intercepter les appels fetch pour voir les requêtes
const originalFetch = window.fetch;
window.fetch = function (...args) {
    const [url, options] = args;

    if (url.includes('getWidgetMetrics')) {
        console.group('🌐 Appel API getWidgetMetrics');
        console.log('URL:', url);
        console.log('Method:', options?.method);
        console.log('Headers:', options?.headers);

        if (options?.body) {
            try {
                const body = JSON.parse(options.body);
                console.log('Body:', body);
                console.log('\n📋 Détails des paramètres:');
                window.inspectWidgetParams(
                    body.customerId,
                    body.campaignIds,
                    body.startDate,
                    body.endDate
                );
            } catch (e) {
                console.log('Body (raw):', options.body);
            }
        }
        console.groupEnd();
    }

    return originalFetch.apply(this, args);
};

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Inspecteur de Rapport Activé                                 ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ✅ L'intercepteur fetch est actif                            ║
║  ✅ Tous les appels à getWidgetMetrics seront loggés          ║
║                                                                ║
║  💡 Rafraîchissez un widget pour voir les logs                ║
║                                                                ║
║  Fonctions disponibles:                                       ║
║  - inspectCurrentReport()                                     ║
║  - inspectWidgetParams(accountId, campaignIds, start, end)    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

inspectCurrentReport();
