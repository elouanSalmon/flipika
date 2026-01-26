
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { storage, db } from '../firebase/config';

export interface ImageMetaData {
    id: string;
    url: string;
    path: string; // Storage path
    name: string;
    width?: number;
    height?: number;
    size: number;
    mimeType: string;
    createdAt: Date;
    userId: string;
}

const USER_MEDIA_COLLECTION = 'user_media';

/**
 * Compress and resize image before upload
 */
export async function optimizeImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.2, // Target < 200kb
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp'
    };

    try {
        const compressedFile = await imageCompression(file, options);
        // Ensure extension is .webp
        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
        // Create a new file with the correct name/type if needed
        return new File([compressedFile], newName, { type: 'image/webp' });
    } catch (error) {
        console.error("Image optimization failed:", error);
        throw new Error("Failed to optimize image");
    }
}

/**
 * Upload image to Firebase Storage and metadata to Firestore
 */
export async function uploadImage(file: File, userId: string): Promise<ImageMetaData> {
    try {
        // 1. Optimize
        const optimizedFile = await optimizeImage(file);

        // 2. Generate unique path
        // Using timestamp + random string for uniqueness
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}_${randomStr}.webp`;
        const storagePath = `users/${userId}/media/${fileName}`;

        // 3. Upload to Storage
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, optimizedFile);
        const downloadUrl = await getDownloadURL(storageRef);

        // 4. Get dimensions (optional but good for metadata)
        const dimensions = await getImageDimensions(optimizedFile);

        // 5. Save metadata to Firestore
        const metadata: Omit<ImageMetaData, 'id'> = {
            url: downloadUrl,
            path: storagePath,
            name: file.name, // Original name
            width: dimensions.width,
            height: dimensions.height,
            size: optimizedFile.size,
            mimeType: optimizedFile.type,
            createdAt: new Date(), // converted for firestore
            userId: userId
        };

        // Allow firestore to create the ID
        const docRef = await addDoc(collection(db, USER_MEDIA_COLLECTION), {
            ...metadata,
            createdAt: serverTimestamp()
        });

        return {
            id: docRef.id,
            ...metadata
        };

    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
}

/**
 * Get user's image gallery
 */
export async function getUserImages(userId: string): Promise<ImageMetaData[]> {
    try {
        const q = query(
            collection(db, USER_MEDIA_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        } as ImageMetaData));

    } catch (error) {
        console.error("Error fetching gallery:", error);
        return [];
    }
}

/**
 * Delete image from Storage and Firestore
 */
export async function deleteImage(image: ImageMetaData): Promise<void> {
    try {
        // 1. Delete from Storage
        const storageRef = ref(storage, image.path);
        await deleteObject(storageRef);

        // 2. Delete metadata from Firestore
        await deleteDoc(doc(db, USER_MEDIA_COLLECTION, image.id));
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
}

// Helper to get image dimensions
function getImageDimensions(file: File): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
