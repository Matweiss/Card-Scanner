import { useState, useEffect } from 'react';

const isValidUrl = (urlString: string): boolean => {
    const basicFormatRegex = /.+?\..+/;
    if (!basicFormatRegex.test(urlString)) {
        return false;
    }

    let urlToTest = urlString;
    if (!/^https?:\/\//i.test(urlToTest)) {
        urlToTest = `https://${urlToTest}`;
    }

    try {
        new URL(urlToTest);
        return true;
    } catch (e) {
        return false;
    }
};

export const useWebsiteValidation = (website: string): boolean | null => {
    const [isWebsiteValid, setIsWebsiteValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (website.trim() === '') {
            setIsWebsiteValid(null);
            return;
        }

        const handler = setTimeout(() => {
            setIsWebsiteValid(isValidUrl(website));
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [website]);

    return isWebsiteValid;
};
