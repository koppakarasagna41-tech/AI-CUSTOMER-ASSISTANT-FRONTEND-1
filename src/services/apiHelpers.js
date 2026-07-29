/**
 * apiHelpers.js
 *
 * Common helpers for frontend service error handling.
 */

/**
 * Normalize API error objects thrown by axios or the response interceptor.
 * @param {unknown} error
 * @throws {{status:number,message:string,raw:any}}
 */
export function normalizeApiError(error) {
    if (error && typeof error === 'object') {
        const candidate = /** @type {{status?: number; message?: string; raw?: any}} */ (error);
        if (typeof candidate.message === 'string' || typeof candidate.status === 'number') {
            throw candidate;
        }
    }

    throw {
        status: 500,
        message: 'Unexpected API error. Please try again later.',
        raw: error,
    };
}
