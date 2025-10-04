/**
 * A singleton class to manage the text embedding pipeline.
 * This ensures that the model is loaded only once, saving memory and time.
 */
class EmbeddingService {
    // The static instance of the pipeline.
    static instance = null;

    /**
     * Retrieves the singleton instance of the embedding pipeline.
     * If the pipeline is not yet initialized, it will be created.
     * This is an async function because model loading is asynchronous.
     * @returns {Promise<Function>} The feature-extraction pipeline function.
     */
    static async getInstance() {
        if (this.instance === null) {
            console.log('Initializing embedding model for the first time...');
            // Dynamically import the pipeline function from the ES Module.
            const { pipeline } = await import('@xenova/transformers');
            // Load the small, efficient, multilingual model.
            // The first time this runs, it will download the model files.
            this.instance = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
            console.log('Embedding model loaded successfully.');
        }
        return this.instance;
    }

    /**
     * Generates a vector embedding for a given text.
     * @param {string} text - The text to embed.
     * @returns {Promise<Array<number>|null>} A promise that resolves to the embedding vector or null if input is invalid.
     */
    static async generateEmbedding(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return null;
        }

        const extractor = await this.getInstance();

        // Generate the embedding.
        const result = await extractor(text, {
            pooling: 'mean',
            normalize: true,
        });

        // Convert the Float32Array to a standard JavaScript Array.
        return Array.from(result.data);
    }
}

// Immediately attempt to initialize the model in the background when the server starts.
// This "warms up" the service so that the first real request isn't delayed by model loading.
EmbeddingService.getInstance();

module.exports = EmbeddingService;