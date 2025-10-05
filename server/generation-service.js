/**
 * A singleton class to manage the text generation pipeline.
 * Ensures the T5 model is loaded only once.
 */
class GenerationService {
    static instance = null;
    static model = 'Xenova/t5-small';
    static task = 'text2text-generation';

    /**
     * Retrieves the singleton instance of the generation pipeline.
     * @returns {Promise<Function>} The text2text-generation pipeline function.
     */
    static async getInstance() {
        if (this.instance === null) {
            console.log('Initializing text generation model for the first time...');
            const { pipeline } = await import('@xenova/transformers');
            this.instance = await pipeline(this.task, this.model);
            console.log('Text generation model loaded successfully.');
        }
        return this.instance;
    }

    /**
     * Generates text based on a given input and a predefined task prefix.
     * @param {string} inputText - The text to be transformed.
     * @param {string} taskPrefix - The instruction for the model (e.g., "translate English to German: ").
     * @returns {Promise<string|null>} The generated text, or null on error.
     */
    static async generate(inputText, taskPrefix) {
        if (!inputText || !taskPrefix) {
            return null;
        }

        const generator = await this.getInstance();
        const fullPrompt = `${taskPrefix}${inputText}`;

        const result = await generator(fullPrompt, {
            max_new_tokens: 1024, // Increased token limit for longer answers
            temperature: 0.7,
            repetition_penalty: 1.5,
            no_repeat_ngram_size: 2,
            early_stopping: true,
        });

        // The result is an array of objects, we need the generated_text from the first one.
        if (result && result.length > 0 && result[0].generated_text) {
            return result[0].generated_text;
        }

        return null;
    }
}

// The model will be loaded on the first request now ("lazy loading").
// GenerationService.getInstance();

module.exports = GenerationService;