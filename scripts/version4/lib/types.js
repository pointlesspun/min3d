
/**
 * Checks if the current value is defined which is not undefined and not null
 * @param {*} value 
 * @returns {boolean} true if the value is defined false otherwise
 */
export const isDefined = (value) => (typeof value !== 'undefined' && value !== null);

/**
 * 
 * @param {*} value  
 * @param {*} defaultValue 
 * @returns value if value is defined default value otherwise
 */
export const definedOrDefault = (value, defaultValue) => isDefined(value) ? value : defaultValue;

