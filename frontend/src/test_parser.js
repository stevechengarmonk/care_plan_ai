const outputText = `
**Case Note:**
Patient admitted for right total knee arthroplasty due to severe osteoarthritis, discharged home on POD4 with walker. Pain well-controlled with oral medications. Home physical therapy arranged and continues. Blood glucose and blood pressure were well-controlled throughout the stay.

**Care Plan:**
Goals:
- Ambulate independently with walker
- Attend orthopedic follow-up
- Manage pain effectively
- Maintain controlled blood pressure and blood glucose
Gaps:
- Limited mobility
- Pain management needs
- Risk of DVT (continued)
- Potential for post-operative complications
Interventions:
- Home Physical Therapy as scheduled
- Acetaminophen, Hydrocodone/Acetaminophen, and Ibuprofen for pain
- Enoxaparin subcutaneous daily for 10 days
- Lisinopril 10mg PO daily
- Metformin 500mg PO BID with meals
- Patient education on wound care, infection signs, activity restrictions, and medication management

**Action Items for Case Manager:**
- ☑️ Schedule PT
- ☑️ Confirm follow-up with orthopedic surgeon
- ☑️ Verify medication reconciliation and patient understanding of medications
- ☑️ Ensure Enoxaparin administration training (if applicable)
- ☑️ Assess for home safety and resources.
- ☑️ Provide Patient with a contact number for any questions and concerns
`;

const noteMatch = outputText.match(/(?:\*\*\s*)?Case Note:(.*?)(?=\*\*?\s*Care Plan:|\*\*?\s*Action Items for Case Manager:|$)/is);
const planMatch = outputText.match(/(?:\*\*\s*)?Care Plan:(.*?)(?=\*\*?\s*Action Items for Case Manager:|$)/is);
const itemsMatch = outputText.match(/(?:\*\*\s*)?Action Items for Case Manager:(.*?)(?=\n\s*\*\*|$)/is);

const careNote = noteMatch ? noteMatch[1].replace(/^\*+\s*/g, "").trim() : "";
const carePlan = planMatch ? planMatch[1].replace(/^\*+\s*/g, "").trim() : "";

const actionItems = [];
if (itemsMatch) {
  const lines = itemsMatch[1].split(/\r?\n/);
  let currentItem = "";
  for (let line of lines) {
    line = line.trim();
    if (/^(-\s*)?☑️/.test(line)) {
      if (currentItem) actionItems.push(currentItem.trim());
      currentItem = line.replace(/^(-\s*)?☑️\s*/, "").trim();
    } else if (line.length > 0) {
      currentItem += " " + line.trim();
    }
  }
  if (currentItem) actionItems.push(currentItem.trim());
}


// Print each parsed section to console
console.log("✅ Case Note:", careNote);

// Print each parsed section to console
console.log("✅ Care Plan:", carePlan);

// Print each parsed section to console
console.log("✅ Action Items:", actionItems);
