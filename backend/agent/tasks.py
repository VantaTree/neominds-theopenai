from crewai import Task

from agents import (
    discovery_agent,
    research_agent,
    marketing_agent
)

# DISCOVERY TASK

discovery_task = Task(
    description="""
    Understand the business by analyzing the following onboarding interview transcript:
    {discovery_interview}

    Create a structured business profile.
    """,

    agent=discovery_agent,

    expected_output="""
    Detailed Business Profile
    """
)

# RESEARCH TASK

research_task = Task(
    description="""
    Perform business research.

    Analyze:

    1. Industry Overview

    2. Competitors

    3. Current Website

    4. Online Presence

    5. SEO Opportunities

    6. Strengths

    7. Weaknesses

    8. Growth Opportunities

    Generate a complete business audit report.
    """,

    agent=research_agent,

    expected_output="""
    Business Research Report
    """
)

# MARKETING TASK

marketing_task = Task(
    description="""
    Based on the research findings and business profile:

    Generate a complete, structured Business Audit Report in JSON format.
    The report must include:
    - executive_summary
    - business_overview
    - current_business_status
    - pain_points
    - risk_assessment
    - competitor_analysis
    - market_positioning
    - swot_analysis
    - growth_opportunities
    - priority_action_plan
    - recommended_services
    - roadmap_30_60_90
    - recommended_plan (Recommend one of the available service plans: BASIC, PLUS, or PRO, and detail why based on the pricing rules, price, confidence level, expected outcomes, and why other plans were not recommended)

    Ensure the output is a valid JSON object matching the requested schema keys.
    """,

    agent=marketing_agent,

    expected_output="""
    A JSON string containing the complete Business Audit Report with all required keys, ending with the recommended_plan.
    """
)