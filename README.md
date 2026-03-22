# 🇮🇳 Krishna AI — हिन्दी चैटबॉट

> An AI-powered conversational chatbot that thinks, speaks, and responds in Hindi — built for Hindi Diwas and beyond.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Hindi Diwas](https://img.shields.io/badge/हिन्दी_दिवस-Special_Edition-FF9933?style=flat-square)

---

## ✨ Features

- 💬 **Full Hindi conversations** — responds naturally in Devanagari script
- 🎨 **Three personality themes** — switch between Utsav, Aadhunik, and Paramparik styles
- ⚡ **Live reload dev server** — instant feedback while building
- 🔌 **OpenAI & Google AI support** — plug in your preferred API key
- 🌐 **Browser-based** — runs locally, opens in any web browser

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- An OpenAI API key (or Google AI API key)

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
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here   # optional
PORT=3000
# MODEL=gpt-4o-mini                   # uncomment to override default model
```

### 4. Run the dev server

```bash
npm run dev
```

Then open your browser at: **http://localhost:3000**

---

## 🎨 Themes

Choose a personality style for the chatbot — configurable in settings or via the UI:

| Theme | Hindi | Description |
|---|---|---|
| `utsav` | उत्सव | Festive and positive — celebratory tone |
| `aadhunik` | आधुनिक | Modern and conversational *(default)* |
| `paramparik` | परम्परागत | Traditional, using pure classical Hindi |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with auto-reload |
| `npm start` | Start production server |

---

## 🔧 Configuration

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes* | Your OpenAI API key |
| `GOOGLE_API_KEY` | No | Google AI API key (alternative) |
| `PORT` | No | Server port (default: `3000`) |
| `MODEL` | No | Override the default AI model |

*Either `OPENAI_API_KEY` or `GOOGLE_API_KEY` must be set.

---

## 📁 Project Structure

```
Ai-HindiChatbot/
├── .env               # Environment variables (not committed)
├── package.json
├── server.js          # Express server entry point
└── public/            # Frontend assets
    ├── index.html
    ├── style.css
    └── app.js
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ❤️ for Hindi भाषा &nbsp;|&nbsp; हिन्दी दिवस Special 🇮🇳
</div>
