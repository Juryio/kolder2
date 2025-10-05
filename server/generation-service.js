/**
 * A singleton class to manage the text generation pipeline.
 * Ensures the Flan-T5 model is loaded only once.
 */
class GenerationService {
    static instance = null;
    static model = 'Xenova/flan-t5-base'; // Using the robust and instruction-tuned Flan-T5 model
    static task = 'text2text-generation'; // Correct task for T5 models

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
     * @param {string} taskPrefix - The instruction for the model.
     * @returns {Promise<string|null>} The generated text, or null on error.
     */
    static async generate(inputText, taskPrefix) {
        if (!inputText || !taskPrefix) {
            return null;
        }

        const generator = await this.getInstance();
        // T5-style models expect a simple concatenation of the instruction and the input text.
        const fullPrompt = `${taskPrefix}${inputText}`;

        const result = await generator(fullPrompt, {
            max_new_tokens: 1024,
            temperature: 0.7,
            repetition_penalty: 1.5,
            no_repeat_ngram_size: 2,
            early_stopping: true,
        });

        if (result && result.length > 0 && result[0].generated_text) {
            return result[0].generated_text;
        }

        return null;
    }
}

// Model is loaded on first request ("lazy loading") to ensure stable server start.
module.exports = GenerationService;