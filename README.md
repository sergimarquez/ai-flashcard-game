# AI Flashcard Game

A frontend coding challenge game powered by AI. Players answer coding questions on various topics and levels, testing their knowledge in HTML, CSS, JavaScript, and React.

## Features
- Multiple levels with increasing difficulty
- Answer questions and level up
- Track your progress and lives
- API integration with OpenAI to generate questions dynamically

## Requirements
- Node.js >= 14.0
- npm (Node Package Manager)

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sergimarquez/ai-flashcard-game.git
cd ai-flashcard-game
```

### 2. Install Dependencies
Run the following command to install all required dependencies:

```bash
npm install
```

### 3. Set Up Environment Variables
To use the OpenAI API, set up your API key:

1. Create a `.env.local` file in the root directory of the project.
2. Add your API key to the `.env.local` file:

```bash
OPENAI_API_KEY=your_api_key_here
```

### 4. Run the App Locally
After installing dependencies and setting up your environment variables, start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000). Open this URL in your browser to play the game.

---

Enjoy coding and testing your knowledge with AI-powered flashcards!

