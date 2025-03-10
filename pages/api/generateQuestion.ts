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
    const prompt = `
    Generate a **NEW** frontend coding multiple-choice question for Level ${level} (difficulty 0-10).
    The question must be related to one of these topics: ${topics.join(', ')}.
    
    **Rules:**
    - The question must have **exactly 4 answer choices**, with **1 correct answer**.
    - The format must be **valid JSON**, structured as:
    {
      "question": "What does CSS stand for?",
      "options": [
        "Cascading Style Sheets",
        "Creative Style Sheets",
        "Computer Style Sheets",
        "Colorful Style Sheets"
      ],
      "correctAnswer": "Cascading Style Sheets",
      "explanation": "CSS stands for Cascading Style Sheets, which is used to style web pages."
    }
    
    **Generate unique, varied, and engaging questions. No duplicates.**
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
