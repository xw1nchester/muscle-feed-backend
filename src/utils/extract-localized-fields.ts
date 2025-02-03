export const extractLocalizedFields = <T extends Record<string, any>>(
    data: T
): Record<string, any> => {
    const localizedFields: Record<string, Record<string, string>> = {};

    Object.entries(data).forEach(([key, value]) => {
        const match = key.match(/^(.*?)(Ru|He)$/);
        if (match) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, field, lang] = match;
            if (!localizedFields[field]) {
                localizedFields[field] = {};
            }
            localizedFields[field][lang.toLowerCase()] = value;
        }
    });

    return localizedFields;
};
