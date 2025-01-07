export const auth = {
    jwtSecret: process.env.JWT_SECRET || 'default-secret',
    jwtExpiresIn: 604800 // in seconds
}