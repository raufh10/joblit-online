# Joblit 🟢

**Joblit** is an AI-powered bulk gap analysis platform specifically engineered for the Data and AI career landscape. By leveraging semantic embeddings and structured LLM analysis, Joblit evaluates the alignment between resumes and industry-standard roles, identifying critical "gaps" in **skills**, **responsibilities**, and **requirements**.

## 🚀 Live Demo
You can view the live site here: [https://raufh10.github.io/joblit-online/](https://raufh10.github.io/joblit-online/)

---

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Backend:** FastAPI (Python) hosted on Railway.
* **Database:** * **Supabase:** Primary storage for relational post data.
    * **pgvector:** Dedicated vector database for high-dimensional similarity searches.
* **AI & Embeddings:**
    * **OpenAI GPT-5-Nano (2025-08-07):** Utilized for structured output data extraction to map resume entities.
    * **OpenAI text-embedding-3-small:** Powers the semantic vector comparisons.

## 📂 Project Structure
```text
joblit/
├── css/
│   └── style.css       # Platform layout and UI components
├── js/
│   └── script.js       # API orchestration & gap analysis logic
├── index.html          # User dashboard & upload interface
└── README.md           # Documentation
