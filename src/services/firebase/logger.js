import { app } from './app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';

const auth = getAuth(app);
const analytics = getAnalytics(app);

/**
 * Utility for centralized logging to Firebase
 */
export const logger = {
    /**
     * Log an error with user and device context
     * @param {string} message - Error description
     * @param {Error|Object} error - Original error object
     * @param {Object} [context] - Additional context
     */
    error: (message, error, context = {}) => {
        const user = auth.currentUser;
        const logData = {
            message,
            error: error?.message || String(error),
            user_id: user?.uid || 'anonymous',
            device_model: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...context
        };

        console.error(`[LOGGER ERROR]: ${message}`, logData);
        
        // Firebase Analytics event
        logEvent(analytics, 'app_error', logData);
    },

    /**
     * Log a performance metric or business event
     * @param {string} eventName 
     * @param {Object} params 
     */
    info: (eventName, params = {}) => {
        const user = auth.currentUser;
        const data = {
            user_id: user?.uid || 'anonymous',
            device_model: navigator.userAgent,
            ...params
        };
        
        console.log(`[LOGGER INFO]: ${eventName}`, data);
        logEvent(analytics, eventName, data);
    }
};
