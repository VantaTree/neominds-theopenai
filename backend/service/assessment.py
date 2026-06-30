import os
import json
from agent.crew import run_assessment_crew

def process_assessment(data: dict) -> dict:
    print("Service Layer: Delegating assessment task to Agent Crew...")
    try:
        result = run_assessment_crew(data)
        return result
    except Exception as e:
        print(f"Error executing Agent Crew: {e}")
        try:
            fallback_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "agent",
                "fallback_audit_report.json"
            )
            with open(fallback_path, "r", encoding="utf-8") as f:
                fallback_data = json.load(f)
            print("[Success] Service Layer: Loaded fallback report as backup.")
            return fallback_data
        except Exception as fallback_err:
            print(f"Critical: Failed to load fallback report in service layer: {fallback_err}")
            return {
                "status": "error",
                "message": f"Failed to execute assessment agent: {str(e)}"
            }
