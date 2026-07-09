# Ollama Studio AI

A production-ready ChatGPT-style assistant for locally hosted Ollama models. It includes streaming responses, model detection, conversation history, Markdown rendering, code highlighting, search, export, settings, voice input, text-to-speech, PWA basics, and a polished responsive UI.

## Features

- Local Ollama integration through `http://localhost:11434`
- Express proxy for `/api/chat`, `/api/generate`, and `/api/tags`
- Streaming AI responses with typing indicators
- Conversation history stored in LocalStorage
- New, rename, delete, clear, pin, favorite, tag, and search conversations
- Model selector with installed model detection
- Markdown, GitHub-flavored Markdown, and syntax-highlighted code blocks
- Copy message and copy code buttons
- Regenerate, retry, and edit user messages
- TXT, Markdown, PDF, and code file upload metadata
- Export as Markdown, TXT, JSON, and PDF
- Dark and light themes, font size, streaming speed, temperature, max tokens, and system prompt settings
- Voice input and text-to-speech where browser support is available
- Responsive layout, keyboard shortcuts, offline shell caching, and PWA manifest

## Prerequisites

Install Ollama from https://ollama.com and pull at least one model:

```bash
ollama pull llama3
ollama pull mistral
```

Make sure Ollama is running:

```bash
ollama serve
```

The app expects Ollama at:

```bash
http://localhost:11434
```

You can override this for the proxy:

```bash
OLLAMA_BASE_URL=http://localhost:11434 npm run server
```

## Setup

```bash
npm install
npm run dev
```

Frontend:

```bash
http://localhost:5174
```

Backend proxy:

```bash
http://localhost:3333
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

Frontend can deploy to Netlify or Vercel using:

```bash
npm run build
```

Use `dist` as the publish folder.

The Express backend is only a proxy. Deploy it to Render or Railway if you need a remote proxy, but local Ollama normally runs on the user's machine, so the best experience is local development or a desktop wrapper.

## Screenshots

Add screenshots to `docs/screenshots/` after running the app:

- `dashboard-dark.png`
- `chat-streaming.png`
- `settings-light.png`

## Notes

If the app shows Ollama as offline:

- Start Ollama with `ollama serve`
- Confirm models exist with `ollama list`
- Pull a model with `ollama pull llama3`
- Check the proxy health endpoint at `http://localhost:3333/api/health`
