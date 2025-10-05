const axios = require('axios');

// The URL for the Ollama service, read from environment variables.
// This is set in the docker-compose.yml file.
const OLLAMA_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = 'phi3:mini'; // The model we want to use

class GenerationService {
    /**
     * Generates text by sending a request to the dedicated Ollama service.
     * @param {string} inputText - The text to be transformed.
     * @param {string} taskPrefix - The user-defined prompt instruction.
     * @returns {Promise<string|null>} The generated text, or null on error.
     */
    static async generate(inputText, taskPrefix) {
        if (!inputText || !taskPrefix) {
            return null;
        }

        const fullPrompt = `${taskPrefix}${inputText}`;

        console.log(`Sending prompt to Ollama: ${fullPrompt}`);

        try {
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                model: OLLAMA_MODEL,
                prompt: fullPrompt,
                stream: false, // We want the full response at once
                options: {
                    temperature: 0.7,
                    repetition_penalty: 1.5,
                    num_predict: 1024, // Corresponds to max_new_tokens
                }
            });

            // The response from Ollama contains the generated text in the 'response' field.
            if (response.data && response.data.response) {
                console.log('Received response from Ollama.');
                return response.data.response.trim();
            }

            console.error('Ollama response did not contain expected data:', response.data);
            return null;

        } catch (error) {
            console.error('Error communicating with Ollama service:', error.message);
            if (error.response) {
                console.error('Ollama response error data:', error.response.data);
            }
            return null;
        }
    }
}

module.exports = GenerationService;