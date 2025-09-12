## Krishna AI – Project Report

### Overview
Krishna AI is a lightweight web chat application that connects a browser UI to an AI backend (OpenAI or Google Gemini). The app now supports multilingual UI and responses (Hindi and English) with a simple in-browser i18n system and server-side language-aware prompts.

### Objectives
- Provide a fast, minimal chat UI with local history display
- Persist session histories on the server with a simple JSON store
- Offer multiple response “themes” (Modern, Celebratory, Traditional)
- Enable multilingual experience (UI text and assistant outputs)

### Key Features
- Multilingual UI (Hindi/English) with runtime switching and persistence
- Language-aware assistant responses (server adapts prompts by selected language)
- Speech-to-text input (when supported by the browser) with language switching
- Session list and history management (wipe current session / wipe all)
- Theming style hint passed to the model (Modern/Celebratory/Traditional)

### Architecture
- Frontend: Static assets served from `public/`
  - `public/index.html`: HTML structure, theme and language selectors, i18n hooks
  - `public/js/app.js`: Chat logic, i18n dictionaries, UI bindings, speech recognition
  - `public/css/style.css`: Modern, responsive styling
- Backend: `server.js` (Express)
  - Serves static files and provides JSON endpoints
  - Manages sessions in memory with persistence to `data/history.json`
  - Integrates with OpenAI or Google Gemini based on environment variables

### Internationalization Design
- UI strings are controlled via `data-i18n` and `data-i18n-attr` attributes in `index.html`
- `app.js` defines translation dictionaries for `hi` and `en`
- Selected language is saved in `localStorage` and applied at load
- Speech recognition switches between `hi-IN` and `en-US`
- `app.js` includes `lang` in the `/api/chat` request; `server.js` builds a language-specific system prompt and localizes deterministic replies (weekday responses)

### API Endpoints
- `POST /api/chat`: { messages, theme, lang } → { reply }
- `GET /api/history`: Returns current session history
- `DELETE /api/history`: Starts a fresh session (previous is kept in the store)
- `GET /api/sessions`: Returns metadata about all stored sessions
- `DELETE /api/history/all`: Clears all stored sessions
- `GET /health`: Health check

### Configuration
Environment variables (.env):
- `OPENAI_API_KEY` or `GOOGLE_API_KEY` (one required)
- `MODEL` (optional, defaults: `gpt-4o-mini` or `gemini-1.5-flash-8b`)
- `PORT` (optional, default 3000)

### Setup & Run
1. Install dependencies:
```bash
npm install
```
2. Create `.env` with at least one provider key:
```bash
OPENAI_API_KEY=sk-...
# or
GOOGLE_API_KEY=...
```
3. Start the server:
```bash
npm start
```
4. Open the app: `http://localhost:3000`

### Usage Notes
- Use the Language selector to switch between Hindi and English UI/answers
- Use Theme selector to influence response style
- Click the mic to dictate (if supported); recognition language follows the selected UI language
- Use Clear to start a new session; use Wipe to delete all stored sessions

### Data Persistence
- Session histories are stored in-memory and periodically persisted to `data/history.json`
- Wiping all sessions empties both memory and the JSON file

### Security Considerations
- API keys must never be exposed to the client; keep them in `.env`
- Cookies store only a session id (`sid`), marked HttpOnly and SameSite=Lax

### Testing Checklist
- Switch between Hindi/English and verify all UI labels update
- Send prompts in either language; server replies in selected language
- Try the mic button; ensure recognition language follows selector
- Verify theme effect by switching themes and comparing response tone
- Confirm history management: Clear current session vs Wipe all sessions

### Future Improvements
- Add more languages via the same i18n pattern
- Persist language and theme per session on the server
- Streaming responses for better perceived latency
- Rich message rendering (markdown/code formatting)
- User authentication and per-user session indexing


