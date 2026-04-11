export const getOptimizedUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return url;
    return url.replace('/upload/', '/upload/q_auto,f_auto,w_600/');
};
