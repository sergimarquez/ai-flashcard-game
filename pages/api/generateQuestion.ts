import { NextApiRequest, NextApiResponse } from 'next'
import questions from '../../data/questions.json'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { topics } = req.body

  if (!topics || topics.length === 0) {
    return res.status(400).json({ error: 'No topics selected' })
  }

  let availableQuestions = []
  topics.forEach(topic => {
    if (questions[topic]) {
      availableQuestions = availableQuestions.concat(questions[topic])
    }
  })

  if (availableQuestions.length === 0) {
    return res.status(400).json({ error: 'Invalid topics selected' })
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  const questionData = availableQuestions[randomIndex]

  res.status(200).json(questionData)
}
