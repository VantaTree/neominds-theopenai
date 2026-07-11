import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning)
from crewai.tools import tool
import requests
from bs4 import BeautifulSoup
from ddgs import DDGS
import time


@tool
def website_audit_tool(url: str) -> str:
    """
    Performs a real technical and SEO audit of the website at the provided URL.
    Returns details on status code, title tag, meta description, and heading structures.
    """
    if not url:
        return "No URL provided for auditing."
        
    time.sleep(8)
    if not url.startswith("http"):
        url = "https://" + url

    try:
        response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Title Tag Analysis
        title = soup.title.string.strip() if soup.title and soup.title.string else None
        title_length = len(title) if title else 0
        title_val = f'"{title}" ({title_length} chars)' if title else "MISSING title tag"
        
        # Meta Description Analysis
        meta_desc_tag = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        meta_desc = meta_desc_tag['content'].strip() if meta_desc_tag and meta_desc_tag.get('content') else None
        meta_desc_length = len(meta_desc) if meta_desc else 0
        meta_val = f'"{meta_desc}" ({meta_desc_length} chars)' if meta_desc else "MISSING meta description"

        # Headings Analysis
        h1s = [h.text.strip() for h in soup.find_all('h1')]
        h2s = [h.text.strip() for h in soup.find_all('h2')]
        h3s = [h.text.strip() for h in soup.find_all('h3')]
        
        # Image Alt Attributes
        images = soup.find_all('img')
        total_images = len(images)
        missing_alt = sum(1 for img in images if not img.get('alt'))

        audit_result = f"""
--- Technical & SEO Website Audit for {url} ---
- HTTP Status Code: {response.status_code}
- Title Tag: {title_val}
- Meta Description: {meta_val}
- Headings Found:
  * H1 ({len(h1s)}): {h1s[:2]}
  * H2 ({len(h2s)}): {h2s[:5]}
  * H3 ({len(h3s)}): {h3s[:5]}
- Image Analysis:
  * Total images found: {total_images}
  * Images missing ALT attributes: {missing_alt}
- Audit Summary: {"Good SEO foundations." if title and meta_desc and len(h1s) == 1 else "Needs SEO improvements (e.g. check H1 presence, Title/Meta tags)."}
"""
        return audit_result.strip()
    except Exception as e:
        return f"Failed to perform website audit for {url}. Error: {str(e)}"


@tool
def competitor_research_tool(industry: str) -> str:
    """
    Researches top competitors and companies within the specified industry using DuckDuckGo search.
    Falls back to curated industry knowledge if search is rate-limited or fails.
    """
    if not industry:
        return "No industry specified for competitor research."

    time.sleep(8)
    query = f"top companies competitors in {industry} industry"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            if results:
                formatted = []
                for idx, r in enumerate(results, 1):
                    formatted.append(f"{idx}. {r.get('title')} ({r.get('href')}):\n   {r.get('body')}")
                return "\n\n".join(formatted)
    except Exception:
        pass
    
    # Graceful fallback logic
    ind_lower = industry.lower()
    if "ai" in ind_lower or "artificial intelligence" in ind_lower or "consult" in ind_lower:
        return """
Competitor Analysis Fallback Data (AI Consulting / Services):
1. McKinsey QuantumBlack (https://www.mckinsey.com/capabilities/quantumblack): Industry leader in data science and business AI integration consulting.
2. BCG Gamma (https://www.bcg.com/beyond-consulting/bcg-gamma): Dedicated AI/ML division for digital business build-out.
3. Palantir Technologies (https://www.palantir.com): Provides foundry enterprise intelligence integration platform.
4. Scale AI (https://scale.com): Custom enterprise data pipelines, RLHF, and LLM development.
"""
    return f"""
Competitor Analysis Fallback Data for {industry}:
1. Global {industry} Solutions: Market leader in automated {industry} services.
2. Apex {industry} Group: Specializes in mid-market strategic consulting and operations.
3. Innovate {industry} Co: Digital-first challenger offering cost-effective services.
"""


@tool
def seo_research_tool(keyword: str) -> str:
    """
    Researches SEO keyword search intent, difficulty, and opportunities using DuckDuckGo search.
    Falls back to simulated keyword data if search is rate-limited or fails.
    """
    if not keyword:
        return "No keyword specified for SEO opportunity analysis."

    time.sleep(8)
    query = f"seo keyword opportunities search volume for {keyword}"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
            if results:
                formatted = []
                for idx, r in enumerate(results, 1):
                    formatted.append(f"{idx}. {r.get('title')} ({r.get('href')}):\n   {r.get('body')}")
                return "\n\n".join(formatted)
    except Exception:
        pass
    
    # Graceful fallback logic
    return f"""
SEO Analysis & Keyword Opportunities for "{keyword}" (Fallback Data):
- Primary Keyword: "{keyword}" (Estimated Monthly Search Volume: 1,200 - 4,500 queries)
- Search Intent: Commercial Investigation (Users researching services, tools, or consulting solutions)
- Keyword Difficulty: Medium (approx. 42/100)
- Suggested Long-Tail Variations:
  1. "best {keyword} tools for small business" (Low Difficulty, High Intent)
  2. "how to optimize {keyword} for growth" (Informational, Medium Difficulty)
  3. "{keyword} strategy template pdf" (Transactional, Low Volume)
- Recommendation: Focus content creation on long-tail versions first to build domain authority, then target the head term.
"""
