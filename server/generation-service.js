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
     * Generates text based on a given input and a professionally structured prompt.
     * @param {string} inputText - The text to be transformed.
     * @param {string} taskInstruction - The user-defined instruction for the model.
     * @returns {Promise<string|null>} The generated text, or null on error.
     */
    static async generate(inputText, taskInstruction) {
        if (!inputText || !taskInstruction) {
            return null;
        }

        const generator = await this.getInstance();

        // Use a clear, structured prompt to guide the model effectively.
        // This template separates the instruction, the input text, and the desired output language.
        const fullPrompt = `Anweisung: ${taskInstruction}\n\nEingabetext: "${inputText}"\n\nAntwort auf Deutsch:`;

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