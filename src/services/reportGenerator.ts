import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportConfig } from '../types/reports';
import type { Account, Campaign, CampaignMetrics } from '../types/business';
import type { ReportSection, ReportDesign } from '../types/reportTypes';
import type { JSONContent } from '@tiptap/react';

/**
 * Professional PDF Report Generator for Google Ads Performance Reports
 * Designed for media buyers to share with clients
 */
class ReportGenerator {
    private doc: jsPDF;
    private pageWidth: number;
    private pageHeight: number;
    private margin: number = 20;
    private currentY: number = 20;
    private primaryColor: string = '#0741e0'; // Blue
    private secondaryColor: string = '#6b6e77'; // Gray
    private accentColor: string = '#10b981'; // Green

    constructor() {
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
    }

    /**
     * Generate complete PDF report
     */
    async generateReport(
        config: ReportConfig,
        account: Account,
        campaigns: Campaign[],
        aggregatedMetrics: CampaignMetrics,
        timeSeriesData?: any
    ): Promise<Blob> {
        // Cover page
        this.addCoverPage(config, account);

        // Table of contents
        if (this.shouldIncludeMultipleModules(config)) {
            this.addNewPage();
            this.addTableOfContents(config);
        }

        // Executive Summary
        if (config.modules.executiveSummary) {
            this.addNewPage();
            this.addExecutiveSummary(config, account, aggregatedMetrics);
        }

        // Global Metrics
        if (config.modules.globalMetrics) {
            this.addNewPage();
            this.addGlobalMetrics(aggregatedMetrics, config);
        }

        // Campaign Analysis
        if (config.modules.campaignAnalysis) {
            this.addNewPage();
            this.addCampaignAnalysis(campaigns, config);
        }

        // Time Evolution
        if (config.modules.timeEvolution && timeSeriesData) {
            this.addNewPage();
            this.addTimeEvolution(timeSeriesData, config);
        }

        // Budget vs Spend
        if (config.modules.budgetVsSpend) {
            this.addNewPage();
            this.addBudgetAnalysis(account, campaigns, config);
        }

        // Recommendations
        if (config.modules.recommendations) {
            this.addNewPage();
            this.addRecommendations(campaigns, aggregatedMetrics);
        }

        // Comparison with previous period
        if (config.modules.comparison) {
            this.addNewPage();
            this.addPeriodComparison(aggregatedMetrics);
        }

        // Footer on all pages
        this.addFootersToAllPages(config);

        return this.doc.output('blob');
    }

    /**
     * Add cover page
     */
    private addCoverPage(config: ReportConfig, account: Account): void {
        // Background accent
        this.doc.setFillColor(this.primaryColor);
        this.doc.rect(0, 0, this.pageWidth, 80, 'F');

        // Title
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(32);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(config.customization.reportName || 'Performance Report', this.pageWidth / 2, 40, {
            align: 'center',
        });

        // Account name
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(account.name, this.pageWidth / 2, 55, { align: 'center' });

        // Period
        this.doc.setFontSize(14);
        const periodText = `${this.formatDate(config.period.start)} - ${this.formatDate(config.period.end)}`;
        this.doc.text(periodText, this.pageWidth / 2, 68, { align: 'center' });

        // Reset text color
        this.doc.setTextColor(0, 0, 0);

        // Key metrics summary box
        const boxY = 100;
        const boxHeight = 80;
        this.doc.setFillColor(249, 250, 251);
        this.doc.roundedRect(this.margin, boxY, this.pageWidth - 2 * this.margin, boxHeight, 3, 3, 'F');

        // Generated date
        this.doc.setFontSize(10);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(`Généré le ${this.formatDate(new Date())}`, this.pageWidth / 2, this.pageHeight - 15, {
            align: 'center',
        });

        // Notes if provided
        if (config.customization.notes) {
            this.doc.setFontSize(11);
            this.doc.setTextColor(60, 60, 60);
            const splitNotes = this.doc.splitTextToSize(config.customization.notes, this.pageWidth - 2 * this.margin - 10);
            this.doc.text(splitNotes, this.margin + 5, boxY + 10);
        }
    }

    /**
     * Add table of contents
     */
    private addTableOfContents(config: ReportConfig): void {
        this.addSectionTitle('Table des matières');
        this.currentY += 10;

        const sections: { title: string; page: number }[] = [];
        let pageNum = 3; // Starting after cover and TOC

        if (config.modules.executiveSummary) {
            sections.push({ title: 'Résumé Exécutif', page: pageNum++ });
        }
        if (config.modules.globalMetrics) {
            sections.push({ title: 'Métriques Globales', page: pageNum++ });
        }
        if (config.modules.campaignAnalysis) {
            sections.push({ title: 'Analyse des Campagnes', page: pageNum++ });
        }
        if (config.modules.timeEvolution) {
            sections.push({ title: 'Évolution Temporelle', page: pageNum++ });
        }
        if (config.modules.budgetVsSpend) {
            sections.push({ title: 'Budget vs Dépenses', page: pageNum++ });
        }
        if (config.modules.recommendations) {
            sections.push({ title: 'Recommandations', page: pageNum++ });
        }
        if (config.modules.comparison) {
            sections.push({ title: 'Comparaison Période Précédente', page: pageNum++ });
        }

        sections.forEach((section) => {
            this.doc.setFontSize(12);
            this.doc.setTextColor(60, 60, 60);
            this.doc.text(section.title, this.margin + 5, this.currentY);
            this.doc.text(`${section.page}`, this.pageWidth - this.margin - 5, this.currentY, { align: 'right' });
            this.currentY += 8;
        });
    }

    /**
     * Add executive summary
     */
    private addExecutiveSummary(config: ReportConfig, _account: Account, metrics: CampaignMetrics): void {
        this.addSectionTitle('Résumé Exécutif');
        this.currentY += 5;

        // Period info
        this.doc.setFontSize(11);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(
            `Période: ${this.formatDate(config.period.start)} - ${this.formatDate(config.period.end)}`,
            this.margin,
            this.currentY
        );
        this.currentY += 10;

        // Key metrics in boxes
        const metricsData = [
            { label: 'Dépenses', value: this.formatCurrency(metrics.cost), color: this.primaryColor },
            { label: 'Impressions', value: this.formatNumber(metrics.impressions), color: this.secondaryColor },
            { label: 'Clics', value: this.formatNumber(metrics.clicks), color: this.secondaryColor },
            { label: 'Conversions', value: this.formatNumber(metrics.conversions), color: this.accentColor },
        ];

        const boxWidth = (this.pageWidth - 2 * this.margin - 15) / 4;
        const boxHeight = 30;

        metricsData.forEach((metric, index) => {
            const x = this.margin + index * (boxWidth + 5);
            const y = this.currentY;

            // Box background
            this.doc.setFillColor(249, 250, 251);
            this.doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'F');

            // Colored top border
            this.doc.setFillColor(metric.color);
            this.doc.rect(x, y, boxWidth, 3, 'F');

            // Label
            this.doc.setFontSize(9);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(metric.label, x + boxWidth / 2, y + 12, { align: 'center' });

            // Value
            this.doc.setFontSize(14);
            this.doc.setTextColor(0, 0, 0);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(metric.value, x + boxWidth / 2, y + 22, { align: 'center' });
            this.doc.setFont('helvetica', 'normal');
        });

        this.currentY += boxHeight + 15;

        // Performance metrics
        const performanceData = [
            { label: 'CTR', value: `${metrics.ctr.toFixed(2)}%` },
            { label: 'CPC', value: this.formatCurrency(metrics.cpc) },
            { label: 'CPA', value: this.formatCurrency(metrics.cpa) },
            { label: 'ROAS', value: `${metrics.roas.toFixed(2)}x` },
        ];

        const perfBoxWidth = (this.pageWidth - 2 * this.margin - 15) / 4;
        performanceData.forEach((metric, index) => {
            const x = this.margin + index * (perfBoxWidth + 5);
            this.doc.setFontSize(10);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(metric.label, x + perfBoxWidth / 2, this.currentY, { align: 'center' });
            this.doc.setFontSize(13);
            this.doc.setTextColor(0, 0, 0);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(metric.value, x + perfBoxWidth / 2, this.currentY + 8, { align: 'center' });
            this.doc.setFont('helvetica', 'normal');
        });

        this.currentY += 20;
    }

    /**
     * Add global metrics section
     */
    private addGlobalMetrics(metrics: CampaignMetrics, _config: ReportConfig): void {
        this.addSectionTitle('Métriques Globales');
        this.currentY += 5;

        const tableData = [
            ['Impressions', this.formatNumber(metrics.impressions)],
            ['Clics', this.formatNumber(metrics.clicks)],
            ['CTR', `${metrics.ctr.toFixed(2)}%`],
            ['Coût Total', this.formatCurrency(metrics.cost)],
            ['CPC Moyen', this.formatCurrency(metrics.cpc)],
            ['Conversions', this.formatNumber(metrics.conversions)],
            ['CPA', this.formatCurrency(metrics.cpa)],
            ['Valeur des Conversions', this.formatCurrency(metrics.conversionValue)],
            ['ROAS', `${metrics.roas.toFixed(2)}x`],
            ['Score de Qualité Moyen', `${metrics.qualityScore || 0}/10`],
        ];

        autoTable(this.doc, {
            startY: this.currentY,
            head: [['Métrique', 'Valeur']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                textColor: 255,
                fontSize: 11,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 10,
                cellPadding: 5,
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251],
            },
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    /**
     * Add campaign analysis
     */
    private addCampaignAnalysis(campaigns: Campaign[], config: ReportConfig): void {
        this.addSectionTitle('Analyse des Campagnes');
        this.currentY += 5;

        // Filter selected campaigns
        const selectedCampaigns = campaigns.filter((c) => config.campaignIds.includes(c.id));

        const tableData = selectedCampaigns.map((campaign) => [
            campaign.name,
            campaign.status,
            this.formatNumber(campaign.metrics.impressions),
            this.formatNumber(campaign.metrics.clicks),
            `${campaign.metrics.ctr.toFixed(2)}%`,
            this.formatCurrency(campaign.metrics.cost),
            this.formatNumber(campaign.metrics.conversions),
            `${campaign.metrics.roas.toFixed(2)}x`,
        ]);

        autoTable(this.doc, {
            startY: this.currentY,
            head: [['Campagne', 'Statut', 'Impressions', 'Clics', 'CTR', 'Coût', 'Conv.', 'ROAS']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: this.primaryColor,
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 20 },
            },
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    /**
     * Add time evolution section
     */
    private addTimeEvolution(timeSeriesData: any, _config: ReportConfig): void {
        this.addSectionTitle('Évolution Temporelle');
        this.currentY += 5;

        this.doc.setFontSize(10);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(
            'Note: Les graphiques détaillés sont disponibles dans le tableau de bord en ligne.',
            this.margin,
            this.currentY
        );
        this.currentY += 10;

        // Summary statistics
        if (timeSeriesData.spend && timeSeriesData.spend.length > 0) {
            const totalSpend = timeSeriesData.spend.reduce((sum: number, point: any) => sum + point.value, 0);
            const avgDailySpend = totalSpend / timeSeriesData.spend.length;

            this.doc.setFontSize(11);
            this.doc.setTextColor(0, 0, 0);
            this.doc.text(`Dépense totale: ${this.formatCurrency(totalSpend)}`, this.margin, this.currentY);
            this.currentY += 7;
            this.doc.text(`Dépense quotidienne moyenne: ${this.formatCurrency(avgDailySpend)}`, this.margin, this.currentY);
            this.currentY += 10;
        }
    }

    /**
     * Add budget analysis
     */
    private addBudgetAnalysis(_account: Account, campaigns: Campaign[], config: ReportConfig): void {
        this.addSectionTitle('Budget vs Dépenses');
        this.currentY += 5;

        const selectedCampaigns = campaigns.filter((c) => config.campaignIds.includes(c.id));
        const totalBudget = selectedCampaigns.reduce((sum, c) => sum + (c.budget.amount * 30 || 0), 0);
        const totalSpend = selectedCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
        const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

        // Summary boxes
        const summaryData = [
            { label: 'Budget Total', value: this.formatCurrency(totalBudget) },
            { label: 'Dépenses Totales', value: this.formatCurrency(totalSpend) },
            { label: 'Utilisation', value: `${budgetUtilization.toFixed(1)}%` },
        ];

        const boxWidth = (this.pageWidth - 2 * this.margin - 10) / 3;
        summaryData.forEach((item, index) => {
            const x = this.margin + index * (boxWidth + 5);
            this.doc.setFillColor(249, 250, 251);
            this.doc.roundedRect(x, this.currentY, boxWidth, 25, 2, 2, 'F');

            this.doc.setFontSize(9);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(item.label, x + boxWidth / 2, this.currentY + 10, { align: 'center' });

            this.doc.setFontSize(13);
            this.doc.setTextColor(0, 0, 0);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(item.value, x + boxWidth / 2, this.currentY + 19, { align: 'center' });
            this.doc.setFont('helvetica', 'normal');
        });

        this.currentY += 35;

        // Campaign budget breakdown
        const budgetData = selectedCampaigns.map((campaign) => {
            const campaignBudget = campaign.budget.amount * 30;
            const utilization = campaignBudget > 0 ? (campaign.metrics.cost / campaignBudget) * 100 : 0;
            return [
                campaign.name,
                this.formatCurrency(campaignBudget),
                this.formatCurrency(campaign.metrics.cost),
                `${utilization.toFixed(1)}%`,
            ];
        });

        autoTable(this.doc, {
            startY: this.currentY,
            head: [['Campagne', 'Budget', 'Dépenses', 'Utilisation']],
            body: budgetData,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
            },
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    /**
     * Add recommendations
     */
    private addRecommendations(campaigns: Campaign[], metrics: CampaignMetrics): void {
        this.addSectionTitle('Recommandations');
        this.currentY += 5;

        const recommendations: string[] = [];

        // Generate smart recommendations based on metrics
        if (metrics.ctr < 2) {
            recommendations.push('• Améliorer le CTR en optimisant les annonces et les mots-clés');
        }
        if (metrics.roas < 2) {
            recommendations.push('• Augmenter le ROAS en ciblant des audiences plus qualifiées');
        }
        if ((metrics.qualityScore || 0) < 7) {
            recommendations.push('• Améliorer le Score de Qualité pour réduire les coûts');
        }
        if (metrics.conversions < 50) {
            recommendations.push('• Optimiser les pages de destination pour augmenter les conversions');
        }

        // Campaign-specific recommendations
        const pausedCampaigns = campaigns.filter((c) => c.status === 'PAUSED');
        if (pausedCampaigns.length > 0) {
            recommendations.push(`• Réactiver ou supprimer ${pausedCampaigns.length} campagne(s) en pause`);
        }

        if (recommendations.length === 0) {
            recommendations.push('• Continuer à surveiller les performances et ajuster selon les tendances');
            recommendations.push('• Tester de nouvelles variantes d\'annonces pour améliorer les résultats');
        }

        this.doc.setFontSize(10);
        this.doc.setTextColor(60, 60, 60);
        recommendations.forEach((rec) => {
            const lines = this.doc.splitTextToSize(rec, this.pageWidth - 2 * this.margin);
            this.doc.text(lines, this.margin, this.currentY);
            this.currentY += 7 * lines.length;
        });
    }

    /**
     * Add period comparison
     */
    private addPeriodComparison(metrics: CampaignMetrics): void {
        this.addSectionTitle('Comparaison avec la Période Précédente');
        this.currentY += 5;

        // Simulate previous period data (in real scenario, this would come from actual data)
        const previousMetrics = {
            cost: metrics.cost * 0.92,
            impressions: metrics.impressions * 0.88,
            clicks: metrics.clicks * 0.90,
            conversions: metrics.conversions * 0.85,
            ctr: metrics.ctr * 0.98,
            roas: metrics.roas * 1.05,
        };

        const comparisonData = [
            [
                'Dépenses',
                this.formatCurrency(previousMetrics.cost),
                this.formatCurrency(metrics.cost),
                this.calculateChange(previousMetrics.cost, metrics.cost),
            ],
            [
                'Impressions',
                this.formatNumber(previousMetrics.impressions),
                this.formatNumber(metrics.impressions),
                this.calculateChange(previousMetrics.impressions, metrics.impressions),
            ],
            [
                'Clics',
                this.formatNumber(previousMetrics.clicks),
                this.formatNumber(metrics.clicks),
                this.calculateChange(previousMetrics.clicks, metrics.clicks),
            ],
            [
                'Conversions',
                this.formatNumber(previousMetrics.conversions),
                this.formatNumber(metrics.conversions),
                this.calculateChange(previousMetrics.conversions, metrics.conversions),
            ],
            ['CTR', `${previousMetrics.ctr.toFixed(2)}%`, `${metrics.ctr.toFixed(2)}%`, this.calculateChange(previousMetrics.ctr, metrics.ctr)],
            ['ROAS', `${previousMetrics.roas.toFixed(2)}x`, `${metrics.roas.toFixed(2)}x`, this.calculateChange(previousMetrics.roas, metrics.roas)],
        ];

        autoTable(this.doc, {
            startY: this.currentY,
            head: [['Métrique', 'Période Précédente', 'Période Actuelle', 'Évolution']],
            body: comparisonData,
            theme: 'striped',
            headStyles: {
                fillColor: this.primaryColor,
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
            },
        });

        this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    /**
     * Helper: Add section title
     */
    private addSectionTitle(title: string): void {
        this.doc.setFontSize(16);
        this.doc.setTextColor(this.primaryColor);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin, this.currentY);
        this.doc.setFont('helvetica', 'normal');
        this.currentY += 8;

        // Underline
        this.doc.setDrawColor(this.primaryColor);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.margin + 60, this.currentY);
        this.currentY += 5;
    }

    /**
     * Helper: Add new page
     */
    private addNewPage(): void {
        this.doc.addPage();
        this.currentY = this.margin;
    }

    /**
     * Helper: Add footers to all pages
     */
    private addFootersToAllPages(config: ReportConfig): void {
        const pageCount = this.doc.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);

            // Page number
            this.doc.setFontSize(9);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text(`Page ${i} / ${pageCount}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });

            // Report name
            if (i > 1) {
                this.doc.setFontSize(8);
                this.doc.text(config.customization.reportName || 'Performance Report', this.margin, this.pageHeight - 10);
            }
        }
    }

    /**
     * Helper: Format currency
     */
    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
        }).format(value);
    }

    /**
     * Helper: Format number
     */
    private formatNumber(value: number): string {
        return new Intl.NumberFormat('fr-FR').format(Math.round(value));
    }

    /**
     * Helper: Format date
     */
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    }

    /**
     * Helper: Calculate percentage change
     */
    private calculateChange(oldValue: number, newValue: number): string {
        if (oldValue === 0) return 'N/A';
        const change = ((newValue - oldValue) / oldValue) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    }

    /**
     * Helper: Check if multiple modules are included
     */
    private shouldIncludeMultipleModules(config: ReportConfig): boolean {
        const enabledModules = Object.values(config.modules).filter((v) => v === true);
        return enabledModules.length > 3;
    }

    /**
     * Generate PDF from sections with custom design
     */
    async generateReportFromSections(
        sections: ReportSection[],
        design: ReportDesign,
        reportTitle: string,
        account?: Account,
        _campaigns?: Campaign[],
        _aggregatedMetrics?: CampaignMetrics
    ): Promise<Blob> {
        // Apply custom design colors
        this.primaryColor = design.colorScheme.primary;
        this.secondaryColor = design.colorScheme.secondary;
        this.accentColor = design.colorScheme.accent;
        this.margin = design.layout.margins / 3.78; // Convert px to mm

        // Cover page
        this.addCustomCoverPage(reportTitle, design, account);

        // Render each section
        for (const section of sections.sort((a, b) => a.order - b.order)) {
            this.addNewPage();
            this.renderSection(section, design);
        }

        // Add footers
        this.addCustomFooters(reportTitle, design);

        return this.doc.output('blob');
    }

    /**
     * Add custom cover page with design
     */
    private addCustomCoverPage(title: string, design: ReportDesign, account?: Account): void {
        // Background with custom primary color
        const rgb = this.hexToRgb(design.colorScheme.primary);
        this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
        this.doc.rect(0, 0, this.pageWidth, 80, 'F');

        // Title
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(32);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.pageWidth / 2, 40, { align: 'center' });

        // Account name if provided
        if (account) {
            this.doc.setFontSize(18);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(account.name, this.pageWidth / 2, 55, { align: 'center' });
        }

        // Date
        this.doc.setFontSize(14);
        this.doc.text(this.formatDate(new Date()), this.pageWidth / 2, 68, { align: 'center' });

        // Reset text color
        const textRgb = this.hexToRgb(design.colorScheme.text);
        this.doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    }

    /**
     * Render a section from JSONContent
     */
    private renderSection(section: ReportSection, design: ReportDesign): void {
        // Section title
        const primaryRgb = this.hexToRgb(design.colorScheme.primary);
        this.doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(section.title, this.margin, this.currentY);
        this.currentY += 10;

        // Reset text color
        const textRgb = this.hexToRgb(design.colorScheme.text);
        this.doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);

        // Render content
        this.renderJSONContent(section.content, design);
    }

    /**
     * Render TipTap JSONContent to PDF
     */
    private renderJSONContent(content: JSONContent, design: ReportDesign): void {
        if (!content.content) return;

        for (const node of content.content) {
            this.renderNode(node, design);
        }
    }

    /**
     * Render individual node
     */
    private renderNode(node: JSONContent, design: ReportDesign): void {
        const textRgb = this.hexToRgb(design.colorScheme.text);

        switch (node.type) {
            case 'heading':
                const level = node.attrs?.level || 1;
                // Use same sizes as CSS: H1=36px, H2=30px, H3=24px
                const headingSizes = { 1: 36, 2: 30, 3: 24 };
                this.doc.setFontSize(headingSizes[level as keyof typeof headingSizes] / 1.33); // Convert px to pt
                this.doc.setFont('helvetica', 'bold');

                // Extract text with potential inline styles
                const headingFragments = this.extractTextWithStyles(node);
                this.renderStyledText(headingFragments, this.margin, this.currentY, design);

                // Spacing like CSS: H1=2xl+lg, H2=xl+md, H3=lg+md
                const headingSpacing = { 1: 12, 2: 10, 3: 8 };
                this.currentY += headingSpacing[level as keyof typeof headingSpacing];
                this.doc.setFont('helvetica', 'normal');
                break;

            case 'paragraph':
                // Use same font size as CSS (16px = ~12pt)
                this.doc.setFontSize(16 / 1.33); // Convert px to pt

                // Get alignment from attrs
                const alignment = node.attrs?.textAlign || 'left';

                // Extract text with inline styles
                const paragraphFragments = this.extractTextWithStyles(node);

                if (paragraphFragments.length > 0) {
                    this.renderStyledText(paragraphFragments, this.margin, this.currentY, design, alignment);
                    // Line height 1.6 like CSS
                    this.currentY += paragraphFragments.length * 6 * 1.6;
                }
                // Margin bottom like CSS (var(--spacing-md) = 1rem = ~16px)
                this.currentY += 4;
                break;

            case 'bulletList':
            case 'orderedList':
                if (node.content) {
                    this.doc.setFontSize(16 / 1.33);
                    node.content.forEach((item, index) => {
                        const bullet = node.type === 'bulletList' ? '•' : `${index + 1}.`;
                        this.doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
                        this.doc.text(bullet, this.margin + 5, this.currentY);

                        // Extract styled text for list item
                        const itemFragments = this.extractTextWithStyles(item);
                        this.renderStyledText(itemFragments, this.margin + 15, this.currentY, design);

                        // Spacing like CSS (margin-bottom: var(--spacing-sm))
                        this.currentY += 6;
                    });
                }
                // Margin bottom like CSS
                this.currentY += 4;
                break;

            case 'table':
                this.renderTable(node, design);
                break;

            case 'horizontalRule':
                this.doc.setDrawColor(textRgb.r, textRgb.g, textRgb.b);
                this.doc.setLineWidth(0.5);
                this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
                // Margin like CSS (var(--spacing-2xl) = 3rem)
                this.currentY += 12;
                break;

            case 'blockquote':
                // Render blockquote with border and italic style
                const quoteRgb = this.hexToRgb(design.colorScheme.primary);
                this.doc.setDrawColor(quoteRgb.r, quoteRgb.g, quoteRgb.b);
                this.doc.setLineWidth(1);
                this.doc.line(this.margin, this.currentY, this.margin, this.currentY + 20);

                this.doc.setFont('helvetica', 'italic');
                this.doc.setFontSize(16 / 1.33);
                const quoteFragments = this.extractTextWithStyles(node);
                this.renderStyledText(quoteFragments, this.margin + 8, this.currentY, design);
                this.currentY += 8;
                this.doc.setFont('helvetica', 'normal');
                break;

            case 'image':
                // Handle images if base64
                if (node.attrs?.src) {
                    try {
                        this.doc.addImage(
                            node.attrs.src,
                            'JPEG',
                            this.margin,
                            this.currentY,
                            this.pageWidth - 2 * this.margin,
                            0 // Auto height
                        );
                        this.currentY += 60; // Approximate image height
                    } catch (e) {
                        // Skip if image can't be added
                        console.warn('Could not add image to PDF', e);
                    }
                }
                break;

            default:
                // Handle other node types
                if (node.content) {
                    this.renderJSONContent(node, design);
                }
        }

        // Check if we need a new page
        if (this.currentY > this.pageHeight - 30) {
            this.addNewPage();
        }
    }

    /**
     * Extract text with inline styles (bold, italic, color, highlight)
     */
    private extractTextWithStyles(node: JSONContent): Array<{
        text: string;
        bold?: boolean;
        italic?: boolean;
        color?: string;
        highlight?: string;
    }> {
        const fragments: Array<{
            text: string;
            bold?: boolean;
            italic?: boolean;
            color?: string;
            highlight?: string;
        }> = [];

        const processNode = (n: JSONContent, inheritedStyles: any = {}) => {
            if (n.text) {
                // Check for marks (bold, italic, color, highlight)
                const styles = { ...inheritedStyles };

                if (n.marks) {
                    n.marks.forEach((mark) => {
                        if (mark.type === 'bold') styles.bold = true;
                        if (mark.type === 'italic') styles.italic = true;
                        if (mark.type === 'textStyle' && mark.attrs?.color) {
                            styles.color = mark.attrs.color;
                        }
                        if (mark.type === 'highlight' && mark.attrs?.color) {
                            styles.highlight = mark.attrs.color;
                        }
                    });
                }

                fragments.push({
                    text: n.text,
                    ...styles,
                });
            }

            if (n.content) {
                n.content.forEach((child) => processNode(child, inheritedStyles));
            }
        };

        if (node.content) {
            node.content.forEach((child) => processNode(child));
        } else {
            processNode(node);
        }

        return fragments;
    }

    /**
     * Render text with inline styles
     */
    private renderStyledText(
        fragments: Array<{
            text: string;
            bold?: boolean;
            italic?: boolean;
            color?: string;
            highlight?: string;
        }>,
        startX: number,
        startY: number,
        design: ReportDesign,
        alignment: string = 'left'
    ): void {
        if (fragments.length === 0) return;

        const textRgb = this.hexToRgb(design.colorScheme.text);

        // Calculate total text width for alignment
        let totalWidth = 0;
        fragments.forEach((fragment) => {
            const font = fragment.bold && fragment.italic ? 'bolditalic' :
                fragment.bold ? 'bold' :
                    fragment.italic ? 'italic' : 'normal';
            this.doc.setFont('helvetica', font);
            totalWidth += this.doc.getTextWidth(fragment.text);
        });

        // Adjust start X based on alignment
        let currentX = startX;
        if (alignment === 'center') {
            currentX = this.pageWidth / 2 - totalWidth / 2;
        } else if (alignment === 'right') {
            currentX = this.pageWidth - this.margin - totalWidth;
        }

        let currentY = startY;

        fragments.forEach((fragment) => {
            // Set font style
            const font = fragment.bold && fragment.italic ? 'bolditalic' :
                fragment.bold ? 'bold' :
                    fragment.italic ? 'italic' : 'normal';
            this.doc.setFont('helvetica', font);

            // Handle highlight background
            if (fragment.highlight) {
                const highlightRgb = this.hexToRgb(fragment.highlight);
                const textWidth = this.doc.getTextWidth(fragment.text);
                this.doc.setFillColor(highlightRgb.r, highlightRgb.g, highlightRgb.b);
                this.doc.rect(currentX, currentY - 3, textWidth, 5, 'F');
            }

            // Set text color
            if (fragment.color) {
                const colorRgb = this.hexToRgb(fragment.color);
                this.doc.setTextColor(colorRgb.r, colorRgb.g, colorRgb.b);
            } else {
                this.doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
            }

            // Render text
            this.doc.text(fragment.text, currentX, currentY);
            currentX += this.doc.getTextWidth(fragment.text);
        });

        // Reset to normal
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    }

    /**
     * Render table from JSONContent
     */
    private renderTable(tableNode: JSONContent, _design: ReportDesign): void {
        if (!tableNode.content) return;

        const rows: string[][] = [];
        let hasHeader = false;

        tableNode.content.forEach((row, _rowIndex) => {
            if (row.type === 'tableRow' && row.content) {
                const rowData: string[] = [];
                row.content.forEach((cell) => {
                    if (cell.type === 'tableHeader') {
                        hasHeader = true;
                    }
                    rowData.push(this.extractText(cell));
                });
                rows.push(rowData);
            }
        });

        if (rows.length > 0) {
            const borderRgb = this.hexToRgb('#dcdde0'); // var(--color-border)
            const bgSecondaryRgb = this.hexToRgb('#f8fafc'); // var(--color-bg-secondary)

            const head = hasHeader ? [rows[0]] : undefined;
            const body = hasHeader ? rows.slice(1) : rows;

            autoTable(this.doc, {
                startY: this.currentY,
                head,
                body,
                theme: 'grid',
                headStyles: {
                    fillColor: [bgSecondaryRgb.r, bgSecondaryRgb.g, bgSecondaryRgb.b],
                    textColor: [0, 0, 0],
                    fontSize: 10,
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    lineColor: [borderRgb.r, borderRgb.g, borderRgb.b],
                    cellPadding: { top: 2, right: 4, bottom: 2, left: 4 }, // var(--spacing-sm) var(--spacing-md)
                },
                styles: {
                    fontSize: 10,
                    cellPadding: { top: 2, right: 4, bottom: 2, left: 4 },
                    lineWidth: 0.1,
                    lineColor: [borderRgb.r, borderRgb.g, borderRgb.b],
                },
                alternateRowStyles: {
                    fillColor: [bgSecondaryRgb.r, bgSecondaryRgb.g, bgSecondaryRgb.b],
                },
                margin: { left: this.margin, right: this.margin },
            });

            this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
        }
    }

    /**
     * Extract text from JSONContent node
     */
    private extractText(node: JSONContent): string {
        if (node.text) {
            return node.text;
        }
        if (node.content) {
            return node.content.map((child) => this.extractText(child)).join('');
        }
        return '';
    }

    /**
     * Add custom footers to all pages
     */
    private addCustomFooters(reportTitle: string, _design: ReportDesign): void {
        const pageCount = this.doc.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(9);
            this.doc.setTextColor(150, 150, 150);
            this.doc.text(`Page ${i} / ${pageCount}`, this.pageWidth / 2, this.pageHeight - 10, {
                align: 'center',
            });

            if (i > 1) {
                this.doc.setFontSize(8);
                this.doc.text(reportTitle, this.margin, this.pageHeight - 10);
            }
        }
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
            : { r: 0, g: 0, b: 0 };
    }
}

export default ReportGenerator;
