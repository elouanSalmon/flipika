import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './LegalPages.css';

const LegalNotices: React.FC = () => {
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
            Mentions Légales
          </motion.h1>

          <motion.div 
            className="legal-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <section className="legal-section">
              <h2>1. Informations générales</h2>
              <p>
                Le présent site est édité par <strong>Flipika</strong>, société par actions simplifiée au capital de 1 000 euros,
                immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 123 456 789.
              </p>
              <p>
                <strong>Siège social :</strong> 123 rue de l'Innovation, 75001 Paris, France<br/>
                <strong>Téléphone :</strong> +33 (0)1 23 45 67 89<br/>
                <strong>Email :</strong> contact@flipika.com<br/>
                <strong>Directeur de la publication :</strong> Elouan Salmon
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Hébergement</h2>
              <p>
                Le site est hébergé par <strong>Google Cloud Platform</strong>,<br/>
                Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.<br/>
                <strong>Téléphone :</strong> +353 1 436 1000
              </p>
            </section>

            <section className="legal-section">
              <h2>3. Propriété intellectuelle</h2>
              <p>
                L'ensemble des contenus présents sur le site (textes, images, vidéos, logos, marques, etc.)
                est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, adaptation ou exploitation, même partielle,
                de ces contenus est strictement interdite sans autorisation écrite préalable de Flipika.
              </p>
            </section>

            <section className="legal-section">
              <h2>4. Données personnelles</h2>
              <p>
                Les données personnelles collectées sur le site sont utilisées uniquement dans le cadre
                des services proposés par Flipika, conformément à notre politique de confidentialité.
              </p>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
                d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité
                et d'opposition concernant vos données personnelles.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Cookies</h2>
              <p>
                Le site utilise des cookies pour améliorer l'expérience utilisateur.
                En naviguant sur le site, vous acceptez l'utilisation de ces cookies.
                Vous pouvez configurer vos préférences en matière de cookies à tout moment.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Limitation de responsabilité</h2>
              <p>
                Flipika s'efforce de fournir des informations aussi précises que possible sur le site,
                mais ne saurait être tenu pour responsable de toute erreur, omission ou inexactitude.
              </p>
              <p>
                L'utilisateur du site reconnaît avoir vérifié la compatibilité de son équipement informatique
                avec le site et que ses capacités techniques lui permettent un accès et une utilisation
                sans erreur du site et de ses services.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Droit applicable et juridiction</h2>
              <p>
                Les présentes mentions légales sont soumises au droit français.
                En cas de litige, une solution amiable sera recherchée. À défaut,
                les tribunaux de Paris seront seuls compétents.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Contact</h2>
              <p>
                Pour toute question concernant ces mentions légales ou le site en général,
                vous pouvez nous contacter à : <strong>legal@flipika.com</strong>
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

export default LegalNotices;