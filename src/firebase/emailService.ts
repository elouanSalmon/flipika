import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

export interface EmailSubscription {
  email: string;
  timestamp: any;
  source: string;
  userAgent?: string;
  ipAddress?: string;
}

// Collection name dans Firestore
const COLLECTION_NAME = 'email_subscriptions';

/**
 * Ajouter un email à la collection Firestore
 */
export const subscribeEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔄 Tentative d\'inscription pour:', email);
    
    // Vérifier la connexion à Firestore
    if (!db) {
      console.error('❌ Base de données Firestore non initialisée');
      return {
        success: false,
        message: 'Erreur de configuration. Veuillez réessayer plus tard.'
      };
    }

    console.log('✅ Connexion Firestore OK, vérification des doublons...');
    
    // Vérifier si l'email existe déjà
    const emailQuery = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email.toLowerCase())
    );
    
    const existingEmails = await getDocs(emailQuery);
    
    if (!existingEmails.empty) {
      console.log('⚠️ Email déjà existant:', email);
      return {
        success: false,
        message: 'Cet email est déjà inscrit à notre newsletter.'
      };
    }

    console.log('✅ Email unique, ajout en cours...');

    // Ajouter le nouvel email
    const emailData: EmailSubscription = {
      email: email.toLowerCase(),
      timestamp: serverTimestamp(),
      source: 'landing_page',
      userAgent: navigator.userAgent,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), emailData);
    
    console.log('🎉 Email ajouté avec succès! ID:', docRef.id);
    
    return {
      success: true,
      message: 'Merci ! Votre inscription a été confirmée.'
    };
    
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'ajout de l\'email:', error);
    
    // Messages d'erreur plus spécifiques
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    
    if (error?.code === 'permission-denied') {
      errorMessage = 'Permissions insuffisantes. Veuillez contacter le support.';
    } else if (error?.code === 'unavailable') {
      errorMessage = 'Service temporairement indisponible. Veuillez réessayer.';
    } else if (error?.message?.includes('Firestore')) {
      errorMessage = 'Base de données non disponible. Veuillez réessayer plus tard.';
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Valider le format d'un email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Obtenir le nombre total d'inscriptions (optionnel, pour les stats)
 */
export const getSubscriptionCount = async (): Promise<number> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.size;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre d\'inscriptions:', error);
    return 0;
  }
};