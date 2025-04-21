# prompt_template.py

FEW_SHOT = """
Example Discharge Summary:
Patient: James L.
Procedure: Left Hip Replacement
Disposition: Home with walker
Plan: Home PT, f/u ortho 2 wks
Meds: Acetaminophen, Oxycodone

Expected JSON Output:
{
  "case_note": "Patient admitted for left hip arthroplasty...",
  "care_plan": {
    "goals": ["Ambulate independently", "Attend ortho follow-up"],
    "gaps": ["Limited mobility"],
    "interventions": ["Home PT", "Pain management"]
  },
  "action_items": [
    "☑️ Confirm DME",
    "☑️ Schedule PT"
  ]
}
"""

def build_prompt(discharge_summary: str) -> str:
    return f"""
You are a healthcare case manager. Based on the discharge summary below, return only a valid JSON object — no explanation, no markdown, no formatting — that matches this schema:

{{
  "case_note": string,
  "care_plan": {{
    "goals": [string],
    "gaps": [string],
    "interventions": [string]
  }},
  "action_items": [string]
}}

Only return the JSON object.

{FEW_SHOT}

Discharge Summary:
{discharge_summary}
"""
