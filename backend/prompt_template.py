FEW_SHOT = """
Example Discharge Summary:
Patient: James L.
Admit: 3/15/25 | Discharge: 3/20/25 | Procedure: Left Hip Replacement
Disposition: Home with walker
Plan: Home PT 3x/wk, f/u ortho 2 wks
Meds: Acetaminophen, Oxycodone, Enoxaparin

Expected Output:

Care Note:
Patient admitted for left hip arthroplasty, discharged home on POD5 with walker. No complications. Home PT arranged.

Care Plan:
Goals:
- Ambulate independently
- Attend ortho f/u
Gaps:
- Limited mobility
- Pain management needs
Interventions:
- Home PT 3x/wk
- Pain meds and anticoagulant

Action Items:
- ☑️ Schedule PT
- ☑️ Confirm follow-up
"""

def build_prompt(discharge_summary):
    return f"""
You are a healthcare case manager. Based on the discharge summary below, generate:

1. A **Care Note**
2. A structured **Care Plan** with Goals, Gaps, Interventions
3. A list of **Action Items**

{FEW_SHOT}

Discharge Summary:
{discharge_summary}
"""
