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

### Backend Configuration
To run the AI Agent crew, configure your Groq API key. Create a `.env` file in the `backend/` directory or export it in your terminal session:

```env
# Groq configuration (required)
GROQ_API_KEY=your_groq_api_key_here
LLM_PROVIDER=groq
```

### Frontend Configuration
When deploying or running the JS frontend application, you can configure the backend URL once in the root `.env` file or environment variables:

```env
# Frontend API URL configuration
VITE_BACKEND_URL=http://localhost:8081
```

---

## Running the Application

Start the FastAPI local development server using `uvicorn` on port **8081**:

```bash
python -m uvicorn main:app --reload --port 8081
```

- **Host**: `http://127.0.0.1:8081`
- **Interactive API Documentation (Swagger UI)**: `http://127.0.0.1:8081/docs`
- **ReDoc**: `http://127.0.0.1:8081/redoc`

---

## API Endpoints & Payloads

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
- **Headers**:
  - `Content-Type: application/json`
- **Request Body (JSON)**:
  ```json
  {
    "businessName": "Acme Corp",
    "industry": "Technology & Software",
    "businessDescription": "A SaaS business building next-gen developer productivity tools.",
    "websiteUrl": "https://acme.com",
    "primaryGoal": "Generate leads and increase trials",
    "targetAudience": "Software engineers and engineering managers aged 25-45"
  }
  ```
  
  #### Request Fields:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `businessName` | `string` | Yes | Name of the business to evaluate. |
  | `industry` | `string` | Yes | Industry sector the business operates in. |
  | `businessDescription` | `string` | Yes | Detailed description of the business idea, products, or services. |
  | `websiteUrl` | `string` | No | Existing website URL (for analysis tools). |
  | `primaryGoal` | `string` | Yes | Main goal (e.g. increase sales, improve brand awareness). |
  | `targetAudience` | `string` | Yes | Description of target demographic. |

- **Response Body (JSON)**:
  On success, returns a structured business assessment report:
  ```json
  {
    "executive_summary": {
      "overall_score": 7,
      "summary": "Detailed summary paragraph of the business growth posture...",
      "top_strength": "Unique high-value developer proposition...",
      "biggest_challenge": "Competitive saturation in the DevOps space...",
      "growth_potential": "High"
    },
    "business_profile": {
      "business_name": "Acme Corp",
      "industry": "Technology & Software",
      "location": "Not Available",
      "business_model": "SaaS B2B",
      "target_audience": ["Software engineers", "Engineering managers"],
      "revenue_sources": ["Subscription tiers"]
    },
    "business_scorecard": {
      "overall": 7,
      "website": 8,
      "seo": 6,
      "branding": 7,
      "marketing": 6,
      "social_media": 5,
      "growth_readiness": 8
    },
    "current_status": {
      "website": { "status": "Good layout, needs performance tuning." },
      "marketing": { "status": "Ad-hoc content posting, lack of consistent outreach." },
      "social_media": { "status": "Inactive profiles on main developer hubs." },
      "seo": { "status": "Missing keyword focus on high-intent terms." },
      "digital_maturity": { "level": "Growing" }
    },
    "key_findings": {
      "strengths": ["Strong technical team", "Clear target definition"],
      "weaknesses": ["Low organic search visibility", "No email capture workflow"],
      "opportunities": ["Develop SEO hubs", "Integrate AI onboarding agent"],
      "threats": ["Established competitors bidding on similar keywords"]
    },
    "risk_assessment": {
      "overall_risk": "Medium",
      "risk_score": 6,
      "top_risks": ["Churn rate among early adopters", "Ad spend inefficiencies"]
    },
    "competitor_analysis": {
      "competitive_score": 6,
      "major_competitors": ["DevCorp", "CodeFast"],
      "key_advantage": "Superior developer experience and docs",
      "largest_gap": "Lack of pricing options for small teams"
    },
    "priority_actions": [
      {
        "priority": 1,
        "title": "Establish keyword hub mapping",
        "impact": "High",
        "difficulty": "Medium"
      }
    ],
    "recommended_services": ["Advanced SEO package", "Social media automation setup"],
    "roadmap": {
      "30_days": ["Draft landing page variants", "Set up SEO metrics tracker"],
      "60_days": ["Execute initial ad sets", "Launch content newsletter"],
      "90_days": ["Automate CRM email flows", "Review growth indicators"]
    },
    "recommended_plan": {
      "plan_name": "Plus Plan",
      "monthly_price": 60,
      "confidence": 85,
      "reason": "Acme Corp already has a running website and requires dedicated SEO improvements to hit growth goals.",
      "expected_results": ["30% increase in developer signups", "Higher organic visibility"]
    }
  }
  ```

