/**
 * A singleton class to manage the text generation pipeline.
 * Ensures the T5 model is loaded only once.
 */
class GenerationService {
    static instance = null;
    static model = 'Xenova/Phi-3-mini-4k-instruct'; // Corrected to the public model
    static task = 'text-generation'; // Phi-3 uses a different task type

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

        // Use the specific chat template for Phi-3 for optimal performance
        const fullPrompt = `<|user|>\n${taskPrefix}\n\n${inputText}<|end|>\n<|assistant|>`;

        const result = await generator(fullPrompt, {
            max_new_tokens: 1024,
            temperature: 0.7,
            repetition_penalty: 1.5,
            no_repeat_ngram_size: 2,
            early_stopping: true,
        });

        if (result && result.length > 0 && result[0].generated_text) {
            // The model's output includes the full prompt; we must parse the assistant's response.
            const generatedText = result[0].generated_text;
            const assistantResponse = generatedText.split('<|assistant|>').pop().trim();
            return assistantResponse;
        }

        return null;
    }
}

// Model is loaded on first request ("lazy loading") to ensure stable server start.
module.exports = GenerationService;