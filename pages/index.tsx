import { useState } from 'react'

export default function Home() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['HTML'])
  const [questionData, setQuestionData] = useState(null)
  const [loading, setLoading] = useState(false)

  const allTopics = ['HTML', 'CSS', 'JavaScript', 'React']

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    )
  }

  const generateQuestion = async () => {
    setLoading(true)
    setQuestionData(null)

    const response = await fetch('/api/generateQuestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics: selectedTopics }),
    })

    const data = await response.json()
    setQuestionData(data)
    setLoading(false)
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">AI-Powered Flashcard Game (Mock Version)</h1>

      <div className="mt-4">
        <p className="font-semibold">Select Topics:</p>
        <div className="flex flex-wrap gap-2">
          {allTopics.map(topic => (
            <button
              key={topic}
              className={`p-2 rounded border ${
                selectedTopics.includes(topic) ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-200 border-gray-400'
              }`}
              onClick={() => toggleTopic(topic)}
            >
              {selectedTopics.includes(topic) ? `✅ ${topic}` : topic}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold">Selected Topics:</p>
        <p className="text-blue-600">
          {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None'}
        </p>
      </div>

      <button
        className="mt-4 p-2 bg-green-500 text-white rounded"
        onClick={generateQuestion}
        disabled={loading || selectedTopics.length === 0}
      >
        {loading ? 'Generating...' : 'Generate Question'}
      </button>

      {questionData && (
        <div className="mt-4 p-4 border rounded">
          <p className="text-lg font-semibold">{questionData.question}</p>
          <p className="text-gray-500">Answer: {questionData.answer}</p>
          <p className="text-sm text-blue-400">{questionData.funFact}</p>
        </div>
      )}
    </div>
  )
}
