---
stepsCompleted: [1]
inputDocuments: ['analysis/brainstorming-session-2026-01-05.md']
date: 2026-01-05
author: Elou
---

# Product Brief: flipika

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Sommaire Exécutif

Flipika est le moteur de reporting "Sérénité" pour les Media Buyers. Il transforme la corvée de reporting hebdomadaire stressante et répétitive en un état de "Béatitude". En liant les contextes spécifiques aux clients (couleurs, modèles, widgets) à des "Presets Clients" rigides et en imposant une validation "Pre-Flight", Flipika élimine la peur de l'erreur et la pénibilité de l'assemblage manuel.

---

## Vision Centrale

### Énoncé du Problème
Les Media Buyers font face à un flux de travail épuisant : assembler manuellement des rapports pour plusieurs clients, chacun avec une image de marque et des besoins de données uniques. Ce processus est "long et pénible" et chargé de l'anxiété de commettre une simple erreur de copier-coller.

### Impact du Problème
Stress élevé, heures facturables gaspillées et risque constant de nuire à la confiance du client par une "erreur par omission" (mauvais logo, mauvaises données).

### Pourquoi les solutions existantes échouent
Les outils actuels fournissent les briques (modèles, thèmes) mais obligent l'utilisateur à les assembler manuellement à chaque fois. Ils manquent du "Lien de Contexte Client" qui permet à l'outil de "savoir" pour qui est le rapport.

### Solution Proposée
Une plateforme d'automatisation "Safety First" (Sécurité d'abord) dotée de "Presets Clients" qui verrouillent rigidement les règles de marque et de données à une identité client, couplée à des "Vérifications Pre-Flight" qui valident chaque rapport avant son envoi.

### Différenciateurs Clés
Nous ne vendons pas seulement de la "Vitesse" ; nous vendons de la "Sérénité" (Peace of Mind). Nous privilégions la sécurité, la validation et l'élimination de la charge mentale sur le simple nombre de fonctionnalités.

## Cible Utilisateurs

### Utilisateurs Principaux : "Thomas, le Media Buyer Pressé"

*   **Rôle :** Media Buyer / Account Manager en agence ou freelance.
*   **Motivation Profonde :** "Rentrer chez lui plus tôt." Il ne cherche pas à impressionner par des graphiques complexes, il cherche à liquider sa "To-Do List" de reporting le plus vite possible pour profiter de sa soirée.
*   **Le "Vrai" Problème :** Le reporting est un obstacle entre lui et sa fin de journée. Chaque minute passée à ajuster un logo ou copier-coller des données est une minute volée à son temps libre.
*   **Vision du Succès :** Lundi 17h00. Tous les rapports sont envoyés. Zéro erreur. Il ferme son ordinateur l'esprit tranquille.

### Parcours Utilisateur (Le "Shift" Mental)

1.  **Avant Flipika :** Lundi matin = Angoisse. Ouvre 10 onglets. Copie-colle frénétiquement. Vérifie 3 fois. Envoie avec la boule au ventre ("Et si j'ai laissé le logo du client précédent ?").
2.  **Avec Flipika :** Lundi matin = Café. Ouvre Flipika. Voit que tous les rapports sont prêts et pré-validés. Clique sur "Approuver tout". Fini à 9h15.

## Métriques de Succès

### Métriques de Succès Utilisateur (Valeur Perçue)

*   **Ratio Administration vs Analyse :**
    *   *Avant :* 80% du temps sur la mise en forme (Excel, copier-coller), 20% sur l'analyse.
    *   *Objectif Flipika :* **10% mise en forme / 90% analyse.** L'utilisateur passe son temps à écrire *ce qui compte* (l'insight), pas à aligner des cellules.
*   **Confiance "Pre-Flight" :**
    *   *Objectif :* 100% de confiance au moment du clique "Envoyer". Zéro réouverture de rapport pour "vérifier juste une dernière fois".

### Indicateurs de Performance (KPIs)

*   **Adoption des Presets (North Star Metric) :**
    *   % de clients configurés avec un preset complet. Un utilisateur qui a configuré tous ses clients ne partira jamais.
*   **Taux d'Édition Manuelle de la "Structure" :**
    *   On veut que ce chiffre tende vers 0. Si l'utilisateur doit modifier la structure ou le design après génération, c'est un échec du Preset.
    *   *Note :* L'édition du *texte d'analyse* est attendue et valorisée ; l'édition du *design* est un échec.

### Objectifs Business
*   Positionner Flipika comme l'outil des "Experts" qui veulent passer du temps sur la stratégie, pas sur la bureautique.

## Périmètre MVP

### Fonctionnalités Cœurs (Core Features)

1.  **Binding "Client Presets" (Le Cœur) :**
    *   Liaison technique entre un *Google Ads Customer ID* (le compte client) et une configuration Flipika (Template + Thème + Fréquence).
    *   Le système "reconnaît" le client et applique ses règles automatiquement.
2.  **Safety Net UI (La Promesse) :**
    *   Interface de "Pre-Flight Check" avant génération.
    *   Affichage visuel clair : "Vous générez le rapport pour CLIENT X avec le thème Y". Validation obligatoire.
3.  **Flux d'Envoi "Low-Tech" & Sécurisé :**
    *   Génération PDF côté client.
    *   Déclenchement d'un lien `mailto:` pré-rempli (Adresse client du Preset + Objet standardisé + Corps d'email standardisé).
    *   L'utilisateur garde le contrôle final de l'envoi via son propre client mail.

### Hors Périmètre pour le MVP (Out of Scope)

*   **Autres Sources de Données :** Pas de Facebook Ads, LinkedIn Ads, etc. (Focus Google Ads pur).
*   **Rédaction Automatique (GenAI) :** Pas de génération de texte d'analyse par IA. L'utilisateur écrit ses propres insights.
*   **Envoi Automatisé (SMTP/Server) :** Pas d'envoi "boîte noire" depuis le serveur. On évite les problèmes de spam et on rassure l'utilisateur.
*   **Portail Client :** Pas d'accès direct pour le client final.

### Vision Future

*   **V2 :** Support Multi-plateformes (Meta Ads, etc.).
*   **V3 :** IA "Co-pilote" qui pré-rédige l'analyse des KPIs (l'utilisateur ne fait que repasser dessus).

