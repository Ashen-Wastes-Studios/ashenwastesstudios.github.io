# Ashen Wastes Studios Website

The official website for Ashen Wastes Studios — a game development studio and technology research company. Hosted via [GitHub Pages](https://pages.github.com/).

## Pages

| Page | Description |
|---|---|
| `index.html` | Studio overview — hero section and work cards |
| `ai.html` | AI research areas — real-time inference, NPC intelligence, procedural systems, safety |
| `ashen-gpt.html` | Ashen AI Open Source Project — full documentation for the Ashen-GPT repository |
| `ashen-gpt-chat.html` | Live chat interface embedding `web_chatbot.py` from the Ashen AI Base project |
| `gaming-technology.html` | Wasteland Engine and Nova Renderer — Vulkan-first, AI-powered ray tracing |
| `games.html` | Current and upcoming titles — The Never Ending War, Wasteland |

## Local Development

This is a static site — no build step required.

```bash
# Clone
git clone https://github.com/Ashen-Wastes-Studios/AshenWastesStudios-Website.git
cd AshenWastesStudios-Website

# Serve locally
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Ashen AI Chat

The chat page (`ashen-gpt-chat.html`) embeds the `web_chatbot.py` server running at `http://localhost:5000`. To use it:

1. Clone and set up the [Ashen-GPT](https://github.com/Ashen-Wastes-Studios/Ashen-GPT) repository
2. Run `python web_chatbot.py` from that directory
3. Open the chat page in your browser

## Tech Stack

- Plain HTML/CSS/JS — no frameworks, no build tools
- DM Serif Display + Inter typography (Google Fonts)
- Dark theme with orange accent color
- Responsive layout via CSS Grid and Flexbox

## License

MIT — see [LICENSE](LICENSE).
