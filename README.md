Wire Desk — Multi-Agent Research Pipeline

A multi-agent AI system that researches any topic end-to-end: it searches the web, reads the most relevant source in depth, writes a structured report, and critiques its own work — all autonomously, with a live status UI to watch it happen.

How it works

The pipeline runs four specialized agents in sequence, each handing its output to the next:


Search agent — queries the web (via Tavily) for recent, reliable sources on the topic
Reader agent — picks the most relevant result and scrapes its full content
Writer chain — synthesizes the search results and scraped content into a structured report (introduction, key findings, conclusion, sources)
Critic chain — reviews the report and returns a score out of 10 with strengths and areas for improvement


Built with LangChain agents and chains, served via a FastAPI backend, with a React frontend that shows each stage completing in real time.

Tech stack

Backend


Python, FastAPI, Uvicorn
LangChain (create_agent, prompt chains)
Tavily API (web search)
BeautifulSoup (web scraping)
Google Gemini / Groq (LLM providers)


Frontend


React (Vite)
Plain CSS-in-JS, no UI framework dependency


Project structure

.
├── agents.py          # agent and chain definitions (search, reader, writer, critic)
├── pipeline.py         # orchestrates the 4-stage pipeline end to end
├── tools.py             # web_search and web_scrape tool implementations
├── server.py            # FastAPI wrapper exposing the pipeline as an API
├── requirements.txt
├── .env.example          # required environment variables (no real keys)
└── research-ui/             # React frontend
    └── src/
        ├── App.jsx
        └── ResearchConsole.jsx

Setup
`
1. Backend

bash# clone the repo
git clone https://github.com/YOUR_USERNAME/wire-desk.git
cd wire-desk

# create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# install dependencies
python -m pip install -r requirements.txt

# add your API keys
cp .env.example .env
# then edit .env and fill in your actual keys
