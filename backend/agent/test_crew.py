import os
import json
from crew import run_assessment_crew, api_key, provider

if __name__ == "__main__":
    print("Starting non-interactive crew assessment test...")
    print(f"Unified provider setting from crew.py: '{provider}'")
    print(f"Unified api_key setting from crew.py: '{api_key}'")
    
    test_input = {
        "businessName": "Neominds Cafe",
        "industry": "Food & Beverage",
        "businessDescription": "A modern, high-tech coffee shop",
        "websiteUrl": "",
        "primaryGoal": "Acquire 500 new loyal customers",
        "targetAudience": "students"
    }
    
    try:
        result = run_assessment_crew(test_input)
        is_fallback = False
        if isinstance(result, dict):
            is_fallback = result.pop("_is_fallback", False)
            
        if is_fallback:
            print("\n--- FALLBACK ---")
        else:
            print("\n--- TEST SUCCESS ---")
        print("Received structured audit report output:")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"\n--- TEST FAILED ---")
        print(f"Error encountered: {e}")
