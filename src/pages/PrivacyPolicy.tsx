import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './LegalPages.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Retour à l'accueil
          </Link>

          <motion.h1 
            className="legal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Politique de Confidentialité
          </motion.h1>

          <motion.div 
            className="legal-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <section className="legal-section">
              <h2>1. Introduction</h2>
              <p>
                Chez Flipika, la protection de vos données personnelles est notre priorité.
                Cette politique de confidentialité explique comment nous collectons, utilisons,
                stockons et protégeons vos informations personnelles conformément au Règlement
                Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Qui sommes-nous ?</h2>
              <p>
                Le responsable du traitement de vos données personnelles est :
                <strong>Flipika SAS</strong><br/>
                Siège social : 123 rue de l'Innovation, 75001 Paris, France<br/>
                Email : privacy@flipika.com<br/>
                SIRET : 123 456 789 00010
              </p>
            </section>

            <section className="legal-section">
              <h2>3. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul>
                <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
                <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, logs de connexion</li>
                <li><strong>Données d'utilisation :</strong> pages visitées, temps passé sur le site</li>
                <li><strong>Données commerciales :</strong> informations sur votre utilisation de nos services</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. Base légale du traitement</h2>
              <p>Nous traitons vos données sur les bases légales suivantes :</p>
              <ul>
                <li><strong>Consentement :</strong> pour l'envoi de newsletters et communications marketing</li>
                <li><strong>Contrat :</strong> pour fournir nos services</li>
                <li><strong>Intérêt légitime :</strong> pour améliorer nos services et prévenir la fraude</li>
                <li><strong>Obligation légale :</strong> pour respecter nos obligations comptables et fiscales</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>5. Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul>
                <li>Fournir et améliorer nos services</li>
                <li>Vous contacter concernant nos services</li>
                <li>Envoyer des communications marketing (avec votre consentement)</li>
                <li>Analyser l'utilisation du site et améliorer l'expérience utilisateur</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>6. Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles uniquement pendant la durée nécessaire
                aux finalités pour lesquelles elles ont été collectées :
              </p>
              <ul>
                <li><strong>Données de contact :</strong> 3 ans après le dernier contact</li>
                <li><strong>Données de compte :</strong> durée du contrat + 5 ans</li>
                <li><strong>Données de navigation :</strong> 13 mois maximum</li>
                <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>7. Partage des données</h2>
              <p>
                Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées avec :
              </p>
              <ul>
                <li>Prestataires techniques (hébergement, email, analytics)</li>
                <li>Autorités légales (sur demande légale)</li>
                <li>Successeurs en cas de cession d'activité</li>
              </ul>
              <p>Tous nos partenaires sont soumis à des obligations de confidentialité strictes.</p>
            </section>

            <section className="legal-section">
              <h2>8. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
                pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
              <p>
                Ces mesures incluent : chiffrement des données, pare-feu, accès restreints,
                sauvegardes régulières, et formation du personnel.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Vos droits</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit d'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> restreindre le traitement de vos données</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à : <strong>privacy@flipika.com</strong>
                ou par courrier à l'adresse indiquée ci-dessus.
              </p>
            </section>

            <section className="legal-section">
              <h2>10. Cookies</h2>
              <p>
                Nous utilisons des cookies pour améliorer votre expérience sur notre site.
                Les cookies utilisés incluent :
              </p>
              <ul>
                <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
                <li><strong>Cookies de préférence :</strong> mémorisent vos choix</li>
                <li><strong>Cookies d'analyse :</strong> mesurent l'audience du site</li>
                <li><strong>Cookies marketing :</strong> avec votre consentement préalable</li>
              </ul>
              <p>
                Vous pouvez configurer vos préférences en matière de cookies à tout moment
                via notre outil de gestion des cookies.
              </p>
            </section>

            <section className="legal-section">
              <h2>11. Transferts internationaux</h2>
              <p>
                Vos données peuvent être transférées vers des pays hors UE dans le cadre de l'utilisation
                de certains services (Google Cloud, etc.). Ces transferts sont protégés par des clauses
                contractuelles types approuvées par la Commission Européenne.
              </p>
            </section>

            <section className="legal-section">
              <h2>12. Modifications de la politique</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                Les modifications seront publiées sur cette page avec indication de la date de mise à jour.
                Nous vous informerons par email des changements significatifs.
              </p>
            </section>

            <section className="legal-section">
              <h2>13. Contact</h2>
              <p>
                Pour toute question concern cette politique de confidentialité ou vos données personnelles,
                vous pouvez nous contacter :
              </p>
              <ul>
                <li><strong>Email :</strong> privacy@flipika.com</li>
                <li><strong>Adresse postale :</strong> Flipika - Privacy, 123 rue de l'Innovation, 75001 Paris</li>
              </ul>
              <p>
                Vous avez également le droit de déposer une réclamation auprès de la CNIL :
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer"> www.cnil.fr</a>
              </p>
            </section>

            <div className="legal-update-info">
              <p><strong>Dernière mise à jour :</strong> 1er janvier 2024</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;