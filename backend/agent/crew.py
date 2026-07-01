# Monkey patch to fix Groq API unsupported cache_breakpoint error
# pyrefly: ignore [missing-import]
import crewai.llms.cache as _crewai_cache
_crewai_cache.mark_cache_breakpoint = lambda msg: msg

import os
import sys
import threading
import json
import re

class ThreadSafeStdout:
    def __init__(self, original):
        self._original = original   
        self._local = threading.local()

    def write(self, data):
        redirected = getattr(self._local, "file", None)
        if redirected is not None:
            try:
                redirected.write(data)
                return
            except Exception:
                pass
        self._original.write(data)

    def flush(self):
        redirected = getattr(self._local, "file", None)
        if redirected is not None:
            try:
                redirected.flush()
                return
            except Exception:
                pass
        self._original.flush()

    def __getattr__(self, name):
        return getattr(self._original, name)

# Safe global patching for async/threaded web environments
if not isinstance(sys.stdout, ThreadSafeStdout):
    sys.stdout = ThreadSafeStdout(sys.stdout)
if not isinstance(sys.stderr, ThreadSafeStdout):
    sys.stderr = ThreadSafeStdout(sys.stderr)

# Add current directory to sys.path to resolve sibling imports when called from outside CWD
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crewai import Crew

from agents import (
    discovery_agent,
    research_agent,
    marketing_agent,
    llm
)

from tasks import (
    discovery_task,
    research_task,
    marketing_task
)

import time

# Apply task pacing callback only for groq
provider = os.getenv("LLM_PROVIDER", os.getenv("PROVIDER", "groq")).strip().lower()
if provider == "groq":
    def task_pacing_callback(output):
        print("\n" + "="*70)
        print(" [Pacing] Sleeping for 35 seconds to reset the Groq TPM limit window... ")
        print("="*70 + "\n")
        time.sleep(35)

    discovery_task.callback = task_pacing_callback
    research_task.callback = task_pacing_callback
    marketing_task.callback = task_pacing_callback


import contextlib

crew = Crew(
    agents=[
        discovery_agent,
        research_agent,
        marketing_agent
    ],

    tasks=[
        discovery_task,
        research_task,
        marketing_task
    ],

    verbose=False,
    max_rpm=2,
    llm=llm
)

def run_assessment_crew(data: dict) -> dict:
    business_name = data.get("businessName", "").strip() or "Unnamed Business"
    industry = data.get("industry", "").strip() or "Consulting"
    business_idea = data.get("businessDescription", "").strip() or "An innovative business"
    website = data.get("websiteUrl", "").strip() or "No website"
    goal = data.get("primaryGoal", "").strip() or "Growth and scale"
    target_audience = data.get("targetAudience", "").strip() or "General Public"

    discovery_interview = f"""
- Business Name: {business_name}
- Industry: {industry}
- Business Idea/Description: {business_idea}
- Website: {website}
- Primary Business Goal: {goal}
- Target Audience: {target_audience}
"""

    # Set up production logging directory and file path
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logs_dir = os.path.join(backend_dir, "logs")
    os.makedirs(logs_dir, exist_ok=True)
    log_file_path = os.path.join(logs_dir, "agent.log")

    print("Agent started")

    try:
        with open(log_file_path, "a", encoding="utf-8") as log_file:
            log_file.write(f"\n--- Assessment Agent Crew Run Started: {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
            log_file.write(f"Inputs:\n{discovery_interview}\n")
            log_file.flush()

            # Set thread-local redirection target safely to avoid thread conflicts in FastAPI
            sys.stdout._local.file = log_file
            sys.stderr._local.file = log_file

            try:
                result = crew.kickoff(
                    inputs={
                        "discovery_interview": discovery_interview
                    }
                )
            finally:
                # Always restore standard output targets immediately
                sys.stdout._local.file = None
                sys.stderr._local.file = None

            log_file.write(f"\n--- Assessment Agent Crew Run Completed: {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
            log_file.flush()

        print("Agent completed")

        # --- Parse and Return JSON Output ---
        raw_output = result.raw
        # Clean up markdown code block wrapper if present
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', raw_output, re.DOTALL)
        json_content = json_match.group(1) if json_match else raw_output

        data_json = json.loads(json_content.strip())
        return data_json
    except Exception as e:
        print(f"Agent failed: {e}")
        try:
            with open(log_file_path, "a", encoding="utf-8") as log_file:
                log_file.write(f"\n[Error] Run failed at {time.strftime('%Y-%m-%d %H:%M:%S')}: {e}\n")
                log_file.flush()
        except Exception:
            pass

        try:
            fallback_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fallback_audit_report.json")
            with open(fallback_path, "r", encoding="utf-8") as f:
                fallback_data = json.load(f)
            print("Warning: Loading fallback audit report as backup")
            try:
                with open(log_file_path, "a", encoding="utf-8") as log_file:
                    log_file.write(f"[Success] Loaded fallback audit report from 'fallback_audit_report.json' as backup due to: {e}\n")
                    log_file.flush()
            except Exception:
                pass
            return fallback_data
        except Exception as file_err:
            print(f"Critical: Failed to load fallback report: {file_err}")
            try:
                with open(log_file_path, "a", encoding="utf-8") as log_file:
                    log_file.write(f"[Critical] Failed to load fallback report file: {file_err}\n")
                    log_file.flush()
            except Exception:
                pass
            raise e


if __name__ == "__main__":
    print("\n" + "="*60)
    print("      Welcome to the Business Growth Consultant Agent Team!      ")
    print(" Please answer the following questions to help us analyze your business. ")
    print("="*60 + "\n")

    business_name = input("1. Enter Business Name: ").strip() or "Unnamed Business"
    industry = input("2. Enter Industry: ").strip() or "Consulting"
    business_idea = input("3. Enter Business Idea / Description: ").strip() or "An innovative business"
    website = input("4. Enter Website URL (optional): ").strip() or "No website"
    goal = input("5. Enter Primary Business Goal: ").strip() or "Growth and scale"
    target_audience = input("6. Enter Target Audience: ").strip() or "General Public"

    input_data = {
        "businessName": business_name,
        "industry": industry,
        "businessDescription": business_idea,
        "websiteUrl": website,
        "primaryGoal": goal,
        "targetAudience": target_audience
    }

    result_json = run_assessment_crew(input_data)
    print("Result:")
    print(result_json)