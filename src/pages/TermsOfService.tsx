import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './LegalPages.css';

const TermsOfService: React.FC = () => {
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
            Conditions d'Utilisation
          </motion.h1>

          <motion.div 
            className="legal-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <section className="legal-section">
              <h2>1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant le site web Flipika (ci-après "le Service"), vous acceptez
                d'être lié par ces Conditions d'Utilisation. Si vous n'acceptez pas ces conditions,
                veuillez ne pas utiliser notre Service.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Description du service</h2>
              <p>
                Flipika fournit une plateforme d'automatisation et d'optimisation des campagnes publicitaires
                Google Ads utilisant l'intelligence artificielle. Le Service inclut l'accès à notre plateforme,
                aux outils d'analyse, et aux recommandations générées par notre IA.
              </p>
              <p>
                Le Service est fourni "tel quel" et peut être modifié, suspendu ou interrompu à tout moment
                sans préavis.
              </p>
            </section>

            <section className="legal-section">
              <h2>3. Conditions d'accès</h2>
              <p>
                L'utilisation du Service nécessite la création d'un compte utilisateur. Vous vous engagez à :
              </p>
              <ul>
                <li>Fournir des informations exactes, complètes et à jour lors de l'inscription</li>
                <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                <li>Être responsable de toutes les activités effectuées sous votre compte</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. Utilisation autorisée</h2>
              <p>Vous acceptez d'utiliser le Service uniquement pour des usages légaux et conformes à ces conditions. Il est interdit de :</p>
              <ul>
                <li>Utiliser le Service de manière à violer les lois applicables</li>
                <li>Transmettre des virus, malwares ou tout code malveillant</li>
                <li>Tenter d'accéder à des zones non autorisées du Service</li>
                <li>Utiliser des robots, spiders ou autres moyens automatisés sans autorisation</li>
                <li>Collecter des données personnelles d'autres utilisateurs sans consentement</li>
                <li>Utiliser le Service pour du spam ou des communications non sollicitées</li>
                <li>Afficher, copier ou télécharger des portions non autorisées du Service</li>
                <li>Contourner ou désactiver les mesures de sécurité du Service</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>5. Propriété intellectuelle</h2>
              <p>
                Le Service et son contenu original (sauf contenu généré par les utilisateurs), fonctionnalités
                et fonctionnalités sont et resteront la propriété exclusive de Flipika et de ses concédants.
              </p>
              <p>
                Le Service est protégé par le droit d'auteur, les marques commerciales et autres lois.
                Aucune partie du Service ne peut être copiée, modifiée, distribuée, vendue ou exploitée
                sans notre consentement écrit préalable.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Données utilisateur</h2>
              <p>
                Vous gardez la propriété de tout contenu que vous soumettez, publiez ou affichez via le Service.
                En soumettant ce contenu, vous accordez à Flipika une licence mondiale, non exclusive,
                transférable, sous-licenciable, libre de redevances pour utiliser, copier, modifier,
                distribuer et afficher ce contenu dans le cadre du Service.
              </p>
              <p>
                Vous déclarez et garantissez que : (i) vous détenez les droits sur le contenu ou
                avez le droit de le publier, et (ii) le contenu ne viole pas les droits de tiers
                ou les lois applicables.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Comptes Google Ads</h2>
              <p>
                Lorsque vous connectez vos comptes Google Ads à Flipika, vous autorisez notre plateforme à :
              </p>
              <ul>
                <li>Accéder à vos données de campagnes publicitaires</li>
                <li>Effectuer des modifications sur vos campagnes selon vos paramètres</li>
                <li>Collecter des données de performance pour l'optimisation</li>
                <li>Générer des rapports et analyses</li>
              </ul>
              <p>
                Vous restez entièrement responsable de votre compte Google Ads et de toutes les actions
                effectuées via notre plateforme. Nous ne sommes pas responsables des décisions d'optimisation
                ou des résultats obtenus.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Limitation de responsabilité</h2>
              <p>
                Dans toute la mesure permise par la loi applicable, Flipika, ses dirigeants, employés,
                agents, fournisseurs ou concédants ne seront pas responsables de :
              </p>
              <ul>
                <li>Toute perte de profits, de revenus, de données ou de réputation</li>
                <li>Tout dommage indirect, accessoire, spécial ou consécutif</li>
                <li>Toute interruption ou cessation du Service</li>
                <li>Toute erreur ou omission dans le contenu du Service</li>
                <li>Toute perte ou corruption de données</li>
                <li>Tout virus ou autre code malveillant transmis via le Service</li>
              </ul>
              <p>
                Cette limitation s'applique même si Flipika a été informé de la possibilité de tels dommages
                et que les recours prévus par ces conditions échouent dans leur objectif essentiel.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Garantie et clause de non-responsabilité</h2>
              <p>
                Le Service est fourni "TEL QUEL" et "SELON DISPONIBILITÉ" sans garantie d'aucune sorte.
                Flipika décline expressément toutes les garanties, expresses ou implicites, y compris
                mais sans s'y limiter, les garanties implicites de qualité marchande, d'adéquation
                à un usage particulier et de non-contrefaçon.
              </p>
              <p>
                Flipika ne garantit pas que : (i) le Service sera ininterrompu, sécurisé ou sans erreur,
                (ii) les résultats obtenus par l'utilisation du Service seront exacts ou fiables,
                (iii) la qualité des produits, services, informations ou autres matériels achetés
                ou obtenus par vous répondra à vos attentes.
              </p>
            </section>

            <section className="legal-section">
              <h2>10. Suspension et résiliation</h2>
              <p>
                Flipika peut suspendre ou résilier votre accès au Service immédiatement, sans préavis
                ni responsabilité, pour quelque raison que ce soit, y compris mais sans s'y limiter,
                si vous violez les présentes Conditions.
              </p>
              <p>
                En cas de résiliation : (i) votre droit d'utiliser le Service cessera immédiatement,
                (ii) vous devez cesser toute utilisation du Service et détruire toutes les copies
                que vous détenez du Service ou de son contenu.
              </p>
            </section>

            <section className="legal-section">
              <h2>11. Modifications du Service</h2>
              <p>
                Flipika se réserve le droit de modifier ou interrompre, temporairement ou définitivement,
                le Service ou toute partie de celui-ci avec ou sans préavis. Vous acceptez que Flipika
                ne soit pas responsable envers vous ou tout tiers pour toute modification, suspension ou interruption du Service.
              </p>
            </section>

            <section className="legal-section">
              <h2>12. Modifications des conditions</h2>
              <p>
                Flipika se réserve le droit de modifier ces Conditions à tout moment. Nous vous informerons
                de tout changement important par email ou via le Service. Les modifications entreront en vigueur
                30 jours après la notification. Votre utilisation continue du Service après cette période
                constitue votre acceptation des conditions modifiées.
              </p>
              <p>
                Il est de votre responsabilité de vérifier régulièrement ces Conditions pour tout changement.
                Si vous n'acceptez pas les modifications, vous devez cesser d'utiliser le Service.
              </p>
            </section>

            <section className="legal-section">
              <h2>13. Droit applicable et juridiction</h2>
              <p>
                Ces Conditions sont régies par et interprétées conformément aux lois françaises,
                sans égard aux principes de conflit de lois. Tout litige découlant de ou lié à ces
                Conditions ou à votre utilisation du Service sera soumis à la juridiction exclusive des tribunaux de Paris.
              </p>
            </section>

            <section className="legal-section">
              <h2>14. Dispositions générales</h2>
              <p>
                Ces Conditions constituent l'intégralité de l'accord entre vous et Flipika concernant le Service
                et remplacent tous les accords antérieurs ou contemporains, écrits ou oraux.
              </p>
              <p>
                Si une disposition de ces Conditions est jugée invalide ou inapplicable par un tribunal compétent,
                cette disposition sera modifiée et interprétée pour accomplir au mieux les objectifs de la
                disposition d'origine dans toute la mesure permise par la loi, et les dispositions restantes
                resteront en vigueur.
              </p>
              <p>
                Le fait que Flipika n'exerce pas ou n'applique pas un droit ou une disposition de ces
                Conditions ne constitue pas une renonciation à ce droit ou cette disposition.
              </p>
            </section>

            <section className="legal-section">
              <h2>15. Contact</h2>
              <p>
                Pour toute question concernant ces Conditions d'Utilisation, vous pouvez nous contacter à :
                <strong>legal@flipika.com</strong>
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

export default TermsOfService;