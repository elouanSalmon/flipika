import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ReportDesign } from '../types/reportTypes';
import type { UserProfile } from '../types/userProfile';
import type { Client } from '../types/client';

interface PDFTranslations {
    title: string;
    preparing: string;
    creatingDocument: string;
    coverPage: string;
    slideProgress: string;
    finalizing: string;
    saving: string;
    complete: string;
    pleaseWait: string;
    generatedOn: string;
}

interface PDFGenerationOptions {
    filename: string;
    reportTitle: string;
    startDate?: Date;
    endDate?: Date;
    design: ReportDesign;
    client?: Client;
    user?: UserProfile;
    onProgress?: (progress: number) => void;
    translations?: PDFTranslations;
}

// PowerPoint 16:9 slide dimensions in mm (standard widescreen)
const SLIDE_WIDTH_MM = 338.67;  // ~13.33 inches
const SLIDE_HEIGHT_MM = 190.5;  // ~7.5 inches

// Default translations (French)
const DEFAULT_TRANSLATIONS: PDFTranslations = {
    title: 'Génération du PDF',
    preparing: 'Préparation...',
    creatingDocument: 'Création du document...',
    coverPage: 'Page de couverture...',
    slideProgress: 'Slide {{current}} / {{total}}...',
    finalizing: 'Finalisation...',
    saving: 'Enregistrement...',
    complete: 'Terminé !',
    pleaseWait: 'Veuillez patienter...',
    generatedOn: 'Généré le {{date}}',
};

/**
 * PDF Generation Service
 * Generates PDF with one page per slide using html2canvas + jsPDF directly
 */
class PDFGenerationService {
    private isGenerating = false;

    /**
     * Generate a PDF from a report element
     * Creates one page per slide for better rendering
     */
    async generateReportPDF(
        element: HTMLElement,
        options: PDFGenerationOptions
    ): Promise<void> {
        if (this.isGenerating) {
            throw new Error('PDF generation already in progress');
        }

        this.isGenerating = true;

        // Get translations with fallback to defaults
        const t = { ...DEFAULT_TRANSLATIONS, ...options.translations };

        // Create overlay to hide the capture process
        const overlay = this.createExportOverlay(t);
        document.body.appendChild(overlay);

        try {
            console.log('[PDF] Starting PDF generation...');
            console.log('[PDF] Options received:', {
                filename: options.filename,
                reportTitle: options.reportTitle,
                hasDesign: !!options.design,
                hasClient: !!options.client,
                hasUser: !!options.user
            });

            options.onProgress?.(5);
            this.updateOverlayProgress(overlay, 5, t.preparing);

            // Find all slide items in the element (Legacy: .slide-item, Tiptap: .slide-container)
            // We specifically look for .slide-container to respect the user's request for slide-by-slide export
            const slideElements = element.querySelectorAll('.slide-item, .slide-container');

            console.log('[PDF] Found items to render:', slideElements.length);

            if (slideElements.length === 0) {
                // Check if we have raw content to give a better error
                const hasTiptapContent = element.querySelector('.tiptap-editor-content');

                if (hasTiptapContent) {
                    console.warn('[PDF] Tiptap content found but no slides (.slide-container). Ensure the report uses Slide nodes.');
                }

                throw new Error('No slides found in the report');
            }

            options.onProgress?.(10);
            this.updateOverlayProgress(overlay, 10, t.creatingDocument);

            // Create PDF document with PowerPoint 16:9 dimensions
            console.log('[PDF] Creating jsPDF document...');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [SLIDE_WIDTH_MM, SLIDE_HEIGHT_MM],
            });
            console.log('[PDF] jsPDF document created, internal page size:', pdf.internal.pageSize.getWidth(), 'x', pdf.internal.pageSize.getHeight());

            // NOTE: Cover page and conclusion page are no longer added automatically.
            // Users can add them manually using /page-garde and /conclusion slash commands
            // in the TipTap editor, which creates editable slides.

            options.onProgress?.(15);
            this.updateOverlayProgress(overlay, 15, t.creatingDocument);

            // Calculate progress increment per slide
            const progressPerSlide = 75 / slideElements.length;

            // Process each slide
            for (let i = 0; i < slideElements.length; i++) {
                const slideElement = slideElements[i] as HTMLElement;

                const slideStatus = t.slideProgress
                    .replace('{{current}}', String(i + 1))
                    .replace('{{total}}', String(slideElements.length));
                this.updateOverlayProgress(overlay, 15 + i * progressPerSlide, slideStatus);

                // Add new page for each slide (except for the first one - use the initial page)
                if (i > 0) {
                    pdf.addPage();
                }

                // Render slide to canvas
                await this.renderSlideToPage(pdf, slideElement, options.design, i + 1);

                options.onProgress?.(15 + (i + 1) * progressPerSlide);
            }

            options.onProgress?.(85);
            this.updateOverlayProgress(overlay, 85, t.finalizing);

            // Add page numbers to all pages
            this.addPageNumbers(pdf);
            options.onProgress?.(95);
            this.updateOverlayProgress(overlay, 95, t.saving);

            // Save the PDF with a simple, safe filename
            const timestamp = new Date().toISOString().split('T')[0];
            const finalFilename = options.filename || 'Rapport_' + timestamp + '.pdf';
            console.log('[PDF] Final filename:', finalFilename);
            console.log('[PDF] PDF pages:', pdf.getNumberOfPages());

            // Use jsPDF's native save method which handles the download properly
            pdf.save(finalFilename);
            options.onProgress?.(100);
            this.updateOverlayProgress(overlay, 100, t.complete);

        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(
                error instanceof Error
                    ? `Failed to generate PDF: ${error.message}`
                    : 'Failed to generate PDF'
            );
        } finally {
            // Remove overlay with a small delay for "Terminé!" to show
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 500);
            this.isGenerating = false;
        }
    }

    /**
     * Create a beautiful overlay to hide the PDF export process
     */
    private createExportOverlay(t: PDFTranslations): HTMLElement {
        const overlay = document.createElement('div');
        overlay.id = 'pdf-export-overlay';
        overlay.innerHTML = `
            <div class="pdf-overlay-content">
                <div class="pdf-overlay-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 3h20"/>
                        <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/>
                        <path d="m7 21 5-5 5 5"/>
                    </svg>
                </div>
                <h3 class="pdf-overlay-title">${t.title}</h3>
                <p class="pdf-overlay-status">${t.preparing}</p>
                <div class="pdf-overlay-progress-container">
                    <div class="pdf-overlay-progress-bar"></div>
                </div>
                <p class="pdf-overlay-hint">${t.pleaseWait}</p>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #pdf-export-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                animation: fadeIn 0.3s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            .pdf-overlay-content {
                text-align: center;
                color: var(--color-text-primary);
                width: 400px;
                padding: 40px;
                background: var(--glass-bg);
                backdrop-filter: var(--glass-backdrop);
                -webkit-backdrop-filter: var(--glass-backdrop);
                border: 1px solid var(--glass-border);
                box-shadow: var(--glass-shadow);
                border-radius: var(--radius-2xl);
                animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .pdf-overlay-icon {
                margin-bottom: 24px;
                color: var(--color-primary);
                background: var(--color-primary-light);
                background: rgba(0, 102, 255, 0.1);
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: auto;
                margin-right: auto;
                border: 1px solid var(--color-primary-light);
                animation: pulse 2s ease-in-out infinite;
            }
            .pdf-overlay-icon svg {
                width: 40px;
                height: 40px;
            }
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(0, 102, 255, 0); }
            }
            .pdf-overlay-title {
                font-size: 24px;
                font-family: 'Inter', sans-serif;
                font-weight: 700;
                margin: 0 0 8px 0;
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .pdf-overlay-status {
                font-size: 16px;
                color: var(--color-text-secondary);
                margin: 0 0 32px 0;
                font-weight: 500;
            }
            .pdf-overlay-progress-container {
                width: 100%;
                height: 8px;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 16px;
                position: relative;
            }
            .pdf-overlay-progress-bar {
                height: 100%;
                width: 0%;
                background: var(--gradient-primary);
                border-radius: 4px;
                transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            .pdf-overlay-progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background: linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.3) 50%,
                    rgba(255, 255, 255, 0) 100%
                );
                transform: translateX(-100%);
                animation: shimmer 1.5s infinite;
            }
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
            .pdf-overlay-hint {
                font-size: 13px;
                color: var(--color-text-muted);
                margin: 0;
                font-style: italic;
            }
        `;
        overlay.appendChild(style);

        return overlay;
    }

    /**
     * Update the overlay progress display
     */
    private updateOverlayProgress(overlay: HTMLElement, progress: number, status: string): void {
        const progressBar = overlay.querySelector('.pdf-overlay-progress-bar') as HTMLElement;
        const statusEl = overlay.querySelector('.pdf-overlay-status') as HTMLElement;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    /**
     * Render a single slide to a PDF page (full page, no margins)
     */
    private async renderSlideToPage(
        pdf: jsPDF,
        slideElement: HTMLElement,
        design: ReportDesign,
        _slideNumber: number
    ): Promise<void> {
        // Create a wrapper with exact slide dimensions for proper capture
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 1280px;
            height: 720px;
            background-color: ${design.colorScheme.background};
            padding: 40px;
            box-sizing: border-box;
            z-index: 99999;
            overflow: hidden;
        `;

        // Apply theme variables
        wrapper.style.setProperty('--primary-color', design.colorScheme.primary);
        wrapper.style.setProperty('--secondary-color', design.colorScheme.secondary);
        wrapper.style.setProperty('--accent-color', design.colorScheme.accent);
        wrapper.style.setProperty('--widget-primary', design.colorScheme.primary);
        wrapper.style.setProperty('--widget-text', design.colorScheme.text);
        wrapper.style.setProperty('--widget-background', design.colorScheme.background);
        wrapper.style.fontFamily = design.typography.fontFamily;
        wrapper.style.color = design.colorScheme.text;

        // Clone the slide content
        const slideClone = slideElement.cloneNode(true) as HTMLElement;

        // Remove drag handles and action buttons from clone
        slideClone.querySelectorAll('.slide-handle, .slide-actions').forEach(el => el.remove());

        // Apply inline styles directly to elements to ensure html2canvas captures them correctly
        this.resetElementStylesForPDF(slideClone);

        // Inject minimal CSS to hide pseudo-elements (can't be done with JS)
        const pdfStyle = document.createElement('style');
        pdfStyle.id = 'pdf-export-style';
        pdfStyle.textContent = `
            .pdf-export-wrapper .metric-card::before {
                display: none !important;
                opacity: 0 !important;
                height: 0 !important;
            }
        `;
        document.head.appendChild(pdfStyle);
        wrapper.classList.add('pdf-export-wrapper');

        // Get the slide's custom background color if set (for cover/conclusion pages)
        const slideContainer = slideClone.classList.contains('slide-container')
            ? slideClone
            : slideClone.querySelector('.slide-container') as HTMLElement;
        const customBgColor = slideContainer?.style.backgroundColor || null;

        // If slide has a custom background (cover/conclusion), apply it to the wrapper
        if (customBgColor) {
            wrapper.style.backgroundColor = customBgColor;
            // Also update the text color for contrast
            const slideTextColor = slideContainer?.style.color;
            if (slideTextColor) {
                wrapper.style.color = slideTextColor;
            }
        }

        // Style the clone to fill the wrapper (keep background if customized)
        slideClone.style.cssText = `
            transform: none;
            opacity: 1;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            background: ${customBgColor || 'transparent'};
        `;

        // Find the slide-content inside and make it fill
        const slideContent = slideClone.querySelector('.slide-content') as HTMLElement;
        if (slideContent) {
            slideContent.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
            `;
        }

        wrapper.appendChild(slideClone);
        document.body.appendChild(wrapper);

        // Wait for any images and rendering
        await this.waitForRender(wrapper);

        try {
            // Log images in wrapper before capture
            const imagesInWrapper = wrapper.querySelectorAll('img');
            console.log(`[PDF] Images in wrapper before capture: ${imagesInWrapper.length}`);
            imagesInWrapper.forEach((img, i) => {
                console.log(`[PDF] Image ${i}: src=${img.src?.substring(0, 80)}..., complete=${img.complete}, naturalWidth=${img.naturalWidth}`);
            });

            // Capture with html2canvas at 16:9 ratio
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                useCORS: true,
                allowTaint: false, // Set to false to get errors instead of tainted canvas
                backgroundColor: design.colorScheme.background,
                logging: true, // Enable logging for debugging
                width: 1280,
                height: 720,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1280,
                windowHeight: 720,
                onclone: (clonedDoc) => {
                    // Fix lazy-loaded images
                    const clonedImages = clonedDoc.querySelectorAll('img');
                    clonedImages.forEach(img => {
                        img.loading = 'eager';
                        if (img.getAttribute('data-src')) {
                            img.src = img.getAttribute('data-src') || '';
                        }
                    });
                }
            });

            // Add canvas image to PDF - full page
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, SLIDE_WIDTH_MM, SLIDE_HEIGHT_MM);

        } finally {
            // Clean up
            document.body.removeChild(wrapper);
            // Remove injected style
            const pdfStyleEl = document.getElementById('pdf-export-style');
            if (pdfStyleEl) pdfStyleEl.remove();
        }
    }

    /**
     * Reset all element styles inline for proper PDF capture
     * html2canvas doesn't always respect CSS classes, so we apply styles directly
     */
    private resetElementStylesForPDF(element: HTMLElement): void {
        // Reset all elements - disable animations and transitions
        const allElements = element.querySelectorAll('*');
        allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Disable animations and transitions
            htmlEl.style.animation = 'none';
            htmlEl.style.transition = 'none';
            htmlEl.style.animationDelay = '0s';
            htmlEl.style.transitionDelay = '0s';
        });

        // Reset metric cards specifically (Performance Overview)
        const metricCards = element.querySelectorAll('.metric-card');
        metricCards.forEach((card) => {
            const htmlCard = card as HTMLElement;
            htmlCard.style.animation = 'none';
            htmlCard.style.transform = 'none';
            htmlCard.style.opacity = '1';
            htmlCard.style.boxShadow = 'none';
            htmlCard.style.border = '1px solid rgba(0, 0, 0, 0.06)';
            htmlCard.style.transition = 'none';

            // Remove the ::before pseudo-element effect by adding a style
            htmlCard.style.setProperty('--before-opacity', '0');
        });

        // Reset performance overview widget
        const widgets = element.querySelectorAll('.performance-overview-widget');
        widgets.forEach((widget) => {
            const htmlWidget = widget as HTMLElement;
            htmlWidget.style.transform = 'none';
            htmlWidget.style.transition = 'none';
        });

        // Reset ad creative cards
        const adCards = element.querySelectorAll('.ad-creative-card');
        adCards.forEach((card) => {
            const htmlCard = card as HTMLElement;
            htmlCard.style.transform = 'none';
            htmlCard.style.transition = 'none';
        });

        // Reset metric rows
        const metricRows = element.querySelectorAll('.metric-row');
        metricRows.forEach((row) => {
            const htmlRow = row as HTMLElement;
            htmlRow.style.transition = 'none';
        });

        // Ensure ad badges are properly styled
        const adBadges = element.querySelectorAll('.ad-badge');
        adBadges.forEach((badge) => {
            const htmlBadge = badge as HTMLElement;
            htmlBadge.style.display = 'inline-block';
            htmlBadge.style.position = 'relative';
            htmlBadge.style.transform = 'none';
        });

        // Ensure all content is visible
        const hiddenElements = element.querySelectorAll('[style*="opacity: 0"], [style*="visibility: hidden"]');
        hiddenElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.opacity = '1';
            htmlEl.style.visibility = 'visible';
        });

        // Ensure images are properly styled and visible for PDF capture
        const images = element.querySelectorAll('img');
        images.forEach((img) => {
            const htmlImg = img as HTMLImageElement;
            // Remove lazy loading
            htmlImg.loading = 'eager';
            // Ensure image is visible
            htmlImg.style.opacity = '1';
            htmlImg.style.visibility = 'visible';
            htmlImg.style.display = 'inline-block';
            // Remove transitions that could interfere
            htmlImg.style.transition = 'none';
            // Set crossOrigin for CORS
            htmlImg.crossOrigin = 'anonymous';
            // Ensure proper sizing
            if (!htmlImg.style.maxWidth) {
                htmlImg.style.maxWidth = '100%';
            }
            htmlImg.style.height = 'auto';
        });
    }

    /**
     * Convert an image URL to a base64 Data URL
     * This bypasses CORS issues with external images (e.g., Firebase Storage)
     */
    private async imageUrlToBase64(url: string): Promise<string | null> {
        try {
            // Skip if already a data URL
            if (url.startsWith('data:')) {
                return url;
            }

            console.log(`[PDF] Converting image to base64: ${url.substring(0, 100)}...`);

            // Try fetch first (works for Firebase Storage with proper CORS)
            try {
                const response = await fetch(url, {
                    mode: 'cors',
                    credentials: 'omit' // Firebase Storage doesn't need credentials
                });

                if (response.ok) {
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            console.log(`[PDF] Successfully converted image via fetch`);
                            resolve(reader.result as string);
                        };
                        reader.onerror = () => {
                            console.warn(`[PDF] FileReader failed for: ${url}`);
                            resolve(null);
                        };
                        reader.readAsDataURL(blob);
                    });
                }
            } catch (fetchError) {
                console.warn(`[PDF] Fetch failed, trying Image approach: ${fetchError}`);
            }

            // Fallback: use Image element with crossOrigin
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            const dataUrl = canvas.toDataURL('image/png');
                            console.log(`[PDF] Successfully converted image via canvas`);
                            resolve(dataUrl);
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        console.warn(`[PDF] Canvas conversion failed (CORS?): ${e}`);
                        resolve(null);
                    }
                };

                img.onerror = () => {
                    console.warn(`[PDF] Image load failed: ${url}`);
                    resolve(null);
                };

                img.src = url;
            });
        } catch (error) {
            console.warn(`[PDF] Error converting image to base64: ${url}`, error);
            return null;
        }
    }

    /**
     * Wait for images and rendering to complete
     * Also converts external images to base64 to avoid CORS issues with html2canvas
     */
    private async waitForRender(element: HTMLElement): Promise<void> {
        // Find all images in the element
        const images = Array.from(element.querySelectorAll('img'));
        console.log(`[PDF] Found ${images.length} images to process`);

        // First, set crossOrigin on all images (needed before they load)
        images.forEach(img => {
            if (img.src && !img.src.startsWith('data:')) {
                img.crossOrigin = 'anonymous';
            }
        });

        // Convert all images to base64 data URLs to avoid CORS issues
        let convertedCount = 0;
        let failedCount = 0;

        await Promise.all(
            images.map(async (img) => {
                const originalSrc = img.src;

                // Skip if no src or already a data URL
                if (!originalSrc || originalSrc.startsWith('data:')) {
                    return;
                }

                try {
                    // Convert to base64
                    const base64 = await this.imageUrlToBase64(originalSrc);
                    if (base64) {
                        img.src = base64;
                        convertedCount++;
                    } else {
                        failedCount++;
                        // Hide image if conversion failed to avoid broken image
                        img.style.display = 'none';
                    }
                } catch (error) {
                    console.warn(`[PDF] Could not convert image: ${originalSrc}`, error);
                    failedCount++;
                    img.style.display = 'none';
                }
            })
        );

        console.log(`[PDF] Images converted: ${convertedCount}, failed: ${failedCount}`);

        // Wait for all images to be fully loaded (with their new base64 sources)
        await Promise.all(
            images.map(img =>
                new Promise<void>(resolve => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    }
                })
            )
        );

        // Also handle background images in CSS
        const elementsWithBgImage = Array.from(element.querySelectorAll('*'));
        let bgConverted = 0;

        await Promise.all(
            elementsWithBgImage.map(async (el) => {
                const htmlEl = el as HTMLElement;
                const computedStyle = window.getComputedStyle(htmlEl);
                const bgImage = computedStyle.backgroundImage;

                if (bgImage && bgImage !== 'none' && bgImage.startsWith('url("http')) {
                    // Extract URL from url("...")
                    const urlMatch = bgImage.match(/url\("([^"]+)"\)/);
                    if (urlMatch && urlMatch[1]) {
                        const originalUrl = urlMatch[1];
                        const base64 = await this.imageUrlToBase64(originalUrl);
                        if (base64) {
                            htmlEl.style.backgroundImage = `url("${base64}")`;
                            bgConverted++;
                        }
                    }
                }
            })
        );

        if (bgConverted > 0) {
            console.log(`[PDF] Background images converted: ${bgConverted}`);
        }

        // Wait for fonts and rendering
        await document.fonts.ready;

        // Longer delay to ensure images are fully rendered
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    /**
     * Add page numbers to all pages (bottom right, subtle)
     */
    private addPageNumbers(pdf: jsPDF): void {
        const totalPages = pdf.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                `${i} / ${totalPages}`,
                SLIDE_WIDTH_MM - 15,
                SLIDE_HEIGHT_MM - 8,
                { align: 'right' }
            );
        }
    }

    /**
     * Check if PDF generation is in progress
     */
    isGeneratingPDF(): boolean {
        return this.isGenerating;
    }
}

// Export singleton instance
export const pdfGenerationService = new PDFGenerationService();
export default pdfGenerationService;
