# Skilllevel

Mini-Project: Bugs will inevitably occur during development. Please report bugs via commit.

---

## QUICK-START-LOCAL

```bash
# Pasang dependensi
npm install

# Salin berkas konfigurasi lingkungan
cp .env.example .env       # Windows PowerShell: copy .env.example .env

# Jalankan server pengembangan Vite
npm run dev                # Buka http://localhost:5173
```

---

## \.env

The application uses a flexible configuration with support for dual default models and multiple backup keys:

| Variable | Default | Description |
| --- | --- | --- |
| `Mercury` | `https://api.inceptionlabs.ai/v1` | Base endpoint URL for the Mercury-3 model. |
| `Agnes` | `https://apihub.agnes-ai.com/v1` | Base endpoint URL for the Agnes 2.5 Flash model. |
| `Mercury_key` | *(Empty)* | Mercury server credentials. Supports comma-separated backup keys (`key1,key2...`). |
| `Agnes_key` | *(Server Default)* | Agnes server credentials. Supports multiple backup keys separated by commas (`key1,key2...`). |
| `AI_PROVIDER` | `openai` | API provider protocol (`openai`, `anthropic`, or `gemini`). |
| `AI_STREAMING` | `1` | `1` for incremental real-time response streaming, `0` for full responses. |
| `AI_THINKING` | `auto` | `auto` sends the reasoning parameter; `off` to disable it. |
| `AI_ALLOW_PRIVATE_ENDPOINTS` | `0` | `1` allows private hosts/localhost (for local testing only). |
| `AI_MAX_INPUT_CHARS` | `120000` | Maximum context character limit per AI request. |
| `SERVER_ENCRYPTION_KEY` | *(32-character secret)* | AES-256 symmetric encryption key for server-side token protection. |
| `VITE_SUPABASE_URL` | *(Optional)* | Supabase instance URL for authentication and cloud database synchronization. |
| `VITE_SUPABASE_ANON_KEY` | *(Optional)* | Supabase anon public key with Row Level Security enabled. |

---

## AI Configuration

Users who wish to use a custom endpoint and credentials can configure them via the **AI Settings** button on the navigation bar:

1. **Provider Protocol**: Choose from OpenAI Compatible, Anthropic Claude, or Google Gemini.
2. **Custom Endpoint**: A private HTTPS address (e.g., `https://api.openai.com/v1`).
3. **Custom API Key**: Stored only in the local browser’s session memory and never saved to a central database.
4. **Inference Parameters**: Custom settings for *Temperature* and *Max Output Tokens*.

---

## Safety control

- **SSRF (Server-Side Request Forgery) Protection**: The `validateEndpoint` function blocks non-HTTPS schemes, credentials in the URL, and private network IP addresses (`localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1`, etc.).
- **Secret Redaction**: The `sanitizeAiOutput` module filters out authorization tokens, key patterns (`sk-...`, `AIza...`), and sensitive environment variables from every AI response.
- **Anti-Looping Streaming Detection**: The `createLoopDetector` module monitors for the occurrence of noticeably repetitive sentences without interrupting normal streaming with multiple chunks.
- **Self-Contained Authentication Without OAuth Dependency**: All login data is processed using self-contained hash verification and is bidirectionally synchronized between the Supabase database and the local cache.

---

## built-in module

| No | Curriculum Module | Main Topic |
| --- | --- | --- |
| 01 | How Browsers Render Pages | HTTP request cycle, DNS, HTML parsing, DOM, CSSOM, render tree |
| 02 | Meaningful and Accessible HTML | Semantic structure, ARIA accessibility, search engine-friendly SEO navigation |
| 03 | Modern CSS, Grid & Flexbox | Responsive 2D layouts, CSS variables, auto-fit, media queries |
| 04 | JavaScript: Values, Functions, and Arrays | ES6+, destructuring, immutability, closures, higher-order functions |
| 05 | DOM, Events, and Interface State | Event bubbling, efficient event delegation, tree node manipulation |
| 06 | HTTP, REST, and Response Formats | Asynchronous JS, Promises, Fetch API, handling HTTP status codes |
| 07 | Web Servers and Databases | Node.js runtime architecture, Express REST API, relational database structures |
| 08 | Secure AI Model Integration | Prompt grounding, prompt injection mitigation, model response sanitization |
| 09 | Web Application Security | OWASP Top 10 protection, XSS sanitization, CSRF prevention, data encryption |

Each module includes conceptual material, real-world code examples, an interactive table of contents, performance tips, and a 10-question adaptive quiz.

## Command

| Command | Purpose |
| --- | --- |
| `npm run dev` | Runs the Vite development server and local AI proxy (port 5173) |
| `npm run build` | Compiles an optimized production bundle to the `dist/` directory |
| `npm start` | Runs the integrated Node.js production server (port 3000) |
| `npm run lint` | Checks the syntax validity of all 13 main JavaScript files |
| `npm test` | Runs 45 automated unit and security tests (`node --test`) |
