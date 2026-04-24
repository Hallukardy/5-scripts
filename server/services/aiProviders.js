const axios = require('axios');

const providers = {
    gemini: {
        name: 'Google Gemini',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        method: 'POST',
        adapter: (messages, key) => ({
            url: `${providers.gemini.url}?key=${key}`,
            headers: { 'Content-Type': 'application/json' },
            body: { contents: [{ parts: [{ text: messages[messages.length - 1].content }] }] },
            transformResponse: (data) => data.candidates[0].content.parts[0].text
        })
    },
    openai: {
        name: 'OpenAI GPT-4o',
        url: 'https://api.openai.com/v1/chat/completions',
        adapter: (messages, key) => ({
            url: providers.openai.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { model: 'gpt-4o', messages },
            transformResponse: (data) => data.choices[0].message.content
        })
    },
    anthropic: {
        name: 'Anthropic Claude 3.5',
        url: 'https://api.anthropic.com/v1/messages',
        adapter: (messages, key) => ({
            url: providers.anthropic.url,
            headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
            body: { model: 'claude-3-5-sonnet-20240620', max_tokens: 1024, messages: messages.filter(m => m.role !== 'system') },
            transformResponse: (data) => data.content[0].text
        })
    },
    groq: {
        name: 'Groq (Llama 3.3)',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        adapter: (messages, key) => ({
            url: providers.groq.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { model: 'llama-3.3-70b-versatile', messages },
            transformResponse: (data) => data.choices[0].message.content
        })
    },
    deepseek: {
        name: 'DeepSeek',
        url: 'https://api.deepseek.com/v1/chat/completions',
        adapter: (messages, key) => ({
            url: providers.deepseek.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { model: 'deepseek-chat', messages },
            transformResponse: (data) => data.choices[0].message.content
        })
    },
    mistral: {
        name: 'Mistral AI',
        url: 'https://api.mistral.ai/v1/chat/completions',
        adapter: (messages, key) => ({
            url: providers.mistral.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { model: 'mistral-large-latest', messages },
            transformResponse: (data) => data.choices[0].message.content
        })
    },
    perplexity: {
        name: 'Perplexity',
        url: 'https://api.perplexity.ai/chat/completions',
        adapter: (messages, key) => ({
            url: providers.perplexity.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { model: 'llama-3.1-sonar-small-128k-online', messages },
            transformResponse: (data) => data.choices[0].message.content
        })
    },
    cohere: {
        name: 'Cohere',
        url: 'https://api.cohere.com/v2/chat',
        adapter: (messages, key) => ({
            url: providers.cohere.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { model: 'command-r-plus', messages },
            transformResponse: (data) => data.message.content[0].text
        })
    },
    huggingface: {
        name: 'Hugging Face',
        url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
        adapter: (messages, key) => ({
            url: providers.huggingface.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { messages },
            transformResponse: (data) => data.choices[0].message.content
        })
    },
    xai: {
        name: 'X.AI (Grok)',
        url: 'https://api.x.ai/v1/chat/completions',
        adapter: (messages, key) => ({
            url: providers.xai.url,
            headers: { 'Authorization': `Bearer ${key}` },
            body: { model: 'grok-beta', messages },
            transformResponse: (data) => data.choices[0].message.content
        })
    }
};

async function callProvider(providerId, messages, key) {
    const provider = providers[providerId];
    if (!provider) throw new Error(`Provider ${providerId} not found`);
    
    const config = provider.adapter(messages, key);
    
    try {
        const response = await axios({
            method: 'POST',
            url: config.url,
            headers: config.headers,
            data: config.body
        });
        return config.transformResponse(response.data);
    } catch (error) {
        console.error(`Error calling ${provider.name}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || error.message);
    }
}

module.exports = { providers, callProvider };
