# Mira

Mira is a private, locally hosted AI companion chat powered by Ollama. It offers a focused text conversation with adjustable personality, mood, and memories while keeping the default model connection on your own computer and its safety boundaries fixed on the server.

## Features

- Freeform text chat with no preset reply choices
- Soft, playful, and focused conversation modes
- Editable companion name, personality, and vibe
- Local memories that can be added or removed at any time
- Ollama integration through an OpenAI-compatible API
- Lightweight fallback replies when the model is unavailable
- Responsive interface for desktop and mobile

## Requirements

- [Node.js](https://nodejs.org/) 22.13 or newer
- [Ollama](https://ollama.com/) installed locally
- An Ollama model such as `llama3.1:8b`

## Getting Started

1. Download the default model:

   ```powershell
   ollama pull llama3.1:8b
   ```

2. Start Ollama if it is not already running:

   ```powershell
   ollama serve
   ```

   If Ollama reports that port `11434` is already in use, it is probably already running.

3. Install the project dependencies:

   ```powershell
   npm install
   ```

4. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

5. Start the app:

   ```powershell
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Model Configuration

The default configuration connects to Ollama at `http://localhost:11434/v1` and uses `llama3.1:8b`:

```env
LOCAL_LLM_BASE_URL=http://localhost:11434/v1
LOCAL_LLM_MODEL=llama3.1:8b
LOCAL_LLM_API_KEY=ollama
```

Change `LOCAL_LLM_MODEL` in `.env.local` to use another installed model. The API key value is a placeholder for local Ollama and is not a secret. You can also point `LOCAL_LLM_BASE_URL` at another OpenAI-compatible chat-completions server.

## Privacy

By default, model requests are sent only to the Ollama server running on your computer. Companion settings and saved memories are stored in the browser's local storage. Chat messages remain in the current browser session and are not written to the project database.

If you configure a remote model URL, conversation content will be sent to that provider. Review its privacy policy before doing so. Keep real API keys in `.env.local`; environment files are ignored by Git.

## Project Commands

```powershell
npm run dev      # Start local development
npm run build    # Create a production build
npm run start    # Run the production build
npm run lint     # Check the source code
npm test         # Build and run the rendered HTML test
```

## Content Boundaries

Mira is designed as an adult, consensual fictional companion. Non-overridable server checks reject content involving minors, coercion, non-consent, and sexual impersonation of real people. They also provide a deterministic crisis response and replace model replies that pressure the user to isolate from real-world support. These checks run separately from the model prompt, so changing the character configuration cannot disable them.

## Technology

Built with React, Vinext, Vite, and the Ollama-compatible chat completions API.
