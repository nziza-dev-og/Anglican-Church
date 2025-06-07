
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Import directly as googleAI

export const ai = genkit({
  plugins: [googleAI()], // Call the imported function directly in the plugins array
  model: 'googleai/gemini-2.0-flash',
});
