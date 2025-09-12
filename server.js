import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// In-memory session store with JSON file persistence
const sessions = new Map(); // sid -> [{ role, content }]
const dataDir = path.join(process.cwd(), "data");
const historyFile = path.join(dataDir, "history.json");

function loadHistoryFromFile(){
  try{
    if(fs.existsSync(historyFile)){
      const raw = fs.readFileSync(historyFile, "utf8");
      const obj = JSON.parse(raw || "{}");
      for(const [sid, arr] of Object.entries(obj)){
        if(Array.isArray(arr)) sessions.set(sid, arr);
      }
    }
  }catch(e){ console.warn("Failed to load history.json", e.message); }
}
function saveHistoryToFile(){
  try{
    if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const obj = Object.fromEntries(sessions);
    fs.writeFileSync(historyFile, JSON.stringify(obj, null, 2), "utf8");
  }catch(e){ console.warn("Failed to save history.json", e.message); }
}
loadHistoryFromFile();

const systemPrompts = {
  hi:
    "आप 'कृष्ण AI' हैं — एक स्पष्ट, संक्षिप्त हिन्दी सहायक। हमेशा सीधे उत्तर दें: बिना अभिवादन/परिचय के, 2–4 वाक्य या छोटे बुलेट बिंदु। जहाँ ज़रूरी हो तभी संक्षिप्त स्पष्टीकरण/उदाहरण जोड़ें। उपयोगकर्ता किसी भी भाषा में लिखे, उत्तर स्वाभाविक हिन्दी में दें और अनावश्यक दोहराव से बचें।",
  en:
    "You are 'Krishna AI' — a clear, concise assistant. Always answer directly: no greetings/introductions, 2–4 sentences or short bullet points. Add brief explanations/examples only when helpful. Regardless of the user's input language, respond naturally in English and avoid unnecessary repetition."
};

function buildSystemPrompt(lang, theme){
  const base = systemPrompts[lang] || systemPrompts.hi;
  const style = theme === "utsav"
    ? (lang === 'en'
        ? " Keep a light celebratory tone: positivity, inclusivity, and warmth."
        : " उत्तरों में हल्का-सा उत्सव का रंग रखें: सकारात्मकता, समावेश और आत्मीयता।")
    : theme === "paramparik"
    ? (lang === 'en'
        ? " Use a traditional and formal register, while staying approachable."
        : " उत्तर पारंपरिक और शुद्ध शैली में रखें, किन्तु सहजता न खोएँ।")
    : theme === "aadhunik"
    ? (lang === 'en'
        ? " Use a modern, concise, conversational style."
        : " उत्तर आधुनिक, संक्षिप्त और संवादात्मक शैली में रखें।")
    : "";
  return base + style;
}

function getOrSetSessionId(req, res) {
  const cookie = req.headers.cookie || "";
  const found = /sid=([^;]+)/.exec(cookie);
  if (found && found[1]) return found[1];
  const sid = crypto.randomUUID();
  res.setHeader(
    "Set-Cookie",
    `sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  );
  return sid;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, theme, lang: reqLang } = req.body || {};
    const lang = reqLang === 'en' ? 'en' : 'hi';

    const sid = getOrSetSessionId(req, res);
    if (!sessions.has(sid)) sessions.set(sid, []);
    const history = sessions.get(sid);

    const useGemini = !!process.env.GOOGLE_API_KEY;
    if (!useGemini && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Configure GOOGLE_API_KEY or OPENAI_API_KEY" });
    }

    const systemContent = buildSystemPrompt(lang, theme);

    const model = process.env.MODEL || (useGemini ? "gemini-1.5-flash-8b" : "gpt-4o-mini");
    // Merge prior session history with latest user message(s)
    const latest = Array.isArray(messages) ? messages : [];
    for (const m of latest) {
      if (m.role === "user") history.push({ role: "user", content: m.content });
    }
    const sessionWindow = history.slice(-8); // smaller context → faster

    // Fast path: handle "which day is X/today" deterministically (IST)
    const lastUser = [...sessionWindow].reverse().find(m => m.role === 'user');
    if (lastUser) {
      const q = (lastUser.content || "").toLowerCase();
      const askDay = /(kaun\s*sa\s*din|konsa\s*din|what\s*day|weekday|कौन\s*सा\s*दिन|किस\s*दिन|आज\s*कौन\s*सा\s*दिन)/.test(q);
      const monthMap = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};
      const mMatch = q.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\w*\s*(\d{4})?/);

      function formatDay(d){
        const daysHi = ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];
        const daysEn = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        return (lang === 'en' ? daysEn : daysHi)[d.getDay()];
      }
      function nowIST(){
        const now = new Date();
        // Convert to IST by adding offset difference
        const istOffsetMin = 330; // UTC+5:30
        const localOffsetMin = -now.getTimezoneOffset();
        const deltaMs = (istOffsetMin - localOffsetMin) * 60 * 1000;
        return new Date(now.getTime() + deltaMs);
      }

      if (askDay || mMatch) {
        let targetDate;
        if (mMatch) {
          const day = parseInt(mMatch[1],10);
          const mon = monthMap[mMatch[2]];
          const year = mMatch[3] ? parseInt(mMatch[3],10) : nowIST().getFullYear();
          targetDate = new Date(Date.UTC(year, mon, day, 0, 0, 0));
          // shift to IST
          targetDate = new Date(targetDate.getTime() + (330*60*1000));
        } else {
          targetDate = nowIST();
        }
        const dayName = formatDay(targetDate);
        const reply = askDay && !mMatch
          ? (lang === 'en' ? `Today is ${dayName}.` : `आज ${dayName} है।`)
          : (lang === 'en' ? `${dayName}.` : `${dayName}।`);
        history.push({ role: 'assistant', content: reply });
        saveHistoryToFile();
        return res.json({ reply });
      }
    }

    let text = "";
    if(useGemini){
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const modelClient = genAI.getGenerativeModel({ model });
      const userLabel = lang === 'en' ? 'User' : 'उपयोगकर्ता';
      const assistantLabel = lang === 'en' ? 'Assistant' : 'सहायक';
      const prompt = [systemContent, ...sessionWindow.map(m => `${m.role === 'user' ? userLabel : assistantLabel}: ${m.content}`)].join("\n\n");
      const result = await modelClient.generateContent(prompt);
      text = result.response?.text?.() || "";
    } else {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemContent },
          ...sessionWindow
        ],
        temperature: 0.5
      });
      text = response.choices?.[0]?.message?.content ?? "";
    }
    history.push({ role: "assistant", content: text });
    saveHistoryToFile();
    return res.json({ reply: text });
  } catch (err) {
    console.error("/api/chat error", err);
    return res.status(500).json({ error: "Chat request failed" });
  }
});

app.get("/api/history", (req, res) => {
  const sid = getOrSetSessionId(req, res);
  const history = sessions.get(sid) || [];
  res.json({ history });
});

app.delete("/api/history", (req, res) => {
  // Preserve existing session history (so it remains in JSON and sessions list)
  // and start a fresh session by issuing a new sid cookie.
  getOrSetSessionId(req, res); // ensure old cookie exists, but we don't delete old data
  const newSid = crypto.randomUUID();
  sessions.set(newSid, []);
  res.setHeader(
    "Set-Cookie",
    `sid=${newSid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  );
  saveHistoryToFile();
  res.json({ ok: true, sid: newSid });
});

// All sessions list (simple metadata)
app.get("/api/sessions", (_req, res) => {
  const list = [];
  for (const [sid, msgs] of sessions.entries()) {
    if (!Array.isArray(msgs) || msgs.length === 0) continue; // hide empty sessions
    const last = msgs[msgs.length - 1];
    list.push({ sid, count: msgs.length, last: last?.content?.slice(0, 60) || "" });
  }
  list.sort((a, b) => b.count - a.count);
  res.json({ sessions: list });
});

// Delete all sessions from persistent store
app.delete("/api/history/all", (_req, res) => {
  sessions.clear();
  try {
    if (fs.existsSync(historyFile)) fs.writeFileSync(historyFile, "{}", "utf8");
  } catch (e) {
    console.warn("Failed to wipe history.json", e.message);
  }
  res.json({ ok: true });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Krishna AI Hindi server running on http://localhost:${port}`);
});


