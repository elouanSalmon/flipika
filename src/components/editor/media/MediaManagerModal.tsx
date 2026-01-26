
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Upload,
    Image as ImageIcon,
    Trash2,
    Check,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
    uploadImage,
    getUserImages,
    deleteImage,
    type ImageMetaData
} from '../../../services/imageService';
import toast from 'react-hot-toast';

interface MediaManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (imageUrl: string) => void;
}

type Tab = 'upload' | 'library';

export const MediaManagerModal: React.FC<MediaManagerModalProps> = ({
    isOpen,
    onClose,
    onSelectImage
}) => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('upload');
    const [images, setImages] = useState<ImageMetaData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Load gallery on open or tab switch
    useEffect(() => {
        if (isOpen && activeTab === 'library' && currentUser) {
            loadGallery();
        }
    }, [isOpen, activeTab, currentUser]);

    const loadGallery = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const userImages = await getUserImages(currentUser.uid);
            setImages(userImages);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger la galerie");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !currentUser) return;

        setIsUploading(true);
        try {
            // Process sequentially to avoid overwhelming browser/network
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/')) {
                    toast.error(`Le fichier ${file.name} n'est pas une image`);
                    continue;
                }

                await uploadImage(file, currentUser.uid);
            }
            toast.success("Images téléchargées avec succès");
            setActiveTab('library');
            loadGallery();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, []);

    const handleDelete = async (image: ImageMetaData, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Voulez-vous vraiment supprimer cette image ?")) return;

        try {
            await deleteImage(image);
            setImages(prev => prev.filter(img => img.id !== image.id));
            toast.success("Image supprimée");
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                        Médiathèque
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Uploader
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Ma Galerie
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                    {activeTab === 'upload' ? (
                        <div
                            className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                id="image-upload"
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />

                            {isUploading ? (
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-300 font-medium">Optimisation et envoi en cours...</p>
                                    <p className="text-xs text-gray-400 mt-2">Conversion WebP & Redimensionnement</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                                        <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            Glissez-déposez vos images ici
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            ou
                                        </p>
                                    </div>
                                    <label
                                        htmlFor="image-upload"
                                        className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-sm"
                                    >
                                        Parcourir les fichiers
                                    </label>
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                                        <Check size={12} /> Auto-conversion WebP
                                        <Check size={12} /> Max 1200px
                                        <Check size={12} /> Optimisé pour le web
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Gallery View
                        <div className="h-full">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                </div>
                            ) : images.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <ImageIcon className="w-16 h-16 mb-4 text-gray-300" />
                                    <p>Aucune image dans votre galerie</p>
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className="mt-4 text-blue-600 hover:underline"
                                    >
                                        Uploader maintenant
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {images.map((image) => (
                                        <div
                                            key={image.id}
                                            className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
                                            onClick={() => {
                                                onSelectImage(image.url);
                                                onClose();
                                            }}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => handleDelete(image, e)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/80 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            {/* Info Badge */}
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                                {image.width}x{image.height} • {(image.size / 1024).toFixed(0)}kb
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
