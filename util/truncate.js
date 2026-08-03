export function truncate (text='', maxLength=30) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;}