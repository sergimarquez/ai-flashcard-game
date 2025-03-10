import { NextApiRequest, NextApiResponse } from 'next'
import dotenv from 'dotenv'

dotenv.config()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { topics, level, previousQuestions } = req.body
  const apiKey = process.env.OPENAI_API_KEY

  if (!topics || topics.length === 0) {
    return res.status(400).json({ error: 'No topics selected' })
  }

  try {
    const levelDescriptions = {
      1: 'Basic syntax and easy-to-remember concepts.',
      2: 'Common real-world coding tasks.',
      3: 'Intermediate coding tasks that require problem-solving skills.',
      4: 'Advanced coding tasks, applying core concepts.',
      5: 'Optimizations, edge cases, and debugging.',
      6: 'High-level JavaScript and React concepts, optimizations.',
      7: 'Expert-level questions focused on performance, security, or design patterns.',
      8: 'Advanced JavaScript and React internals, deep browser APIs.',
      9: 'Cutting-edge JavaScript/React techniques, extremely challenging questions.',
      10: 'Mastery-level questions covering browser internals, deep optimization, and best practices.',
    };
    
    const prompt = `
    Generate a **NEW** multiple-choice frontend coding question for a Level ${level} developer.
    Choose one of the following topics from the user's selection: ${topics.join(', ')}.
    
    **Difficulty Level Description:**
    - **Level ${level}:** ${levelDescriptions[level]}
    
    **Rules**:
    - The question must be **completely different from: ${previousQuestions.join(', ')}**
    - The question must have **exactly 4 answer choices**, with **1 correct answer**.
    - The format must be **valid JSON**, structured as:
    {
      "question": "What is the default flex-direction in CSS Flexbox?",
      "options": ["row", "column", "row-reverse", "column-reverse"],
      "correctAnswer": "row",
      "explanation": "By default, Flexbox arranges elements in a row."
    }
    
    **Ensure uniqueness, variety, and logical progression of difficulty. No duplicates.**
    `;       

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 400,
        temperature: 0.9 // 🔥 Increases randomness to ensure variety
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate question')
    }

    // Parse OpenAI response
    let questionData
    try {
      questionData = JSON.parse(data.choices?.[0]?.message?.content)
    } catch (error) {
      throw new Error('Invalid JSON format returned from AI')
    }

    res.status(200).json(questionData)
  } catch (error) {
    console.error('OpenAI API Error:', error)
    res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
