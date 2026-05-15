import { app } from './app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';

const auth = getAuth(app);
const canUseAnalytics = Boolean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);

let analyticsPromise = null;

const getAnalyticsSafe = () => {
    if (!canUseAnalytics) return Promise.resolve(null);

    if (!analyticsPromise) {
        analyticsPromise = isSupported()
            .then((supported) => (supported ? getAnalytics(app) : null))
            .catch(() => null);
    }

    return analyticsPromise;
};

const sendAnalyticsEvent = (eventName, data) => {
    getAnalyticsSafe().then((analytics) => {
        if (analytics) logEvent(analytics, eventName, data);
    });
};

export const logger = {
    error: (message, error, context = {}) => {
        const user = auth.currentUser;
        const logData = {
            message,
            error: error?.message || String(error),
            user_id: user?.uid || 'anonymous',
            device_model: navigator.userAgent,
            timestamp: new Date().toISOString(),
            ...context,
        };

        console.error(`[LOGGER ERROR]: ${message}`, logData);
        sendAnalyticsEvent('app_error', logData);
    },

    info: (eventName, params = {}) => {
        const user = auth.currentUser;
        const data = {
            user_id: user?.uid || 'anonymous',
            device_model: navigator.userAgent,
            ...params,
        };

        console.log(`[LOGGER INFO]: ${eventName}`, data);
        sendAnalyticsEvent(eventName, data);
    },
};
