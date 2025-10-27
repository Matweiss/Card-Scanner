import type { ContactInfo } from '../types';

/**
 * Generates a vCard string from contact information
 * @param contactInfo - The contact information to convert
 * @returns vCard formatted string
 */
export const generateVCard = (contactInfo: ContactInfo): string => {
    // Notes field now includes tags, so use it directly
    const noteContent = contactInfo.notes || '';

    return `BEGIN:VCARD
VERSION:3.0
N:${contactInfo.lastName || ''};${contactInfo.firstName || ''}
FN:${contactInfo.firstName || ''} ${contactInfo.lastName || ''}
ORG:${contactInfo.company || ''}
TITLE:${contactInfo.title || ''}
TEL;TYPE=WORK,VOICE:${contactInfo.phone || ''}
EMAIL:${contactInfo.email || ''}
URL:${contactInfo.website || ''}
ADR;TYPE=WORK:;;${(contactInfo.address || '').replace(/\n/g, ';')}
NOTE:${noteContent.replace(/\n/g, '\\n')}
END:VCARD`;
};

/**
 * Downloads a vCard file
 * @param contactInfo - The contact information to save
 */
export const downloadVCard = (contactInfo: ContactInfo): void => {
    const vCard = generateVCard(contactInfo);
    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const namePart = `${contactInfo.firstName} ${contactInfo.lastName}`.trim() || 'contact';
    const fileName = `${namePart.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vcf`;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
