import { BrevoClient } from '@getbrevo/brevo';

// Initialize the client with your API key
const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

// Export the client so your service can use it
export default brevo;
