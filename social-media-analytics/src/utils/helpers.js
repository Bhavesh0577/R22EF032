// Generate a random image URL 
export const getRandomImageUrl = (seed, width = 400, height = 300) => {
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

// Format date to readable format
export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
};

// Capitalize first letter of each word
export const capitalizeWords = (string) => {
    return string
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// Truncate long text
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}; 