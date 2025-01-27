const axios = require('axios');

class LmStudioApi {
    constructor() {
        this.baseUrl = 'http://localhost:4892/v1';
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async chatCompletion(messages, functions = null) {
        const payload = {
            model: 'local-model',
            messages,
            temperature: 0.7,
            stream: false
        };

        if (functions) {
            payload.functions = functions;
            payload.function_call = 'auto';
        }

        try {
            const response = await this.client.post('/chat/completions', payload);
            return response.data;
        } catch (error) {
            console.error('Chat completion error:', error);
            throw error;
        }
    }

    async executeFunction(functionName, parameters) {
        try {
            const response = await this.client.post(
                `/functions/${functionName}`,
                parameters
            );
            return response.data;
        } catch (error) {
            console.error('Function execution error:', error);
            throw error;
        }
    }
}

module.exports = new LmStudioApi();