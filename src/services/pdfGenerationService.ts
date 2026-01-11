import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ReportDesign } from '../types/reportTypes';

interface PDFGenerationOptions {
    filename: string;
    reportTitle: string;
    startDate?: Date;
    endDate?: Date;
    design: ReportDesign;
    onProgress?: (progress: number) => void;
}

// PowerPoint 16:9 slide dimensions in mm (standard widescreen)
const SLIDE_WIDTH_MM = 338.67;  // ~13.33 inches
const SLIDE_HEIGHT_MM = 190.5;  // ~7.5 inches
const MARGIN_MM = 10;

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

        try {
            options.onProgress?.(5);

            // Find all slide items in the element
            const slideElements = element.querySelectorAll('.slide-item');

            if (slideElements.length === 0) {
                throw new Error('No slides found in the report');
            }

            options.onProgress?.(10);

            // Create PDF document with PowerPoint 16:9 dimensions
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [SLIDE_WIDTH_MM, SLIDE_HEIGHT_MM],
            });

            // Add cover page
            await this.addCoverPage(pdf, options);
            options.onProgress?.(20);

            // Calculate progress increment per slide
            const progressPerSlide = 60 / slideElements.length;

            // Process each slide
            for (let i = 0; i < slideElements.length; i++) {
                const slideElement = slideElements[i] as HTMLElement;

                // Add new page for each slide
                pdf.addPage();

                // Render slide to canvas
                await this.renderSlideToPage(pdf, slideElement, options.design, i + 1);

                options.onProgress?.(20 + (i + 1) * progressPerSlide);
            }

            options.onProgress?.(85);

            // Add page numbers to all pages
            this.addPageNumbers(pdf);
            options.onProgress?.(95);

            // Save the PDF
            pdf.save(options.filename);
            options.onProgress?.(100);

        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(
                error instanceof Error
                    ? `Failed to generate PDF: ${error.message}`
                    : 'Failed to generate PDF'
            );
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Add cover page with title and date range (full slide background)
     */
    private async addCoverPage(pdf: jsPDF, options: PDFGenerationOptions): Promise<void> {
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
        pdf.text(`Généré le ${this.formatDate(new Date())}`, SLIDE_WIDTH_MM - 20, SLIDE_HEIGHT_MM - 15, { align: 'right' });
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

        // Disable ALL animations, transitions, and hover states for PDF capture
        const disableAnimationsStyle = document.createElement('style');
        disableAnimationsStyle.id = 'pdf-disable-animations';
        disableAnimationsStyle.textContent = `
            /* Global animation/transition reset */
            .pdf-export-wrapper *,
            .pdf-export-wrapper *::before,
            .pdf-export-wrapper *::after {
                animation: none !important;
                animation-delay: 0s !important;
                animation-duration: 0s !important;
                animation-fill-mode: none !important;
                transition: none !important;
                transition-delay: 0s !important;
                transition-duration: 0s !important;
            }

            /* Force all elements to be fully visible and positioned */
            .pdf-export-wrapper * {
                opacity: 1 !important;
                visibility: visible !important;
            }

            /* Performance Overview Widget */
            .pdf-export-wrapper .performance-overview-widget,
            .pdf-export-wrapper .performance-overview-widget:hover {
                transform: none !important;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06) !important;
            }

            /* Metric Cards - reset animation state and hover */
            .pdf-export-wrapper .metric-card,
            .pdf-export-wrapper .metric-card:hover {
                animation: none !important;
                transform: none !important;
                opacity: 1 !important;
                box-shadow: none !important;
                border: 1px solid rgba(0, 0, 0, 0.06) !important;
            }
            .pdf-export-wrapper .metric-card::before,
            .pdf-export-wrapper .metric-card:hover::before {
                opacity: 0 !important;
            }

            /* Ad Creative Cards */
            .pdf-export-wrapper .ad-creative-card,
            .pdf-export-wrapper .ad-creative-card:hover {
                transform: none !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }
            .pdf-export-wrapper .metric-row,
            .pdf-export-wrapper .metric-row:hover {
                background: rgba(0, 0, 0, 0.02) !important;
            }
            .pdf-export-wrapper .ad-headline,
            .pdf-export-wrapper .ad-headline:hover {
                text-decoration: none !important;
            }

            /* Ad Badge - ensure proper display */
            .pdf-export-wrapper .ad-badge {
                display: inline-block !important;
                position: relative !important;
                transform: none !important;
                background: rgba(0, 0, 0, 0.8) !important;
                color: #ffffff !important;
                padding: 2px 6px !important;
                border-radius: 2px !important;
            }

            /* Ensure proper overflow */
            .pdf-export-wrapper .metrics-grid {
                overflow: visible !important;
            }
            .pdf-export-wrapper .widget-content,
            .pdf-export-wrapper .slide-content {
                overflow: visible !important;
            }
        `;
        document.head.appendChild(disableAnimationsStyle);
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
            // Remove the animation-disabling style
            const styleEl = document.getElementById('pdf-disable-animations');
            if (styleEl) {
                styleEl.remove();
            }
        }
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
