const $messages = document.getElementById("messages");
const $form = document.getElementById("chat-form");
const $input = document.getElementById("user-input");
const $theme = document.getElementById("theme");
const $lang = document.getElementById("lang");
let $toast;
const $mic = document.getElementById('mic');
const $clear = document.getElementById('clear');
const $wipeStore = document.getElementById('wipe-store');
const $historyList = document.getElementById('history-list');
const $sidebarToggle = document.getElementById('sidebar-toggle');

// i18n dictionaries and helpers
const translations = {
  hi: {
    tagline: 'ज्ञान और तकनीक का संगम',
    language_label: 'भाषा:',
    theme_label: 'थीम:',
    theme_utsav: 'उत्सव (Celebratory)',
    theme_modern: 'आधुनिक (Modern)',
    theme_classic: 'परम्परागत (Traditional)',
    clear: 'साफ़',
    sidebar_title: 'इतिहास',
    wipe_all: 'मिटाएँ',
    mic_label: 'बोलकर लिखें',
    input_placeholder: 'अपना संदेश लिखें…',
    send: 'भेजें',
    hint: 'सूचना: उत्तर स्वचालित रूप से हिन्दी में दिए जाते हैं।',
    greet: 'नमस्ते! मैं ‘कृष्ण AI’ हूँ। आप किस विषय पर बात करना चाहेंगे?',
    thinking: 'सोच रहा हूँ…',
    server_error_cfg: 'सर्वर कॉन्फ़िगरेशन शेष है। कृपया API कुंजी जोड़ें।',
    server_error_generic: 'त्रुटि हुई। कृपया पुनः प्रयास करें।',
    reply_fallback: 'क्षमा करें, अभी उत्तर उपलब्ध नहीं है।',
    sr_listening: 'बोलिए…',
    sr_done: 'आवाज़ को पाठ में बदला गया',
    sr_error: 'आवाज़ समझने में दिक्कत—कृपया दोबारा प्रयास करें',
    sr_unsupported: 'यह ब्राउज़र आवाज़ पहचान सपोर्ट नहीं करता',
    cleared: 'इतिहास मिटा दिया गया',
    clear_failed: 'साफ़ नहीं कर पाए',
    confirm_wipe_all: 'सभी सेशन्स का डेटाबेस इतिहास मिटाया जाएगा. जारी रखें?',
    wiped_all: 'डेटाबेस इतिहास मिटा दिया गया',
    sessions_count: (count) => `(${count} संदेश)`
  },
  en: {
    tagline: 'Where knowledge meets technology',
    language_label: 'Language:',
    theme_label: 'Theme:',
    theme_utsav: 'Celebratory',
    theme_modern: 'Modern',
    theme_classic: 'Traditional',
    clear: 'Clear',
    sidebar_title: 'History',
    wipe_all: 'Wipe',
    mic_label: 'Dictate',
    input_placeholder: 'Type your message…',
    send: 'Send',
    hint: 'Note: Answers are given in your selected language.',
    greet: 'Hello! I am Krishna AI. What would you like to talk about?',
    thinking: 'Thinking…',
    server_error_cfg: 'Server configuration pending. Please add API key.',
    server_error_generic: 'An error occurred. Please try again.',
    reply_fallback: 'Sorry, no reply available right now.',
    sr_listening: 'Listening…',
    sr_done: 'Converted speech to text',
    sr_error: 'Could not understand speech—please try again',
    sr_unsupported: 'This browser does not support speech recognition',
    cleared: 'History cleared',
    clear_failed: 'Could not clear',
    confirm_wipe_all: 'All session history will be deleted. Continue?',
    wiped_all: 'Database history cleared',
    sessions_count: (count) => `(${count} messages)`
  }
};

function getLang(){
  const stored = localStorage.getItem('lang');
  if(stored) return stored;
  if($lang && $lang.value) return $lang.value;
  return (navigator.language || 'hi').toLowerCase().startsWith('en') ? 'en' : 'hi';
}

function applyI18n(){
  const lang = getLang();
  document.documentElement.lang = lang;
  const dict = translations[lang] || translations.hi;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(key && key in dict && typeof dict[key] !== 'function') el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const map = el.getAttribute('data-i18n-attr');
    map.split(',').forEach(pair => {
      const [attr, key] = pair.split(':');
      const val = dict[key?.trim()];
      if(attr && key && typeof val !== 'function' && val) el.setAttribute(attr.trim(), val);
    });
  });
  document.querySelectorAll('option[data-i18n]').forEach(opt => {
    const key = opt.getAttribute('data-i18n');
    const val = dict[key];
    if(typeof val !== 'function' && val) opt.textContent = val;
  });
}

function tVal(key){
  const dict = translations[getLang()] || translations.hi;
  return dict[key];
}

/**
 * Render a chat message
 */
function renderMessage({ role, content }){
  const wrapper = document.createElement("div");
  wrapper.className = `msg ${role === "user" ? "user" : "bot"}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "👤" : "✨";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const p = document.createElement("p");
  p.textContent = content;
  bubble.appendChild(p);
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  $messages.appendChild(wrapper);
  $messages.scrollTop = $messages.scrollHeight;
}

function setThinking(state){
  if(state){
    const thinking = document.createElement("div");
    thinking.className = "msg bot";
    thinking.id = "thinking";
    const txt = tVal('thinking') || '…';
    thinking.innerHTML = `<div class=\"avatar\">✨</div><div class=\"bubble emph\"><p>${txt}</p></div>`;
    $messages.appendChild(thinking);
    $messages.scrollTop = $messages.scrollHeight;
  } else {
    const el = document.getElementById("thinking");
    if(el) el.remove();
  }
}

const history = [];

async function loadHistory(){
  try{
    const r = await fetch('/api/history');
    const data = await r.json();
    $messages.innerHTML = '';
    renderMessage({ role: "bot", content: tVal('greet') });
    for(const m of data.history || []){
      renderMessage({ role: m.role === 'assistant' ? 'bot' : 'user', content: m.content });
    }
    refreshSessions();
  }catch(_e){
    // ignore
  }
}

// Initialize i18n and bind selector
if($lang){
  const initial = getLang();
  $lang.value = initial;
  applyI18n();
  $lang.addEventListener('change', () => {
    localStorage.setItem('lang', $lang.value);
    applyI18n();
  });
} else {
  applyI18n();
}

loadHistory();

$form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $input.value.trim();
  if(!text) return;

  renderMessage({ role: "user", content: text });
  history.push({ role: "user", content: text });
  $input.value = "";

  setThinking(true);
  try{
    const resp = await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ messages: history.slice(-12), theme: $theme.value, lang: getLang() })
    });
    const data = await resp.json();
    if(!resp.ok){
      const errMsg = data && data.error ? data.error : 'Server error';
      throw new Error(errMsg);
    }
    setThinking(false);
    const reply = data.reply || tVal('reply_fallback');
    renderMessage({ role: "bot", content: reply });
    history.push({ role: "assistant", content: reply });
  } catch(err){
    setThinking(false);
    const msg = String(err?.message || err);
    const friendly = (msg.includes('OPENAI_API_KEY') || msg.includes('GOOGLE_API_KEY')) ? tVal('server_error_cfg') : tVal('server_error_generic');
    renderMessage({ role: "bot", content: friendly });
    showToast(friendly);
  }
});

// Optional: expose clear history
document.addEventListener('keydown', async (e) => {
  if(e.key === 'Escape' && (e.ctrlKey || e.metaKey)){
    await fetch('/api/history', { method: 'DELETE' });
    history.length = 0;
    loadHistory();
  }
});

function showToast(text){
  if(!$toast){
    $toast = document.createElement('div');
    $toast.style.position = 'fixed';
    $toast.style.left = '50%';
    $toast.style.top = '10px';
    $toast.style.transform = 'translateX(-50%)';
    $toast.style.background = 'rgba(255,183,3,.12)';
    $toast.style.border = '1px solid rgba(255,183,3,.45)';
    $toast.style.padding = '8px 12px';
    $toast.style.borderRadius = '10px';
    $toast.style.color = '#ffdd8a';
    $toast.style.zIndex = '999';
    document.body.appendChild($toast);
  }
  $toast.textContent = text;
  $toast.style.opacity = '1';
  clearTimeout($toast._t);
  $toast._t = setTimeout(()=>{$toast.style.opacity='0'}, 3000);
}

// Browser speech recognition (if available)
if($mic){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SR){
    const recog = new SR();
    recog.lang = (getLang() === 'en') ? 'en-US' : 'hi-IN';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    $mic.addEventListener('click', () => {
      try{
        recog.start();
        showToast(tVal('sr_listening'));
      }catch(_e){
        // already started
      }
    });
    recog.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || '';
      if(text) $input.value = text;
      showToast(tVal('sr_done'));
    };
    recog.onerror = () => showToast(tVal('sr_error'));
  } else {
    $mic.addEventListener('click', () => showToast(tVal('sr_unsupported')));
  }
}

// Clear history button
if($clear){
  $clear.addEventListener('click', async () => {
    try{
      await fetch('/api/history', { method: 'DELETE' });
      history.length = 0;
      loadHistory();
      showToast(tVal('cleared'));
    }catch(_e){ showToast(tVal('clear_failed')); }
  });
}

async function refreshSessions(){
  if(!$historyList) return;
  try{
    const r = await fetch('/api/sessions');
    const data = await r.json();
    $historyList.innerHTML = '';
    for(const s of data.sessions || []){
      const li = document.createElement('li');
      const countFmt = tVal('sessions_count');
      li.textContent = s.last || (typeof countFmt === 'function' ? countFmt(s.count) : `(${s.count})`);
      li.title = `sid: ${s.sid}\nकुल: ${s.count}`;
      $historyList.appendChild(li);
    }
  }catch(_e){ /* ignore */ }
}

// Sidebar show/hide by clicking the sidebar head title
$sidebarToggle?.addEventListener('click', (e) => {
  // avoid when pressing wipe button
  if(e.target instanceof HTMLElement && e.target.id === 'wipe-store') return;
  const sidebar = document.querySelector('.sidebar-fixed');
  if(!sidebar) return;
  sidebar.classList.toggle('minimized');
});
if($wipeStore){
  $wipeStore.addEventListener('click', async () => {
    const msg = tVal('confirm_wipe_all') || 'Confirm?';
    if(!confirm(msg)) return;
    await fetch('/api/history/all', { method: 'DELETE' });
    history.length = 0;
    loadHistory();
    refreshSessions();
    showToast(tVal('wiped_all'));
  });
}

// (Voice input removed as requested)

