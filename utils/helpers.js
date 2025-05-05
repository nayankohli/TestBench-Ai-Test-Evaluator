const crypto = require('crypto');
const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.API_KEY,
});

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'salt_key', 1000, 64, 'sha512').toString('hex');
}

function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array(6).fill(0).map(() => characters[Math.floor(Math.random() * characters.length)]).join('');
}

async function evaluateAnswer(question, answer) {
  try {
    if (!answer || answer.trim() === '') {
      console.log('Empty answer received, returning 0 score');
      return 0;
    }

    let maxScore = question.marks || 5; 
    
    const prompt = `
You are an AI academic evaluator tasked with grading test answers. Your role is to assess the student's response and assign a score from 0 to ${maxScore}.

QUESTION:
${question.question}

CORRECT ANSWER:
${question.answer}

STUDENT'S ANSWER:
${answer}

QUESTION TYPE: ${question.type || "Standard question"}
MAXIMUM MARKS: ${maxScore}

MARKING CRITERIA:
- ${maxScore}/${maxScore}: Complete and perfect answer demonstrating thorough understanding
- ${Math.ceil(maxScore*0.8)}/${maxScore}: Very good answer with minor omissions or errors
- ${Math.ceil(maxScore*0.6)}/${maxScore}: Satisfactory answer showing basic understanding but with significant gaps
- ${Math.ceil(maxScore*0.4)}/${maxScore}: Partial answer with major conceptual errors or omissions
- ${Math.ceil(maxScore*0.2)}/${maxScore}: Minimal relevant content, showing little understanding
- 0/${maxScore}: No answer or completely incorrect response

Evaluate this answer carefully. Provide your score and brief reasoning in this format:
SCORE: [numerical score from 0-${maxScore}]
REASONING: [1-2 sentence explanation for score]
`;

    const result = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const responseText = result.content[0]?.text.trim();
    console.log('Evaluation response:', responseText);
    
    const scoreMatch = responseText.match(/SCORE:\s*(\d+(?:\.\d+)?)/i);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
 
    const normalizedScore = Math.max(0, Math.min(maxScore, score));
    
    console.log(`Question evaluated. Score: ${normalizedScore}/5`);
    return normalizedScore;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return 0;
  }
}

async function generateQuestions(subject, topic, oneMarkerCount, twoMarkerCount, fiveMarkerCount) {
  let allQuestions = [];
  let questionId = 1;
  
  async function getQuestions(count, marks, description) {
    if (count <= 0) return [];
    
    const prompt = `
      Generate ${count} questions for subject: ${subject}, topic: ${topic}.
      These should be ${description}.
      Format the response as a JSON array with each question having the following structure:
      {
        "question": "question text",
        "answer": "model answer that would receive full marks"
      }
      Respond only with the JSON array.
    `;

    try {
      const result = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      const text = result.content[0]?.text || '';
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      let parsedQuestions = [];
      
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\\n/g, '\\n')
            .replace(/\\r/g, '\\r')
            .replace(/\\t/g, '\\t');
          
          parsedQuestions = JSON.parse(jsonStr);
          
        } catch (e) {
          console.error('JSON parsing failed:', e);
          try {
            const fixedJson = jsonMatch[0]
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\t/g, ' ')
              .replace(/"\s+"/g, '" "')
              .replace(/([^\\])\\([^"\\/bfnrtu])/g, '$1\\\\$2');
            
            parsedQuestions = JSON.parse(fixedJson);
          } catch (fallbackError) {
            console.error('Fallback JSON parsing also failed:', fallbackError);
            return [];
          }
        }
      } else {
        console.error('No JSON array found in response');
        return [];
      }
      
      return parsedQuestions.map(q => {
        return {
          id: `q${questionId++}`,
          type: `${marks}-marker`,
          question: q.question,
          answer: q.answer,
          marks: marks
        };
      });
    } catch (error) {
      console.error(`Error generating ${marks}-marker questions:`, error);
      return [];
    }
  }

  try {
    const oneMarkers = await getQuestions(oneMarkerCount, 1, 'basic knowledge questions');
    const twoMarkers = await getQuestions(twoMarkerCount, 2, 'questions requiring explanation or application');  
    const fiveMarkers = await getQuestions(fiveMarkerCount, 5, 'in-depth analytical or descriptive questions');
    
    allQuestions = [...oneMarkers, ...twoMarkers, ...fiveMarkers];
    
    console.log(`Generated: ${oneMarkers.length} one-markers, ${twoMarkers.length} two-markers, ${fiveMarkers.length} five-markers`);
    
    return allQuestions;
  } catch (error) {
    console.error('Error in question generation:', error);
    throw error;
  }
}
  

module.exports = {
  hashPassword,
  generateCode,
  evaluateAnswer,
  generateQuestions
};
