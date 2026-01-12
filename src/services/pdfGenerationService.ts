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

/**
 * Sanitize text for PDF - replace accented characters with ASCII equivalents
 * jsPDF's default Helvetica font doesn't support French accents properly
 */
function sanitizeTextForPDF(text: string): string {
    if (!text) return '';

    const accentMap: Record<string, string> = {
        'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a', 'ã': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'î': 'i', 'ï': 'i', 'í': 'i',
        'ò': 'o', 'ô': 'o', 'ö': 'o', 'ó': 'o', 'õ': 'o',
        'ù': 'u', 'û': 'u', 'ü': 'u', 'ú': 'u',
        'ÿ': 'y', 'ý': 'y',
        'ñ': 'n',
        'ç': 'c',
        'œ': 'oe', 'æ': 'ae',
        'À': 'A', 'Â': 'A', 'Ä': 'A', 'Á': 'A', 'Ã': 'A',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'Ì': 'I', 'Î': 'I', 'Ï': 'I', 'Í': 'I',
        'Ò': 'O', 'Ô': 'O', 'Ö': 'O', 'Ó': 'O', 'Õ': 'O',
        'Ù': 'U', 'Û': 'U', 'Ü': 'U', 'Ú': 'U',
        'Ÿ': 'Y', 'Ý': 'Y',
        'Ñ': 'N',
        'Ç': 'C',
        'Œ': 'OE', 'Æ': 'AE',
    };

    return text
        .split('')
        .map(char => accentMap[char] || char)
        .join('')
        .replace(/[^\x00-\x7F]/g, ''); // Remove any remaining non-ASCII characters
}

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

            // Find all slide items in the element
            const slideElements = element.querySelectorAll('.slide-item');
            console.log('[PDF] Found slides:', slideElements.length);

            if (slideElements.length === 0) {
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

            // Add cover page
            console.log('[PDF] Adding cover page...');
            await this.addCoverPage(pdf, options);
            console.log('[PDF] Cover page added');
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

            // ADD CONCLUSION PAGE
            pdf.addPage();
            await this.addConclusionPage(pdf, options);

            options.onProgress?.(85);
            this.updateOverlayProgress(overlay, 85, t.finalizing);

            // Add page numbers to all pages
            this.addPageNumbers(pdf);
            options.onProgress?.(95);
            this.updateOverlayProgress(overlay, 95, t.saving);

            // Save the PDF with a simple, safe filename
            const timestamp = new Date().toISOString().split('T')[0];
            const safeName = 'Rapport_' + timestamp + '.pdf';

            console.log('[PDF] Final filename:', safeName);
            console.log('[PDF] PDF pages:', pdf.getNumberOfPages());

            // Use jsPDF's native save method which handles the download properly
            pdf.save(safeName);
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
     * Add cover page with title, date range, client info, and user info
     */
    private async addCoverPage(pdf: jsPDF, options: PDFGenerationOptions): Promise<void> {
        const { design, reportTitle, startDate, endDate, client, user } = options;

        // Full page background with primary color
        const primaryColor = this.hexToRgb(design.colorScheme.primary);
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.rect(0, 0, SLIDE_WIDTH_MM, SLIDE_HEIGHT_MM, 'F');

        // Text Color
        pdf.setTextColor(255, 255, 255);

        // Logo if available (top left corner)
        if (client?.logoUrl || design.logo?.url) {
            try {
                // Prefer client logo if available, or design logo
                const logoUrl = client?.logoUrl || design.logo?.url;
                if (logoUrl) {
                    const logoSize = design.logo?.size === 'small' ? 20 : design.logo?.size === 'large' ? 40 : 30;
                    await this.addImageToPdf(pdf, logoUrl, 20, 15, logoSize, logoSize);
                }
            } catch (e) {
                console.warn('Could not add logo to PDF:', e);
            }
        }

        // Title - centered vertically (adjusted if dates/client info present)
        let contentY = SLIDE_HEIGHT_MM / 2 - 20;

        pdf.setFontSize(42);
        pdf.setFont('helvetica', 'bold');

        // Word wrap for long titles - sanitize text for PDF compatibility
        const safeTitle = sanitizeTextForPDF(reportTitle);
        const titleLines = pdf.splitTextToSize(safeTitle, SLIDE_WIDTH_MM - 60);
        pdf.text(titleLines, SLIDE_WIDTH_MM / 2, contentY, { align: 'center' });

        // Date range
        if (startDate && endDate) {
            contentY += 25;
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'normal');
            const dateText = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
            pdf.text(dateText, SLIDE_WIDTH_MM / 2, contentY, { align: 'center' });
        }

        // Client & User Info at the bottom
        const bottomY = SLIDE_HEIGHT_MM - 20;

        // "Prepared for [Client]" (Left bottom)
        if (client?.name) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Prepare pour :', 20, bottomY - 6);
            pdf.setFont('helvetica', 'normal');
            pdf.text(sanitizeTextForPDF(client.name), 20, bottomY);
        }

        // "Prepared by [User]" (Right bottom)
        if (user) {
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || '';
            const company = user.company || '';

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Prepare par :', SLIDE_WIDTH_MM - 20, bottomY - 6, { align: 'right' });

            pdf.setFont('helvetica', 'normal');
            let userText = sanitizeTextForPDF(userName);
            if (company) userText += ` - ${sanitizeTextForPDF(company)}`;
            pdf.text(userText, SLIDE_WIDTH_MM - 20, bottomY, { align: 'right' });
        }
    }

    /**
     * Add conclusion page with contact info
     */
    private async addConclusionPage(pdf: jsPDF, options: PDFGenerationOptions): Promise<void> {
        const { design, user } = options;

        // Full page background with primary color
        const primaryColor = this.hexToRgb(design.colorScheme.primary);
        pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        pdf.rect(0, 0, SLIDE_WIDTH_MM, SLIDE_HEIGHT_MM, 'F');

        // Text Color
        pdf.setTextColor(255, 255, 255);

        // Center Content
        const centerX = SLIDE_WIDTH_MM / 2;
        const centerY = SLIDE_HEIGHT_MM / 2;

        // "Merci de votre lecture !"
        pdf.setFontSize(36);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Merci de votre lecture !', centerX, centerY - 10, { align: 'center' });

        // Contact Info
        if (user) {
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'normal');

            const contactText = "Pour toute question, n'hesitez pas a nous contacter :";
            pdf.text(contactText, centerX, centerY + 20, { align: 'center' });

            const email = user.email || '';
            if (email) {
                pdf.setFontSize(18);
                pdf.setFont('helvetica', 'bold');
                pdf.text(sanitizeTextForPDF(email), centerX, centerY + 35, { align: 'center' });
            }
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
