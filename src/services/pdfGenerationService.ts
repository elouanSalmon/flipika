import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ReportDesign } from '../types/reportTypes';

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
            options.onProgress?.(5);
            this.updateOverlayProgress(overlay, 5, t.preparing);

            // Find all slide items in the element
            const slideElements = element.querySelectorAll('.slide-item');

            if (slideElements.length === 0) {
                throw new Error('No slides found in the report');
            }

            options.onProgress?.(10);
            this.updateOverlayProgress(overlay, 10, t.creatingDocument);

            // Create PDF document with PowerPoint 16:9 dimensions
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [SLIDE_WIDTH_MM, SLIDE_HEIGHT_MM],
            });

            // Add cover page
            await this.addCoverPage(pdf, options, t);
            options.onProgress?.(20);
            this.updateOverlayProgress(overlay, 20, t.coverPage);

            // Calculate progress increment per slide
            const progressPerSlide = 60 / slideElements.length;

            // Process each slide
            for (let i = 0; i < slideElements.length; i++) {
                const slideElement = slideElements[i] as HTMLElement;

                const slideStatus = t.slideProgress
                    .replace('{{current}}', String(i + 1))
                    .replace('{{total}}', String(slideElements.length));
                this.updateOverlayProgress(overlay, 20 + i * progressPerSlide, slideStatus);

                // Add new page for each slide
                pdf.addPage();

                // Render slide to canvas
                await this.renderSlideToPage(pdf, slideElement, options.design, i + 1);

                options.onProgress?.(20 + (i + 1) * progressPerSlide);
            }

            options.onProgress?.(85);
            this.updateOverlayProgress(overlay, 85, t.finalizing);

            // Add page numbers to all pages
            this.addPageNumbers(pdf);
            options.onProgress?.(95);
            this.updateOverlayProgress(overlay, 95, t.saving);

            // Save the PDF
            pdf.save(options.filename);
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
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
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
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                animation: fadeIn 0.2s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .pdf-overlay-content {
                text-align: center;
                color: white;
                max-width: 400px;
                padding: 40px;
            }
            .pdf-overlay-icon {
                margin-bottom: 24px;
                color: #3b82f6;
                animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.05); }
            }
            .pdf-overlay-title {
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 8px 0;
            }
            .pdf-overlay-status {
                font-size: 16px;
                color: #94a3b8;
                margin: 0 0 24px 0;
            }
            .pdf-overlay-progress-container {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 16px;
            }
            .pdf-overlay-progress-bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                border-radius: 3px;
                transition: width 0.3s ease-out;
            }
            .pdf-overlay-hint {
                font-size: 13px;
                color: #64748b;
                margin: 0;
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
     * Add cover page with title and date range (full slide background)
     */
    private async addCoverPage(pdf: jsPDF, options: PDFGenerationOptions, t: PDFTranslations): Promise<void> {
        const { design, reportTitle, startDate, endDate } = options;

        // Full page background with primary color
        const primaryColor = this.hexToRgb(design.colorScheme.primary);
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.rect(0, 0, SLIDE_WIDTH_MM, SLIDE_HEIGHT_MM, 'F');

        // Title - centered vertically and horizontally
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(42);
        pdf.setFont('helvetica', 'bold');

        // Word wrap for long titles
        const titleLines = pdf.splitTextToSize(reportTitle, SLIDE_WIDTH_MM - 60);
        const titleY = startDate && endDate ? SLIDE_HEIGHT_MM / 2 - 15 : SLIDE_HEIGHT_MM / 2;
        pdf.text(titleLines, SLIDE_WIDTH_MM / 2, titleY, { align: 'center' });

        // Date range
        if (startDate && endDate) {
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'normal');
            const dateText = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
            pdf.text(dateText, SLIDE_WIDTH_MM / 2, SLIDE_HEIGHT_MM / 2 + 20, { align: 'center' });
        }

        // Logo if available (top left corner)
        if (design.logo?.url) {
            try {
                const logoSize = design.logo.size === 'small' ? 20 : design.logo.size === 'large' ? 40 : 30;
                await this.addImageToPdf(pdf, design.logo.url, 20, 15, logoSize, logoSize);
            } catch (e) {
                console.warn('Could not add logo to PDF:', e);
            }
        }

        // Generation info (bottom right)
        pdf.setTextColor(255, 255, 255, 0.7);
        pdf.setFontSize(10);
        const generatedText = t.generatedOn.replace('{{date}}', this.formatDate(new Date()));
        pdf.text(generatedText, SLIDE_WIDTH_MM - 20, SLIDE_HEIGHT_MM - 15, { align: 'right' });
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

        // Style the clone to fill the wrapper
        slideClone.style.cssText = `
            transform: none;
            opacity: 1;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            background: transparent;
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
            // Capture with html2canvas at 16:9 ratio
            const canvas = await html2canvas(wrapper, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: design.colorScheme.background,
                logging: false,
                width: 1280,
                height: 720,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1280,
                windowHeight: 720,
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
    }

    /**
     * Wait for images and rendering to complete
     */
    private async waitForRender(element: HTMLElement): Promise<void> {
        // Wait for images
        const images = Array.from(element.querySelectorAll('img'));
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

        // Wait for fonts and rendering
        await document.fonts.ready;

        // Small delay for DOM to settle (animations are disabled)
        await new Promise(resolve => setTimeout(resolve, 50));
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
     * Add an image to PDF from URL
     */
    private async addImageToPdf(
        pdf: jsPDF,
        url: string,
        x: number,
        y: number,
        width: number,
        height: number
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        const dataUrl = canvas.toDataURL('image/png');
                        pdf.addImage(dataUrl, 'PNG', x, y, width, height);
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    /**
     * Format date for display
     */
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    }

    /**
     * Convert hex color to RGB
     */
    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : { r: 59, g: 130, b: 246 }; // Default blue
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
