import { type NormalizedPost } from './normalizePost';
import * as XLSX from 'xlsx';



/**
 * Transforms posts into a flat array of objects matching the export columns.
 */
const transformForExport = (posts: NormalizedPost[]) => {
    return posts.map(p => ({
        'Date': p.date,
        'Funnel': p.funnel,
        'Cohort': p.cohort,
        'BOAT Pillar': p.boatPillar,
        'Format': p.format,
        'Core Message': p.coreMessage || '',
        'Post Communication': p.postCommunication || '',
        'Platform': p.platform
    }));
};

/**
 * Exports content to CSV or XLSX
 */
export const exportContent = (posts: NormalizedPost[], format: 'csv' | 'xlsx', filenameBase: string) => {
    if (!posts || posts.length === 0) {
        console.warn('Export: No data provided');
        return;
    }

    const data = transformForExport(posts);
    const filename = `${filenameBase}.${format}`;

    if (format === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } else {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Content Calendar');
        XLSX.writeFile(workbook, filename);
    }
};

/**
 * Legacy wrapper for backward compatibility if needed, defaulting to CSV
 */
export const exportPostsToCSV = (posts: NormalizedPost[], filename: string) => {
    exportContent(posts, 'csv', filename.replace('.csv', ''));
};
