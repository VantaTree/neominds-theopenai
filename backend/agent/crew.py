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

from crewai import Crew, LLM

class ForceModelRotation(BaseException):
    def __init__(self, original_exception):
        self.original_exception = original_exception

_original_llm_new = LLM.__new__

def _custom_llm_new(cls, *args, **kwargs):
    instance = _original_llm_new(cls, *args, **kwargs)
    klass = instance.__class__
    if not getattr(klass, "_is_monkeypatched", False):
        _orig_call = klass.call
        _orig_acall = klass.acall
        
        def _wrapped_call(self, *args_call, **kwargs_call):
            try:
                return _orig_call(self, *args_call, **kwargs_call)
            except Exception as e:
                raise ForceModelRotation(e)
                
        async def _wrapped_acall(self, *args_call, **kwargs_call):
            try:
                return await _orig_acall(self, *args_call, **kwargs_call)
            except Exception as e:
                raise ForceModelRotation(e)
                
        klass.call = _wrapped_call
        klass.acall = _wrapped_acall
        klass._is_monkeypatched = True
    return instance

LLM.__new__ = _custom_llm_new

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
import litellm
litellm.num_retries = 0
os.environ["LITELLM_NUM_RETRIES"] = "0"
os.environ["LITELLM_MAX_RETRIES"] = "0"

# LLM Provider Configuration
# Set this to "openrouter" or "groq"
provider = "groq"

# API Key Configuration
# You can set this variable to:
# 1. The name of an environment variable (e.g., "OPEN_ROUTER", "OPENROUTER_API_KEY", "GROQ_API_KEY")
# 2. A direct API key string (e.g., "sk-or-v1-...")
# 3. None or "" to let the system auto-detect the key from the environment
api_key = "GROQ_API_KEY"

def resolve_api_key(key_var):
    if not key_var:
        return None
    key_var_str = str(key_var).strip()
    if key_var_str in os.environ:
        return os.environ[key_var_str]
    return key_var_str

def get_candidate_keys(provider_name):
    keys = []
    # 1. First candidate: the resolved primary api_key
    primary = resolve_api_key(api_key)
    if primary:
        keys.append(primary)
        
    # 2. Add other candidate environment variable keys
    candidate_env_vars = []
    if provider_name == "openrouter":
        candidate_env_vars = ["OPEN_ROUTER", "OPENROUTER_API_KEY"]
    elif provider_name == "groq":
        candidate_env_vars = ["GROQ_API_KEY"]
    else:
        candidate_env_vars = ["OPEN_ROUTER", "OPENROUTER_API_KEY", "GROQ_API_KEY"]
        
    for var in candidate_env_vars:
        val = os.getenv(var)
        if val and val not in keys:
            keys.append(val)
            
    # Also add any of the general keys as fallback
    for var in ["OPEN_ROUTER", "OPENROUTER_API_KEY", "GROQ_API_KEY"]:
        val = os.getenv(var)
        if val and val not in keys:
            keys.append(val)
            
    return keys

def get_candidate_models(provider_name):
    from models import FREE_MODELS, GROQ_MODELS
    if provider_name == "openrouter":
        configured_model = os.getenv("LLM_MODEL") or os.getenv("OPENROUTER_MODEL") or "meta-llama/llama-3.3-70b-instruct:free"
        models = [configured_model]
        for m in FREE_MODELS:
            if m not in models:
                models.append(m)
        return models
    else:  # groq
        configured_model = os.getenv("LLM_MODEL") or os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile"
        models = [configured_model]
        for m in GROQ_MODELS:
            if m not in models:
                models.append(m)
        return models

def is_wrong_api_key_error(e):
    err_str = str(e).lower()
    return ("authentication" in err_str or 
            "unauthorized" in err_str or 
            "401" in err_str or 
            "api key" in err_str or 
            "api_key" in err_str or 
            "credential" in err_str or 
            "invalid_api_key" in err_str or
            "bad api key" in err_str)

def is_rate_limit_error(e):
    err_str = str(e).lower()
    return ("429" in err_str or 
            "rate limit" in err_str or 
            "too many requests" in err_str or 
            "tpm" in err_str or 
            "rpm" in err_str)

# Apply task pacing callback only for groq (default pacing)
active_provider_default = provider.strip().lower() if provider else os.getenv("LLM_PROVIDER", os.getenv("PROVIDER", "groq")).strip().lower()
if active_provider_default == "groq":
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

    import crew
    active_provider = crew.provider.strip().lower() if getattr(crew, "provider", None) else os.getenv("LLM_PROVIDER", os.getenv("PROVIDER", "groq")).strip().lower()
    api_keys = get_candidate_keys(active_provider)
    models = get_candidate_models(active_provider)

    key_idx = 0
    model_idx = 0
    last_error = None
    success = False
    result = None

    while key_idx < len(api_keys) and model_idx < len(models):
        current_key = api_keys[key_idx]
        current_model = models[model_idx]

        # Determine pacing callback if groq
        if active_provider == "groq" or "groq" in current_model.lower():
            def task_pacing_callback(output):
                print("\n" + "="*70)
                print(" [Pacing] Sleeping for 35 seconds to reset the Groq TPM limit window... ")
                print("="*70 + "\n")
                time.sleep(35)
            discovery_task.callback = task_pacing_callback
            research_task.callback = task_pacing_callback
            marketing_task.callback = task_pacing_callback
        else:
            discovery_task.callback = None
            research_task.callback = None
            marketing_task.callback = None

        # Print the requested three things to stdout BEFORE redirection
        provider_print = "openrouter" if active_provider == "openrouter" else "groqai"
        print(f"API = {provider_print}")
        print(f"model = {current_model}")
        print("started agent")

        # Set API keys in environment so LiteLLM resolves them correctly
        if active_provider == "openrouter":
            os.environ["OPENROUTER_API_KEY"] = current_key
            os.environ["OPEN_ROUTER"] = current_key
        else:
            os.environ["GROQ_API_KEY"] = current_key

        try:
            with open(log_file_path, "a", encoding="utf-8") as log_file:
                log_file.write(f"\n--- Assessment Agent Crew Run Started: {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
                log_file.write(f"Inputs:\n{discovery_interview}\n")
                log_file.write(f"Active Provider: {provider_print}, Model: {current_model}\n")
                log_file.flush()

                # Set thread-local redirection target safely
                sys.stdout._local.file = log_file
                sys.stderr._local.file = log_file

                try:
                    # Dynamically instantiate the LLM
                    if active_provider == "openrouter":
                        active_llm = LLM(
                            model=current_model if current_model.startswith("openrouter/") else f"openrouter/{current_model}",
                            temperature=0.3,
                            max_tokens=4000,
                            base_url="https://openrouter.ai/api/v1",
                            api_key=current_key,
                            max_retries=0
                        )
                    else:
                        active_llm = LLM(
                            model=current_model if current_model.startswith("groq/") else f"groq/{current_model}",
                            temperature=0.3,
                            num_retries=0,
                            max_tokens=4000,
                            api_key=current_key
                        )

                    # Update agents
                    discovery_agent.llm = active_llm
                    research_agent.llm = active_llm
                    marketing_agent.llm = active_llm

                    # Re-instantiate crew
                    current_crew = Crew(
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
                        llm=active_llm
                    )

                    result = current_crew.kickoff(
                        inputs={
                            "discovery_interview": discovery_interview
                        }
                    )
                    success = True
                finally:
                    # Always restore standard output targets immediately
                    sys.stdout._local.file = None
                    sys.stderr._local.file = None

                if success:
                    log_file.write(f"\n--- Assessment Agent Crew Run Completed: {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
                    log_file.flush()
                    break

        except (ForceModelRotation, Exception) as err:
            e = err.original_exception if isinstance(err, ForceModelRotation) else err
            last_error = e
            # Print failure message to stdout (not redirected) since we restored stdout/stderr
            print(f"Agent failed with current configuration: {e}")
            try:
                with open(log_file_path, "a", encoding="utf-8") as log_file:
                    log_file.write(f"\n[Error] Run failed at {time.strftime('%Y-%m-%d %H:%M:%S')}: {e}\n")
                    log_file.flush()
            except Exception:
                pass

            if is_wrong_api_key_error(e):
                print("Detected incorrect API key error. Rotating to the next API key...")
                key_idx += 1
                model_idx = 0
            elif is_rate_limit_error(e):
                print("Detected rate limit (429) error. Rotating to the next model...")
                model_idx += 1
            else:
                print("Detected unexpected error. Attempting next model...")
                model_idx += 1
                if model_idx >= len(models):
                    print("No more models to try for current key. Rotating to the next API key...")
                    key_idx += 1
                    model_idx = 0

    if success and result:
        try:
            # --- Parse and Return JSON Output ---
            raw_output = result.raw
            # Clean up markdown code block wrapper if present
            json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', raw_output, re.DOTALL)
            json_content = json_match.group(1) if json_match else raw_output

            data_json = json.loads(json_content.strip())
            return data_json
        except Exception as parse_err:
            print(f"Error parsing JSON output: {parse_err}")
            last_error = parse_err

    # If we exited the loop and did not succeed, fall back to fallback report
    err_to_report = last_error or Exception("All attempts failed.")
    print(f"All model/key configurations failed. Returning fallback report. Error: {err_to_report}")
    
    try:
        fallback_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fallback_audit_report.json")
        with open(fallback_path, "r", encoding="utf-8") as f:
            fallback_data = json.load(f)
        fallback_data["_is_fallback"] = True
        print("Warning: Loading fallback audit report as backup")
        try:
            with open(log_file_path, "a", encoding="utf-8") as log_file:
                log_file.write(f"[Success] Loaded fallback audit report from 'fallback_audit_report.json' as backup due to: {err_to_report}\n")
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
        raise err_to_report


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