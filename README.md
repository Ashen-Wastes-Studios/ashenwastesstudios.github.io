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
| `wasteland-engine-docs.html` | Complete Wasteland Engine documentation — all systems, APIs, components, panels |
| `games.html` | Current and upcoming titles — The Never Ending War, Wasteland |
| `philosophy.html` | Company philosophy — open source, anti-monopoly, safety over speed |

## Local Development

This is a static site — no build step required.

```bash
# Clone
git clone https://github.com/Ashen-Wastes-Studios/ashenwastesstudios-website.git
cd ashenwastesstudios-website

# Serve locally
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Ashen AI Chat

The chat page (`ashen-gpt-chat.html`) embeds the `web_chatbot.py` server running at `http://localhost:5000`. To use it:

1. Clone and set up the [Ashen-GPT](https://github.com/Ashen-Wastes-Studios/Ashen-GPT) repository
2. Run `python web_chatbot.py` from that directory
3. Open the chat page in your browser

## Related Repositories

| Repository | Description |
|---|---|
| [Ashen-GPT](https://github.com/Ashen-Wastes-Studios/Ashen-GPT) | Safe open source AI — local inference, fine-tuning, research |
| [Wasteland-Engine](https://github.com/Ashen-Wastes-Studios/Wasteland-Engine) | 2D/3D game engine with Vulkan/D3D12/D3D11/OpenGL + AI ray tracing |

## Tech Stack

- Plain HTML/CSS/JS — no frameworks, no build tools
- DM Serif Display + Inter + JetBrains Mono typography (Google Fonts)
- Cyberpunk theme — blood red accent, scanlines, neon glow effects
- Responsive layout via CSS Grid and Flexbox

## License

MIT — see [LICENSE](LICENSE).
