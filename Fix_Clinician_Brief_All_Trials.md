# Fix Clinician Brief - Show All Trials + Align Labels

## Issues Identified

### **Issue #1: Only "Possibly Eligible" Trials Shown**
**Problem:** The clinician brief only shows 1 trial (bc_trial_002) when Patient A should see 5-6 trials total.

**Current behavior:**
- Results page: Shows 5 trials (1 "Possibly Eligible" + 4 "Needs Confirmation")
- Clinician brief: Only shows 1 trial (the "Possibly Eligible" one)

**Expected behavior:**
- Clinician brief should show ALL matched trials, grouped by eligibility status

### **Issue #2: Label Misalignment**
**Problem:** Results page says "POSSIBLE MATCH" but brief says "Possible Match" (inconsistent capitalization and terminology)

**Current labels:**
- Results page: "POSSIBLE MATCH" / "NEEDS CONFIRMATION"
- Clinician brief: "Possible Match" / "May Not Meet" / "To Confirm"

**Expected:** Consistent terminology across both

---

## Instructions for Snapdev

@workspace Fix clinician brief to show all trials and align labels with results page

### Fix #1: Include All Trials in Clinician Brief (Not Just "Possibly Eligible")

**File:** `app/api/pdf.py` or wherever PDF generation happens

**Problem:** The PDF generation is filtering to only include trials with `eligibility_score == "possibly_eligible"`

**FIND code like:**
```python
# Current (WRONG):
possibly_eligible = [m for m in matches if m.trial.eligibility_score == "possibly_eligible"]
likely_not_eligible = [m for m in matches if m.trial.eligibility_score == "likely_not_eligible"]

# Generate PDF only with possibly_eligible trials
generate_pdf(possibly_eligible)
```

**REPLACE WITH:**
```python
# NEW (CORRECT):
# Separate trials by eligibility score
possibly_eligible = [m for m in matches if m.trial.eligibility_score == "possibly_eligible"]
needs_confirmation = [m for m in matches if m.trial.eligibility_score == "likely_not_eligible" and m.confidence in ["medium", "high"]]
other_trials = [m for m in matches if m.trial.eligibility_score == "likely_not_eligible" and m.confidence == "low"]

# Generate PDF with ALL trials, grouped by category
generate_pdf({
    "possibly_eligible": possibly_eligible,
    "needs_confirmation": needs_confirmation,
    "other_trials": other_trials
})
```

---

### Fix #2: Update PDF Template to Show All Trial Categories

**File:** PDF template (likely `templates/clinician_brief.html` or similar)

**ADD three sections instead of one:**

**CURRENT STRUCTURE (Wrong):**
```html
<h2>Possible Match Trials (1)</h2>
<p>These trials have medium confidence matches...</p>

<!-- Only shows possibly_eligible trials -->
{% for trial in possibly_eligible %}
  <div class="trial">...</div>
{% endfor %}
```

**NEW STRUCTURE (Correct):**
```html
<!-- Section 1: Strong Matches (Possibly Eligible) -->
{% if possibly_eligible|length > 0 %}
<h2>Strong Match Trials ({{ possibly_eligible|length }})</h2>
<p class="section-description">
  These trials appear to match the patient's profile well. All matches still require verification by the trial site coordinator.
</p>

{% for match in possibly_eligible %}
  <div class="trial-card strong-match">
    <div class="trial-header">
      <span class="trial-number">#{{ loop.index }}</span>
      <span class="badge badge-green">Strong Match</span>
    </div>
    
    <h3 class="trial-title">{{ match.trial.title }}</h3>
    <div class="trial-meta">
      {{ match.trial.nct_number }} • {{ match.trial.phase }} • {{ match.trial.sponsor }}
    </div>
    
    <p class="trial-goal">"{{ match.trial.translated_info.goal }}"</p>
    
    <div class="location">{{ match.trial.location }}</div>
    
    <!-- Why Matched -->
    <div class="why-matched">
      <strong>Why This Matched:</strong>
      <ul>
        {% for reason in match.why_matched %}
        <li>{{ reason }}</li>
        {% endfor %}
      </ul>
    </div>
    
    <!-- What to Confirm -->
    <div class="what-to-confirm">
      <strong>What to Confirm:</strong>
      <ul>
        {% for item in match.what_to_confirm %}
        <li>{{ item }}</li>
        {% endfor %}
      </ul>
    </div>
    
    <!-- Patient Burden -->
    <div class="patient-burden">
      <strong>Patient Burden: {{ match.confidence|capitalize }}</strong>
      <div class="burden-grid">
        <div><strong>Visits:</strong> {{ match.patient_burden.visits_per_month }}/month</div>
        <div><strong>Imaging:</strong> {{ match.patient_burden.imaging_frequency }}</div>
        <div><strong>Biopsy:</strong> {{ "Required" if match.patient_burden.biopsy_required else "Not required" }}</div>
        <div><strong>Hospital stays:</strong> {{ "Yes" if match.patient_burden.hospital_stays else "No" }}</div>
      </div>
    </div>
    
    <!-- Eligibility Summary -->
    <div class="eligibility-summary">
      <strong>Eligibility Criteria Check:</strong>
      <div class="criteria-counts">
        <span class="met">{{ match.trial.eligibility_criteria|selectattr('met', 'equalto', true)|list|length }} Met</span>
        <span class="unknown">{{ match.trial.eligibility_criteria|selectattr('met', 'equalto', 'unknown')|list|length }} To Confirm</span>
        <span class="not-met">{{ match.trial.eligibility_criteria|selectattr('met', 'equalto', false)|list|length }} May Not Meet</span>
      </div>
      
      <!-- List criteria -->
      <ul class="criteria-list">
        {% for criterion in match.trial.eligibility_criteria %}
          {% if criterion.met == true %}
          <li class="met">✓ {{ criterion.criterion }}</li>
          {% elif criterion.met == "unknown" %}
          <li class="unknown">? {{ criterion.criterion }}</li>
          {% else %}
          <li class="not-met">✗ {{ criterion.criterion }}</li>
          {% endif %}
        {% endfor %}
      </ul>
    </div>
  </div>
  
  {% if not loop.last %}<div class="trial-divider"></div>{% endif %}
{% endfor %}
{% endif %}

<!-- Section 2: Trials Needing Confirmation (Medium/High Confidence but Likely Not Eligible) -->
{% if needs_confirmation|length > 0 %}
<h2 style="margin-top: 30px;">Trials Requiring Additional Confirmation ({{ needs_confirmation|length }})</h2>
<p class="section-description">
  These trials may match but require verification of specific biomarkers or criteria. Discuss with your oncologist whether pursuing these makes sense.
</p>

{% for match in needs_confirmation %}
  <div class="trial-card needs-confirmation">
    <div class="trial-header">
      <span class="trial-number">#{{ loop.index + possibly_eligible|length }}</span>
      <span class="badge badge-amber">Needs Confirmation</span>
    </div>
    
    <h3 class="trial-title">{{ match.trial.title }}</h3>
    <div class="trial-meta">
      {{ match.trial.nct_number }} • {{ match.trial.phase }} • {{ match.trial.sponsor }}
    </div>
    
    <p class="trial-goal">"{{ match.trial.translated_info.goal }}"</p>
    
    <div class="location">{{ match.trial.location }}</div>
    
    <!-- Why Matched -->
    <div class="why-matched">
      <strong>Why This Matched:</strong>
      <ul>
        {% for reason in match.why_matched %}
        <li>{{ reason }}</li>
        {% endfor %}
      </ul>
    </div>
    
    <!-- What to Confirm (MORE IMPORTANT for these trials) -->
    <div class="what-to-confirm highlighted">
      <strong>⚠️ Critical Items to Confirm:</strong>
      <ul>
        {% for item in match.what_to_confirm %}
        <li>{{ item }}</li>
        {% endfor %}
      </ul>
    </div>
    
    <!-- Patient Burden -->
    <div class="patient-burden">
      <strong>Patient Burden: {{ match.confidence|capitalize }}</strong>
      <div class="burden-grid">
        <div><strong>Visits:</strong> {{ match.patient_burden.visits_per_month }}/month</div>
        <div><strong>Imaging:</strong> {{ match.patient_burden.imaging_frequency }}</div>
        <div><strong>Biopsy:</strong> {{ "Required" if match.patient_burden.biopsy_required else "Not required" }}</div>
        <div><strong>Hospital stays:</strong> {{ "Yes" if match.patient_burden.hospital_stays else "No" }}</div>
      </div>
    </div>
  </div>
  
  {% if not loop.last %}<div class="trial-divider"></div>{% endif %}
{% endfor %}
{% endif %}

<!-- Section 3: Other Trials (Low Confidence - Optional) -->
{% if other_trials|length > 0 and other_trials|length <= 3 %}
<h2 style="margin-top: 30px;">Other Trials for Consideration ({{ other_trials|length }})</h2>
<p class="section-description">
  These trials have lower match confidence but are included for completeness. Review with your oncologist.
</p>

{% for match in other_trials %}
  <div class="trial-card other-trial">
    <!-- Condensed format for these -->
    <div class="trial-header">
      <span class="trial-number">#{{ loop.index + possibly_eligible|length + needs_confirmation|length }}</span>
      <span class="badge badge-gray">Lower Confidence</span>
    </div>
    
    <h3 class="trial-title">{{ match.trial.title }}</h3>
    <div class="trial-meta">{{ match.trial.nct_number }} • {{ match.trial.location }}</div>
    
    <div class="what-to-confirm">
      <strong>Why lower confidence:</strong> {{ match.what_to_confirm|join(', ') }}
    </div>
  </div>
  
  {% if not loop.last %}<div class="trial-divider"></div>{% endif %}
{% endfor %}
{% endif %}
```

---

### Fix #3: Align Label Terminology

**Create a constants file for consistent labels:**

**File:** `app/constants/labels.py` (NEW FILE)

```python
"""Consistent labels across UI and PDF"""

# Eligibility score labels
ELIGIBILITY_LABELS = {
    "possibly_eligible": {
        "display": "Strong Match",
        "badge_class": "badge-green",
        "description": "Appears to meet most criteria"
    },
    "likely_not_eligible": {
        "display": "Needs Confirmation", 
        "badge_class": "badge-amber",
        "description": "May match pending verification"
    }
}

# Confidence level labels
CONFIDENCE_LABELS = {
    "high": {
        "display": "High Confidence",
        "color": "green"
    },
    "medium": {
        "display": "Medium Confidence",
        "color": "amber"
    },
    "low": {
        "display": "Lower Confidence",
        "color": "gray"
    }
}

# Criterion met status labels
CRITERION_STATUS = {
    True: {
        "symbol": "✓",
        "label": "Met",
        "class": "met"
    },
    "unknown": {
        "symbol": "?",
        "label": "To Confirm",
        "class": "unknown"
    },
    False: {
        "symbol": "✗",
        "label": "May Not Meet",
        "class": "not-met"
    }
}
```

**Then use these in BOTH frontend AND PDF generation:**

**Frontend (React):**
```typescript
import { ELIGIBILITY_LABELS } from '@/constants/labels';

<Badge className={ELIGIBILITY_LABELS[trial.eligibility_score].badge_class}>
  {ELIGIBILITY_LABELS[trial.eligibility_score].display}
</Badge>
```

**Backend (PDF generation):**
```python
from app.constants.labels import ELIGIBILITY_LABELS

# In template context
context = {
    "eligibility_labels": ELIGIBILITY_LABELS,
    ...
}
```

---

### Fix #4: Update Frontend Results Page Labels

**File:** Frontend trial results component

**CURRENT (inconsistent):**
```tsx
{trial.eligibility_score === "possibly_eligible" ? (
  <Badge variant="success">POSSIBLE MATCH</Badge>
) : (
  <Badge variant="warning">NEEDS CONFIRMATION</Badge>
)}
```

**NEW (consistent with PDF):**
```tsx
{trial.eligibility_score === "possibly_eligible" ? (
  <Badge variant="success">Strong Match</Badge>
) : (
  <Badge variant="warning">Needs Confirmation</Badge>
)}
```

---

### Fix #5: Update Executive Summary Count

**File:** PDF template - Executive Summary section

**CURRENT (Wrong):**
```html
<h3>Executive Summary</h3>
<div class="summary-stat">
  <span class="count">1</span> Possible Match
</div>
```

**NEW (Correct):**
```html
<h3>Executive Summary</h3>
<div class="summary-stats">
  {% if possibly_eligible|length > 0 %}
  <div class="stat">
    <span class="count green">{{ possibly_eligible|length }}</span> 
    <span class="label">Strong Match{{ "es" if possibly_eligible|length != 1 else "" }}</span>
  </div>
  {% endif %}
  
  {% if needs_confirmation|length > 0 %}
  <div class="stat">
    <span class="count amber">{{ needs_confirmation|length }}</span> 
    <span class="label">Need{{ "s" if needs_confirmation|length == 1 else "" }} Confirmation</span>
  </div>
  {% endif %}
  
  {% if other_trials|length > 0 %}
  <div class="stat">
    <span class="count gray">{{ other_trials|length }}</span> 
    <span class="label">Other Trial{{ "s" if other_trials|length != 1 else "" }}</span>
  </div>
  {% endif %}
</div>
```

---

## Testing After Fixes

### Test #1: Verify All Trials Appear in PDF

**Run:**
```bash
# Generate PDF for Patient A
curl -X POST http://localhost:8000/api/v1/generate-brief \
  -d @test_patient_a.json \
  -o patient_a_brief.pdf

# Open PDF
open patient_a_brief.pdf
```

**Expected in PDF:**
```
Executive Summary:
1 Strong Match
4 Need Confirmation

Strong Match Trials (1):
- Sacituzumab Govitecan...

Trials Requiring Additional Confirmation (4):
- DESTINY-Breast06...
- Capivasertib...
- Elacestrant...
- Rintodestrant...
```

### Test #2: Verify Label Consistency

**Check:**
- [ ] Results page badge says "Strong Match" (not "POSSIBLE MATCH")
- [ ] Results page badge says "Needs Confirmation" (not "LIKELY NOT ELIGIBLE")
- [ ] PDF sections use same labels as results page
- [ ] Confidence levels consistent (High/Medium/Low)

### Test #3: Verify Trial Count Matches

**Expected:**
- Results page: "5 Possibly Eligible" (or however many)
- PDF Executive Summary: "1 Strong Match, 4 Need Confirmation"
- **Total should match!**

---

## Implementation Checklist

- [ ] **Step 1:** Update PDF generation to include all trial categories (not just possibly_eligible)
- [ ] **Step 2:** Create three sections in PDF template (Strong Match / Needs Confirmation / Other)
- [ ] **Step 3:** Create labels constants file
- [ ] **Step 4:** Update frontend to use consistent labels
- [ ] **Step 5:** Update PDF template to use consistent labels
- [ ] **Step 6:** Fix executive summary to show all counts
- [ ] **Step 7:** Test with Patient A (should show 5-6 trials in PDF)
- [ ] **Step 8:** Verify labels match between results page and PDF

---

## Visual Design Notes for PDF

**Badge Colors:**
```css
.badge-green {
  background: #10b981;
  color: white;
  /* Strong Match */
}

.badge-amber {
  background: #f59e0b;
  color: white;
  /* Needs Confirmation */
}

.badge-gray {
  background: #6b7280;
  color: white;
  /* Lower Confidence */
}
```

**Section Spacing:**
```css
.trial-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.trial-card.needs-confirmation {
  border-left: 4px solid #f59e0b; /* Amber accent */
}

.trial-card.strong-match {
  border-left: 4px solid #10b981; /* Green accent */
}
```

---

## Summary of Changes

### **What's Fixed:**

1. ✅ **PDF now includes ALL trials** (not just "possibly_eligible")
2. ✅ **Trials grouped by confidence** (Strong Match / Needs Confirmation / Other)
3. ✅ **Labels consistent** between results page and PDF
4. ✅ **Executive summary counts** show all trial categories
5. ✅ **Visual hierarchy** clear (strong matches prominent, others secondary)

### **Expected Patient A Results:**

**Before Fix:**
- Results page: 5 trials shown
- PDF: Only 1 trial shown ❌

**After Fix:**
- Results page: 5 trials shown
- PDF: 5 trials shown (1 Strong Match + 4 Needs Confirmation) ✅
- Labels consistent across both ✅

---

**Estimated Implementation Time:** 1-2 hours

**START IMPLEMENTATION**

Apply these fixes to ensure clinician brief shows all matched trials with consistent labeling.
