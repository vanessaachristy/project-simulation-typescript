import path from "path";

export const getFileNameWithTimestamp = (filename: string): string => {
    const formattedDate = new Date()
        .toISOString()
        .replace(/:/g, '-') // Replace colons for naming compatibility
        .replace('T', '_')  // Replace 'T' with underscore
        .split('.')[0];     // Remove milliseconds
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, ''); // Remove unsafe characters
    const filePath = path.join(__dirname, '../../data/', `upload_${formattedDate}_${sanitizedFilename}`);

    return filePath;

}