import html2pdf from 'html2pdf.js';
import type { ReportDesign } from '../types/reportTypes';

interface PDFGenerationOptions {
    filename: string;
    reportTitle: string;
    startDate?: Date;
    endDate?: Date;
    design: ReportDesign;
    onProgress?: (progress: number) => void;
}

interface PDFConfig {
    margin: number;
    filename: string;
    image: { type: 'jpeg' | 'png' | 'webp'; quality: number };
    html2canvas: {
        scale: number;
        useCORS: boolean;
        logging: boolean;
        letterRendering: boolean;
    };
    jsPDF: {
        unit: string;
        format: string;
        orientation: 'portrait' | 'landscape';
        compress: boolean;
    };
}

/**
 * PDF Generation Service
 * Handles client-side PDF generation from HTML elements using html2pdf.js
 */
class PDFGenerationService {
    private isGenerating = false;

    /**
     * Generate a PDF from a report element
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
            // Report progress
            options.onProgress?.(10);

            // Prepare the element for PDF rendering
            const preparedElement = await this.preparePDFElement(element, options);
            options.onProgress?.(20);

            // Configure html2pdf
            const config = this.createPDFConfig(options);
            options.onProgress?.(30);

            // Generate PDF
            const worker = html2pdf().set(config).from(preparedElement);

            await worker.toPdf().get('pdf').then((pdf: any) => {
                options.onProgress?.(80);

                // Add page numbers
                const totalPages = pdf.internal.getNumberOfPages();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(9);
                    pdf.setTextColor(150);
                    pdf.text(
                        `Page ${i} of ${totalPages}`,
                        pageWidth / 2,
                        pageHeight - 10,
                        { align: 'center' }
                    );
                }

                options.onProgress?.(90);
            });

            await worker.save();
            options.onProgress?.(100);

            // Cleanup
            this.cleanupAfterGeneration(preparedElement);
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
     * Create PDF configuration
     */
    private createPDFConfig(options: PDFGenerationOptions): PDFConfig {
        return {
            margin: 15,
            filename: options.filename,
            image: {
                type: 'jpeg',
                quality: 0.95
            },
            html2canvas: {
                scale: 2, // Higher quality
                useCORS: true, // Allow cross-origin images
                logging: false,
                letterRendering: true, // Better text rendering
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true, // Reduce file size
            },
        };
    }

    /**
     * Prepare element for PDF rendering
     * Clones the element and applies PDF-specific styles
     */
    private async preparePDFElement(
        element: HTMLElement,
        options: PDFGenerationOptions
    ): Promise<HTMLElement> {
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true) as HTMLElement;

        // Create a container for PDF rendering
        const container = document.createElement('div');
        container.className = 'pdf-container';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '210mm'; // A4 width
        container.style.backgroundColor = 'white';
        container.style.padding = '20mm';

        // Apply theme colors
        this.applyThemeToPDF(container, options.design);

        // Add header
        const header = this.createPDFHeader(options);
        container.appendChild(header);

        // Add content
        container.appendChild(clone);

        // Add footer
        const footer = this.createPDFFooter();
        container.appendChild(footer);

        // Append to body temporarily
        document.body.appendChild(container);

        // Wait for images to load
        await this.waitForImages(container);

        return container;
    }

    /**
     * Create PDF header with logo and title
     */
    private createPDFHeader(options: PDFGenerationOptions): HTMLElement {
        const header = document.createElement('div');
        header.className = 'pdf-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--primary-color, #3b82f6);
        `;

        // Logo section
        if (options.design.logo?.url) {
            const logoContainer = document.createElement('div');
            logoContainer.className = 'pdf-logo';

            const logo = document.createElement('img');
            logo.src = options.design.logo.url;
            logo.alt = 'Logo';

            const logoSize = options.design.logo.size === 'small' ? '40px'
                : options.design.logo.size === 'large' ? '80px'
                    : '60px';

            logo.style.cssText = `
                height: ${logoSize};
                width: auto;
                object-fit: contain;
            `;

            logoContainer.appendChild(logo);
            header.appendChild(logoContainer);
        }

        // Title and date section
        const titleContainer = document.createElement('div');
        titleContainer.className = 'pdf-title-section';
        titleContainer.style.cssText = `
            flex: 1;
            text-align: ${options.design.logo ? 'right' : 'left'};
            margin-left: ${options.design.logo ? '20px' : '0'};
        `;

        const title = document.createElement('h1');
        title.textContent = options.reportTitle;
        title.style.cssText = `
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: var(--text-color, #1f2937);
            font-family: ${options.design.typography.headingFontFamily || options.design.typography.fontFamily};
        `;
        titleContainer.appendChild(title);

        if (options.startDate && options.endDate) {
            const dateRange = document.createElement('p');
            dateRange.textContent = `${this.formatDate(options.startDate)} - ${this.formatDate(options.endDate)}`;
            dateRange.style.cssText = `
                margin: 8px 0 0 0;
                font-size: 14px;
                color: #6b7280;
            `;
            titleContainer.appendChild(dateRange);
        }

        header.appendChild(titleContainer);

        return header;
    }

    /**
     * Create PDF footer with generation date
     */
    private createPDFFooter(): HTMLElement {
        const footer = document.createElement('div');
        footer.className = 'pdf-footer';
        footer.style.cssText = `
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        `;

        const generatedText = document.createElement('p');
        generatedText.textContent = `Generated on ${this.formatDate(new Date())}`;
        generatedText.style.margin = '0';

        footer.appendChild(generatedText);

        return footer;
    }

    /**
     * Apply theme colors to PDF container
     */
    private applyThemeToPDF(container: HTMLElement, design: ReportDesign): void {
        container.style.setProperty('--primary-color', design.colorScheme.primary);
        container.style.setProperty('--secondary-color', design.colorScheme.secondary);
        container.style.setProperty('--accent-color', design.colorScheme.accent);
        container.style.setProperty('--background-color', design.colorScheme.background);
        container.style.setProperty('--text-color', design.colorScheme.text);
        container.style.fontFamily = design.typography.fontFamily;
        container.style.fontSize = `${design.typography.fontSize}px`;
        container.style.lineHeight = `${design.typography.lineHeight}`;
    }

    /**
     * Wait for all images in the container to load
     */
    private async waitForImages(container: HTMLElement): Promise<void> {
        const images = Array.from(container.querySelectorAll('img'));

        if (images.length === 0) {
            return;
        }

        const imagePromises = images.map((img) => {
            return new Promise<void>((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continue even if image fails
                }
            });
        });

        await Promise.all(imagePromises);
    }

    /**
     * Cleanup after PDF generation
     */
    private cleanupAfterGeneration(element: HTMLElement): void {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
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
     * Check if PDF generation is in progress
     */
    isGeneratingPDF(): boolean {
        return this.isGenerating;
    }
}

// Export singleton instance
export const pdfGenerationService = new PDFGenerationService();
export default pdfGenerationService;
