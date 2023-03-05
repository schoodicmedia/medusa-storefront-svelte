import Medusa from '@medusajs/medusa-js';

export const MEDUSA_BACKEND_URL = import.meta.env.PUBLIC_MEDUSA_BACKEND_URL as string || "http://localhost:9000";
export const createClient = () => new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 });