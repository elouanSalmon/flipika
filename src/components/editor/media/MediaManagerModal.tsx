
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Upload,
    Image as ImageIcon,
    Trash2,
    Check,
    Loader2
} from 'lucide-react';
import ConfirmationModal from '../../common/ConfirmationModal';
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
    const [imageToDelete, setImageToDelete] = useState<ImageMetaData | null>(null);

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

    const handleDeleteClick = (image: ImageMetaData, e: React.MouseEvent) => {
        e.stopPropagation();
        setImageToDelete(image);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        try {
            await deleteImage(imageToDelete);
            setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
            toast.success("Image supprimée");
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la suppression");
        } finally {
            setImageToDelete(null);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden backdrop-blur-md"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] bg-[var(--glass-bg)]">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-primary" />
                        Médiathèque
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors text-[var(--color-text-secondary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--color-border)] px-5 bg-[var(--color-bg-secondary)]">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all ${activeTab === 'upload'
                            ? 'border-primary text-primary dark:text-primary-light'
                            : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                    >
                        Uploader
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`py-4 px-6 text-sm font-semibold border-b-2 transition-all ${activeTab === 'library'
                            ? 'border-primary text-primary dark:text-primary-light'
                            : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                    >
                        Ma Galerie
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg-primary)]">
                    {activeTab === 'upload' ? (
                        <div
                            className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 ${dragActive
                                ? 'border-primary bg-primary-50/50 dark:bg-primary-900/10 scale-[0.99]'
                                : 'border-[var(--color-border)] hover:border-primary-light/50 hover:bg-[var(--color-bg-secondary)]'
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
                                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                                    <p className="text-[var(--color-text-primary)] font-medium text-lg">Optimisation et envoi en cours...</p>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">Conversion WebP & Redimensionnement</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-6 max-w-md mx-auto">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-sm">
                                        <Upload className="w-10 h-10 text-primary dark:text-primary-light" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-semibold text-[var(--color-text-primary)]">
                                            Glissez-déposez vos images ici
                                        </p>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                            ou
                                        </p>
                                    </div>
                                    <label
                                        htmlFor="image-upload"
                                        className="btn btn-primary cursor-pointer w-full max-w-xs mx-auto"
                                    >
                                        Parcourir les fichiers
                                    </label>
                                    <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-text-muted)] mt-6 bg-[var(--color-bg-secondary)] py-2 px-4 rounded-full border border-[var(--color-border)] w-fit mx-auto">
                                        <span className="flex items-center gap-1"><Check size={10} className="text-green-500" /> Auto-conversion WebP</span>
                                        <span className="w-px h-3 bg-[var(--color-border)]"></span>
                                        <span className="flex items-center gap-1"><Check size={10} className="text-green-500" /> Max 1200px</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Gallery View
                        <div className="h-full">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                </div>
                            ) : images.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
                                    <div className="bg-[var(--color-bg-secondary)] p-6 rounded-full mb-4">
                                        <ImageIcon className="w-12 h-12 text-[var(--color-text-muted)]" />
                                    </div>
                                    <p className="text-lg font-medium">Aucune image dans votre galerie</p>
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className="mt-4 text-primary hover:text-primary-dark font-medium btn-link"
                                    >
                                        Commencer à uploader
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {images.map((image) => (
                                        <div
                                            key={image.id}
                                            className="group relative aspect-square bg-[var(--color-bg-secondary)] rounded-xl overflow-hidden border border-[var(--color-border)] cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300"
                                            onClick={() => {
                                                onSelectImage(image.url);
                                                onClose();
                                            }}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => handleDeleteClick(image, e)}
                                                className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-105 shadow-md transform translate-y-[-10px] group-hover:translate-y-0"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            {/* Info Badge */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-all transform translate-y-[10px] group-hover:translate-y-0">
                                                <p className="font-medium truncate">{image.name}</p>
                                                <p className="opacity-80 text-[10px]">{image.width}x{image.height} • {(image.size / 1024).toFixed(0)}kb</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!imageToDelete}
                onClose={() => setImageToDelete(null)}
                onConfirm={confirmDelete}
                title="Supprimer l'image"
                message="Voulez-vous vraiment supprimer cette image ? Cette action est irréversible."
                confirmLabel="Supprimer"
                isDestructive={true}
            />
        </div>,
        document.body
    );
};
