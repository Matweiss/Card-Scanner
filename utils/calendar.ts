import type { ContactInfo } from '../types';

/**
 * Creates a Google Calendar event URL for a follow-up reminder
 * @param contactInfo - The contact information for the reminder
 * @returns Google Calendar URL
 */
export const createCalendarReminderUrl = (contactInfo: ContactInfo): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const startTime = tomorrow.toISOString().replace(/-|:|\.\d+/g, '');
    tomorrow.setHours(11, 0, 0, 0);
    const endTime = tomorrow.toISOString().replace(/-|:|\.\d+/g, '');

    const title = encodeURIComponent(
        `Follow up with ${contactInfo.firstName} ${contactInfo.lastName}`
    );
    const details = encodeURIComponent(
        `Remember to follow up with ${contactInfo.firstName} from ${contactInfo.company}.\n\nEmail: ${contactInfo.email}\nPhone: ${contactInfo.phone}`
    );

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
};

/**
 * Opens Google Calendar to schedule a reminder
 * @param contactInfo - The contact information for the reminder
 */
export const scheduleCalendarReminder = (contactInfo: ContactInfo): void => {
    const calendarUrl = createCalendarReminderUrl(contactInfo);
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
};
