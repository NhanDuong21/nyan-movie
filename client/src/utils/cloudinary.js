/**
 * Optimizes a raw Cloudinary URL by injecting transformation parameters.
 * @param {string} url - The raw Cloudinary URL.
 * @param {number} [width] - Optional width to resize the image.
 * @returns {string} The optimized URL.
 */
export const optimizeCloudinaryUrl = (url, width = null) => {
    if (!url || !url.includes('cloudinary.com')) return url;

    // Define the transformations:
    // f_auto: Automatically deliver the best format (WebP/AVIF)
    // q_auto: Automatically adjust quality for best compression/visual balance
    // c_fill, w_{width}: Crop and resize to specific width if provided
    
    let transformations = 'f_auto,q_auto';
    if (width) {
        transformations += `,c_fill,w_${width}`;
    }

    // Cloudinary URLs typically look like: .../image/upload/v1234567890/folder/image.jpg
    // We need to inject the transformations right after /upload/
    const uploadDir = '/upload/';
    if (url.includes(uploadDir)) {
        const parts = url.split(uploadDir);
        return `${parts[0]}${uploadDir}${transformations}/${parts[1]}`;
    }

    return url;
};
