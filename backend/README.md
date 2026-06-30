# The Open AI Backend

This is the backend component for **The Open AI**, built with **FastAPI** and **CrewAI**. It runs an AI agent crew to analyze client businesses and generate growth potential reports, fell back by local static data in case of execution errors.

---

## Prerequisites

- **Python**: Version 3.10 or higher.
- **Package Manager**: `pip`.
- **Virtual Environment Tool**: `venv` (recommended).

---

## Installation & Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\activate.ps1
     ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## Environment Variables

To run the AI Agent crew, you should configure LLM API keys. Create a `.env` file in the `backend/` directory or export them in your terminal session:

```env
# Example OpenAI configuration
OPENAI_API_KEY=your_openai_api_key_here

# Example Groq configuration (if using Groq LLM)
GROQ_API_KEY=your_groq_api_key_here
```

---

## Running the Application

Start the FastAPI local development server using `uvicorn`:

```bash
python -m uvicorn main:app --reload
```

- **Host**: `http://127.0.0.1:8000`
- **Interactive API Documentation (Swagger UI)**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## Main API Endpoints

### 1. Health Status
- **URL**: `GET /`
- **Response**:
  ```json
  {
    "status": "running",
    "message": "Welcome to The Open AI Backend API"
  }
  ```

### 2. Submit Audit Assessment
- **URL**: `POST /api/assessment`
- **Payload**: JSON dictionary containing client details (e.g. website, objectives, constraints).
- **Behavior**: Delegates analysis to the CrewAI agent system. If LLM API keys are missing or an execution error occurs, the server automatically loads and returns the local `agent/fallback_audit_report.json` as a backup.
