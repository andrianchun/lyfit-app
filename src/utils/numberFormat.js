/**
 * Formats a number with thousands separators and localized decimal points.
 * @param {number|string} value - The number to format
 * @param {string} language - 'ID' for Indonesian (dots for thousands, comma for decimal), 'EN' for English. Default is 'ID'.
 * @param {number} maximumFractionDigits - Max decimal places (default 2)
 * @returns {string} The formatted string
 */
export const formatNumber = (value, language = 'ID', maximumFractionDigits = 2) => {
    if (value === null || value === undefined || value === '') return '';
    
    // Convert to number, handle string inputs safely
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '.')) : Number(value);
    
    if (isNaN(num)) return value; // Fallback to original if not a number

    const locale = language === 'ID' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale, {
        maximumFractionDigits,
    }).format(num);
};

/**
 * Parses a localized number string back to a valid JS number (float).
 * Useful for inputs.
 * @param {string} formattedValue - The localized string
 * @param {string} language - 'ID' or 'EN'
 * @returns {number|string} The raw parsed number (or empty string if invalid)
 */
export const parseFormattedNumber = (formattedValue, language = 'ID') => {
    if (formattedValue === null || formattedValue === undefined || formattedValue === '') return '';
    
    let str = formattedValue.toString();
    
    if (language === 'ID') {
        // Remove all dots (thousands separator), then replace comma with dot (decimal separator)
        str = str.replace(/\./g, '').replace(/,/g, '.');
    } else {
        // Remove all commas (thousands separator)
        str = str.replace(/,/g, '');
    }
    
    // Return the cleaned string or a parsed float
    return str; // We return string so input fields don't lose trailing decimals like "10."
};
