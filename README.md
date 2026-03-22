# 🇮🇳 Krishna AI — हिन्दी चैटबॉट

> A fast, multilingual AI chat app with Hindi & English support, multiple themes, speech-to-text, and persistent session history — powered by OpenAI or Google Gemini.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=flat-square&logo=google&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Hindi Diwas](https://img.shields.io/badge/हिन्दी_दिवस-Special_Edition-FF9933?style=flat-square)

---

## ✨ Features

- 🌐 **Multilingual UI** — switch between Hindi and English at runtime; preference is saved across sessions
- 🤖 **Language-aware AI responses** — server adapts prompts based on selected language, so the assistant replies in Hindi or English accordingly
- 🎙️ **Speech-to-text input** — dictate messages using your microphone; recognition language follows the UI selector (`hi-IN` / `en-US`)
- 🎨 **Three response themes** — influence the assistant's tone and style
- 🗂️ **Session history management** — clear the current session or wipe all stored sessions
- 💾 **Persistent history** — sessions are stored server-side in a JSON file and survive restarts
- ⚡ **Minimal & fast** — static frontend, lightweight Express backend, no database required

---

## 🎨 Themes

| Theme | Hindi | Style |
|---|---|---|
| `aadhunik` | आधुनिक | Modern, conversational *(default)* |
| `utsav` | उत्सव | Festive and celebratory |
| `paramparik` | परम्परागत | Traditional, pure classical Hindi |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│         Browser (UI)        │        │      Express Server       │
│                             │        │        server.js          │
│  index.html  ←─ i18n ──►  │        │                          │
│  app.js      (hi / en)      │──POST─►│  /api/chat               │
│  style.css                  │        │  Builds language-aware   │
│                             │◄──────│  system prompt           │
│  Speech Recognition         │        │  Routes to OpenAI or     │
│  (hi-IN / en-US)            │        │  Google Gemini           │
└─────────────────────────────┘        │                          │
                                       │  data/history.json       │
                                       │  (session persistence)   │
                                       └──────────────────────────┘
```

**Frontend** (`public/`)
- `index.html` — HTML structure with `data-i18n` hooks for language switching
- `js/app.js` — Chat logic, i18n dictionaries, UI bindings, speech recognition
- `css/style.css` — Modern, responsive styling

**Backend** (`server.js`)
- Serves static files and JSON API endpoints
- Manages sessions in memory with persistence to `data/history.json`
- Selects OpenAI or Gemini based on available environment variables

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- An API key from [OpenAI](https://platform.openai.com/) **or** [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository

```bash
git clone https://github.com/Krishna-Avii/Ai-HindiChatbot.git
cd Ai-HindiChatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the project root:

```env
# At least one provider key is required
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

PORT=3000

# Optional: override the default model
# MODEL=gpt-4o-mini
# MODEL=gemini-1.5-flash-8b
```

> **Note:** API keys are never sent to the client. They are used only on the server.

### 4. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Open your browser at **http://localhost:3000**

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message. Body: `{ messages, theme, lang }` |
| `GET` | `/api/history` | Get current session history |
| `DELETE` | `/api/history` | Clear current session (previous is archived) |
| `GET` | `/api/sessions` | List metadata for all stored sessions |
| `DELETE` | `/api/history/all` | Wipe all stored sessions |
| `GET` | `/health` | Health check |

---

## ⚙️ Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | One of these | — | OpenAI API key |
| `GOOGLE_API_KEY` | One of these | — | Google Gemini API key |
| `MODEL` | No | `gpt-4o-mini` / `gemini-1.5-flash-8b` | Override the AI model |
| `PORT` | No | `3000` | Server port |

---

## 🗂️ Project Structure

```
Ai-HindiChatbot/
├── public/
│   ├── index.html        # App shell with i18n attribute hooks
│   ├── js/
│   │   └── app.js        # Chat logic, i18n, speech recognition
│   └── css/
│       └── style.css     # Responsive UI styles
├── data/
│   └── history.json      # Persisted session store (auto-created)
├── server.js             # Express server & AI integration
├── .env                  # Environment variables (not committed)
├── package.json
└── README.md
```

---

## 🔒 Security Notes

- All API keys live in `.env` and are **never** exposed to the browser
- Session cookies store only a session ID (`sid`), set as `HttpOnly` and `SameSite=Lax`
- `.env` is listed in `.gitignore` — never commit it

---

## 🗺️ Roadmap

- [ ] Streaming responses for lower perceived latency
- [ ] Markdown / code block rendering in chat
- [ ] More languages via the same i18n pattern
- [ ] Per-session language and theme persistence on the server
- [ ] User authentication with per-user session indexing

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ❤️ for Hindi भाषा &nbsp;|&nbsp; हिन्दी दिवस Special 🇮🇳
</div>
