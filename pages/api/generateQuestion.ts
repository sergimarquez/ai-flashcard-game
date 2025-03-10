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
    Generate a **NEW** multiple-choice frontend coding question for a Level ${level} developer.
    Ensure **no repetition** and choose a diverse subtopic from: ${topics.join(', ')}.
    
    **Subtopics (Choose One Randomly Per Question)**:
    - **HTML:** Forms, Accessibility, Meta Tags, Tables, Semantic Elements, Multimedia, ARIA Roles, Web Components, HTML5 APIs, Input Types.
    - **CSS:** Flexbox, Grid, Animations, Specificity, Pseudo-classes, Units (rem, vh, %), Transitions, Variables, Media Queries, Clipping & Masking.
    - **JavaScript:** Closures, Promises, Event Delegation, \`this\` keyword, Prototypes, Scope, Async/Await, Modules, ES6 Features, Hoisting.
    - **React:** Hooks, Context API, Render Optimization, Virtual DOM, Lifecycle Methods, Error Boundaries, Suspense, Server Components, Memoization.
    
    **Difficulty Rules Per Level**:
    - **Level 1-2:** Simple syntax, fundamental concepts (easy recall).
    - **Level 3-4:** Common real-world coding tasks.
    - **Level 5-6:** Debugging, problem-solving, applying concepts.
    - **Level 7-8:** Advanced optimizations, best practices, security considerations.
    - **Level 9-10:** Expert-level browser internals, performance tuning, deep JavaScript mechanics.
    
    **Rules**:
    - The question must be **completely different from: ${previousQuestions.join(', ')}**
    - The question must have **exactly 4 answer choices**, with **1 correct answer**.
    - The format must be **valid JSON**, structured as:
    {
      "question": "What is the default flex-direction in CSS Flexbox?",
      "options": [
        "row",
        "column",
        "row-reverse",
        "column-reverse"
      ],
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
