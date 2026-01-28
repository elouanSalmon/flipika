import { FileSpreadsheet, FileText, Presentation } from 'lucide-react';

export interface LeadMagnet {
    slug: string;
    format: 'excel' | 'pdf' | 'ppt';
    icon: any; // Lucide icon
    image: string; // Placeholder for now or a generic asset path
    downloadUrl: string; // This would typically be a real URL, we'll mock it or use a placeholder
}

export const leadMagnets: LeadMagnet[] = [
    {
        slug: 'google-ads-excel-template',
        format: 'excel',
        icon: FileSpreadsheet,
        image: '/images/magnets/excel-preview.png',
        downloadUrl: '#',
    },
    {
        slug: 'google-ads-powerpoint-template',
        format: 'ppt',
        icon: Presentation,
        image: '/images/magnets/ppt-preview.png',
        downloadUrl: '#',
    },
    {
        slug: 'google-ads-pdf-example',
        format: 'pdf',
        icon: FileText,
        image: '/images/magnets/pdf-preview.png',
        downloadUrl: '#',
    },
];
