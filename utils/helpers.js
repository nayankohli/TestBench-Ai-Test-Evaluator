const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Hash a password using PBKDF2
 */
function hashPassword(password) {
    return crypto.pbkdf2Sync(password, 'salt_key', 1000, 64, 'sha512').toString('hex');
}

/**
 * Generate a random code for tests
 */
function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array(6).fill(0).map(() => characters[Math.floor(Math.random() * characters.length)]).join('');
}

/**
 * Evaluate an answer using AI
 */
async function evaluateAnswer(question, answer) {
    try {
        const prompt = `${question} solution: ${answer} Evaluate this answer and provide a score out of 5. Response format: Single number between 0-5`;
        const result = await model.generateContent(prompt);
        const score = parseInt(await result.response.text().trim());
        return isNaN(score) ? 0 : score;
    } catch (error) {
        console.error('Error evaluating answer:', error);
        return 0;
    }
}

module.exports = {
    hashPassword,
    generateCode,
    evaluateAnswer,
    model
};