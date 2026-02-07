# TrialScout PRD v1.0
**AI-Powered Clinical Trial Matching for Cancer Patients**

**Author:** Product Team  
**Date:** February 7, 2025  
**Status:** Draft for Review  
**Target Launch:** April 2025 (8 weeks)

---

## Core PRD

### 1. Executive Summary

**Problem**  
Only 6–8% of U.S. cancer patients participate in therapeutic clinical trials, despite trials often representing the fastest path to novel treatments. Patients lack accessible tools to interpret complex eligibility criteria, understand biomarker requirements, and confidently initiate trial conversations with their oncologists.

**Solution**  
TrialScout is a patient-facing web application that provides biomarker-aware trial matching with transparent reasoning and generates a clinician-ready brief to support informed doctor-patient conversations. The product never determines eligibility—it surfaces possibilities and scaffolds productive clinical discussions.

**User Job-to-be-Done**  
*"When I learn my cancer has progressed or I want to explore all options, I need to find trials I can confidently discuss with my oncologist, so I feel empowered and don't miss potentially beneficial treatments."*

**Differentiation**  
1. **Transparency:** Explicit "why matched" and "what to confirm" for every trial (vs black-box algorithms)
2. **Clinician-ready:** One-page brief oncologists can actually use in appointments (vs overwhelming data dumps)

**Success Criteria**  
- **Primary:** ≥40% of users who complete intake download a clinician brief
- **Clinical quality:** ≥80% oncologist agreement that surfaced trials are "worth discussing"
- **Trust:** ≥80% of users understand why trials were matched

**Non-Negotiables**  
- Trust is a first-order product requirement
- Product never replaces clinical judgment or determines eligibility
- System is transparent about uncertainty and limitations
- All matching logic is deterministic and auditable

---

### 2. Goals & Success Metrics

**North Star Metric**  
**Percentage of users who download a clinician brief** (proxy for "found value worth discussing with oncologist")

**HEART Framework Metrics**

| Dimension | Metric | Target | Measurement |
|-----------|--------|--------|-------------|
| **Happiness** | Trust score: "I understand why these trials were matched" | ≥80% agree/strongly agree | Exit survey (optional) |
| **Engagement** | Intake completion rate | ≥60% | Analytics: % who reach results page |
| **Adoption** | Download rate: % who download clinician brief | ≥40% | Analytics: download button clicks |
| **Retention** | N/A for MVP | — | Consider for V2 (saved searches) |
| **Task Success** | Median time from start to first trial detail view | <5 minutes | Analytics: timestamp deltas |

**Clinical Quality Metrics** (Validator Testing)  
- ≥80% oncologist agreement: "At least one trial is worth discussing" (N=50 reviews)
- Zero critical safety violations (wrong stage, contraindicated biomarker, excluded ECOG)
- False positive rate: <10% ("Possibly Eligible" but oncologist says "clearly ineligible")

**Guardrail Metrics** (Monitoring)  
- Trial data freshness: ≥90% of trials updated within 7 days
- Matching performance: <3 seconds for 95th percentile
- Error rate: <5% of sessions encounter technical errors

**Out of Scope for MVP**  
- Actual enrollment rates (too far downstream)
- Long-term survival outcomes (requires years of follow-up)
- Referral conversion (depends on trial site capacity)

---

### 3. User Experience & Core Flows

**Primary User Personas**

**Persona 1: Sarah (Stage IV Breast Cancer Patient)**  
- Age 52, ER+/HER2-, post-CDK4/6 inhibitor progression
- Job: Find 2-3 trials to discuss at next oncology appointment
- Pain point: ClinicalTrials.gov is overwhelming; doesn't know which trials fit her biomarkers
- Success: Downloads brief with 3 trials, feels confident asking oncologist about them

**Persona 2: James (Caregiver for Father with NSCLC)**  
- Age 35, researching options for father (EGFR+, post-osimertinib)
- Job: Present curated trial options to father and oncologist
- Pain point: Limited medical knowledge, worried about missing something critical
- Success: Brief explains trials in plain language; oncologist confirms relevance

**Core User Flow**

```
1. LANDING
   ↓ [Start Assessment]
   
2. INTAKE (4 steps, ~3 minutes)
   Step 1: Cancer Type (Breast or Lung) + Stage (I/II/III/IV)
   Step 2: Demographics (Age, Sex) + ECOG Performance Status
   Step 3: Biomarkers (ER/PR/HER2 for breast; EGFR/ALK/KRAS for lung)
   Step 4: Treatment History (Prior therapies, current line)
   ↓ [Find Trials]
   
3. RESULTS (~2 minutes)
   - Ranked trials with match scores (95-99 for high confidence)
   - "What's Being Tested" (plain English)
   - "Why You Match" (2-3 specific criteria met)
   - "What to Confirm" (1-3 items to verify)
   - "What You'll Do" (visits/month, imaging frequency, biopsies)
   ↓ [See Full Details] or [Download Brief]
   
4. TRIAL DETAIL MODAL
   - Tabs: Overview | How It Works | Eligibility | Locations
   - NCT ID, phase, sponsor, recruiting status
   - Timeline (screening → treatment → follow-up)
   ↓ [Download Brief]
   
5. CLINICIAN BRIEF (PDF)
   - Patient profile summary
   - Top 3-5 matched trials
   - "Why matched" + "What to confirm" for each
   - Footer: "For discussion with oncologist only"
```

**Key UX Requirements**  
- **Plain language:** No medical jargon without explanation
- **Explicit uncertainty:** Show confidence levels (High/Medium/Low)
- **No false promises:** Never use "you are eligible" or "this will work"
- **Graceful zero-state:** If no matches, show exploratory options + "discuss with oncologist"
- **Mobile responsive:** 40% of users access on mobile (healthcare trend)

**"Try with Sample Patient" Feature**  
- Pre-fills demo data (Stage IV NSCLC, EGFR+, post-osimertinib)
- Jumps directly to results page
- Educational tool for caregivers, oncologists, or curious visitors

---

### 4. MVP Scope & Launch Strategy

**MVP Scope (V1.0 - 8 weeks from today)**

**In Scope:**
- 20 manually curated trials (10 breast cancer, 10 NSCLC, NYC metro only)
- Rule-based matching algorithm (deterministic, auditable)
- 4-step intake flow with biomarker selection
- Results page with ranked trials (match scores, reasons, patient burden)
- Trial detail modal (tabs: Overview, How It Works, Eligibility, Locations)
- Clinician brief generation (PDF export, print-optimized)
- sessionStorage only (no user accounts, no PHI persistence)
- "Try with Sample Patient" demo feature
- Exit survey (optional, post-download)

**Out of Scope for MVP:**
- Automated trial ingestion (ClinicalTrials.gov API)
- EMR integration
- User accounts or saved searches
- Email notifications or follow-ups
- Enrollment support or trial coordinator workflows
- Cancer types beyond breast and NSCLC

**Launch Strategy (Phased Rollout)**

**Phase 0: User Research (Weeks 1-2)**  
*Planned post-Maven PM course completion*
- Conduct 8-10 interviews with Stage IV breast/NSCLC patients
- Key questions: Trial awareness, decision-making process, oncologist relationship
- Exit criteria: Validated top 3 pain points and "job-to-be-done"

**Phase 1: Internal Alpha (Week 3)**  
- Deploy to staging environment
- Test with 5 internal users using sample patient profiles
- Validate matching logic against 20 edge cases
- Exit criteria: Zero critical safety violations, clinical advisor approval

**Phase 2: Limited Beta (Weeks 4-6)**  
- Recruit 25 cancer patients via advocacy partner (e.g., LUNGevity, Living Beyond Breast Cancer)
- Recruit 3 community oncologists as validators
- Method: Patients complete intake → generate briefs → oncologists review 10 random briefs
- Exit criteria:
  - ≥60% intake completion rate
  - ≥40% download clinician brief
  - ≥80% oncologist agreement on relevance
  - ≥80% patient trust score
  - <5 critical bugs reported

**Phase 3: Pilot with Cancer Center (Weeks 7-12)**  
- Partner: One NYC cancer center (TBD - target: Memorial Sloan Kettering or similar)
- Oncologists refer 100 eligible patients to TrialScout
- Patients bring brief to next appointment
- Post-appointment survey: "Did you discuss trials?"
- Exit criteria:
  - ≥50% of patients report discussing ≥1 trial
  - ≥70% of oncologists report brief was "helpful"
  - ≥30% of patients referred to trial coordinator for screening
- Decision: Expand to 3 more centers OR iterate based on feedback

**Phase 4: Public Beta (Month 4+)**  
- Open web access with rate limiting (100 users/day initially)
- Expand to 50 trials per cancer type
- Add automated trial data updates (daily)

---

### 5. Risk Management & Mitigations

| **Risk** | **Likelihood** | **Impact** | **Mitigation** |
|----------|---------------|-----------|---------------|
| **Over-trust in algorithmic output** | High | Critical | • Explicit disclaimers: "For educational purposes only"<br>• No "you are eligible" language<br>• Mandatory "What to Confirm" for every trial<br>• Conservative ECOG/biomarker matching |
| **Trial data staleness** | Medium | High | • Daily manual updates (Phase 1-2)<br>• "Last Updated" timestamp on every trial<br>• Warning banner if trial >30 days old<br>• Automated ingestion in Phase 3+ |
| **Legal/ethical misinterpretation** | Medium | Critical | • Terms of Service: "Not medical advice"<br>• Footer disclaimer on every page<br>• Conservative UX copy (reviewed by legal advisor)<br>• No PHI storage (HIPAA not applicable) |
| **Clinical validator unavailability** | Medium | High | • Identify backup oncologist<br>• Community oncology group partnership<br>• Delay Phase 2 launch if needed |
| **Low patient adoption** | Medium | Medium | • User research to validate pain points<br>• Iterate on UX based on Beta feedback<br>• Expand marketing via advocacy groups |
| **Matching logic errors** | Low | Critical | • Comprehensive test suite (50+ edge cases)<br>• Clinical advisor review of all rules<br>• Audit logs: log every matching decision<br>• Version tracking: dataset_version + ruleset_version |

**Rollback Plan**  
- If critical safety violation found in Beta: Immediate shutdown, fix matching logic, re-validate with clinical advisor
- If low adoption (<20% downloads): Extended Beta period, UX iteration, additional user research
- If oncologist pushback: Conduct focus groups, refine clinician brief format, add more detail

---

## Appendices

### Appendix A: Functional Requirements & Acceptance Criteria

**A1. Intake Flow**

**Requirements:**
- [ ] Four-step intake: Cancer Type → Demographics → Biomarkers → Treatment History
- [ ] Progress indicator shows current step (33% → 66% → 100%)
- [ ] All fields have helper text explaining why information is needed
- [ ] "Try with Sample Patient" button pre-fills demo data and jumps to results
- [ ] Intake data persists in sessionStorage (cleared on tab close)

**Acceptance Criteria:**
- [ ] Cancer type selection: Only "Breast Cancer" and "Lung Cancer (NSCLC)" available
- [ ] Stage selection: I, II, III, IV (buttons with brief descriptions)
- [ ] ECOG 0-4 dropdown includes plain-language descriptions
- [ ] "I don't know my ECOG status" checkbox → treated as neutral in matching
- [ ] Biomarker selectors: 3-state buttons (Present ✓ / Absent ✗ / Unknown ○)
- [ ] Breast biomarkers: ER, PR, HER2 (with subtypes: 0, Low, Positive)
- [ ] Lung biomarkers: EGFR (with subtypes), ALK, ROS1, KRAS, MET, PD-L1
- [ ] Prior therapy: Checkboxes for Surgery, Radiation, Medication
- [ ] If Medication checked → show cancer-specific treatment options
- [ ] Back/Next buttons: Back = previous step, Next = validate and advance
- [ ] Validation: Cannot proceed to results without Cancer Type + Stage

---

**A2. Matching Logic (Rule-Based)**

**Requirements:**
- [ ] Matching algorithm is deterministic (same input → same output, always)
- [ ] All matching decisions are auditable (log which rules fired)
- [ ] Matching completes in <3 seconds for 95th percentile

**Hard Exclusions (Trial immediately excluded):**
- [ ] HER2+ trials excluded if patient is HER2-negative or HER2-low
- [ ] HER2-low trials excluded if patient is HER2-negative or HER2-positive
- [ ] EGFR-mutant trials excluded if patient has ALK+ or ROS1+ (mutual exclusivity)
- [ ] Stage-specific trials: Stage IV patients excluded from neoadjuvant-only or adjuvant-only trials
- [ ] ECOG requirements: If trial requires ECOG 0-1 and patient is ECOG 3-4 → exclude
- [ ] Mutation-required trials: If trial requires EGFR exon 19 deletion and patient has L858R → exclude
- [ ] Prior therapy exclusions: If trial says "no prior osimertinib" and patient has prior osimertinib → exclude

**Soft Downgrades (Trial shown but flagged as "What to Confirm"):**
- [ ] ECOG 2 patients shown ECOG 0-1 trials with "Confirm ECOG eligibility with oncologist"
- [ ] Missing biomarker data (e.g., PD-L1 unknown) → trial shown with "Confirm PD-L1 status"
- [ ] Washout period unclear → "Confirm adequate washout from last therapy (typically 14-21 days)"

**Match Scoring:**
- [ ] Base score: 85 points
- [ ] +5 points: All major biomarkers confirmed match
- [ ] +3 points: ECOG explicitly meets requirement (not just "unknown")
- [ ] +2 points: Trial location <10 miles from patient
- [ ] +5 points: First-line trial and patient is first-line
- [ ] -5 points: Any "What to Confirm" item present
- [ ] Final score: 85-99 range (capped at 99, never 100 to avoid false certainty)

**Match Confidence:**
- [ ] High: Score ≥95, all major criteria met, ≤1 "What to Confirm" item
- [ ] Medium: Score 90-94, OR ≥2 "What to Confirm" items
- [ ] Low: Score <90, OR critical biomarker unknown

---

**A3. Results Page**

**Requirements:**
- [ ] Encouragement banner at top: "We found X trials that may match your profile"
- [ ] Download Report button prominently displayed in banner
- [ ] Trials sorted by eligibility score (Possibly Eligible first, then Likely Not Eligible)
- [ ] Within "Possibly Eligible", sort by match score (99 → 95 → 90)

**Trial Card Components:**
- [ ] Match score (large, bold): e.g., "99" with "/100 match"
- [ ] Visual progress bar matching score (green for ≥95, amber for <95)
- [ ] Badge: "⭐ BEST MATCH" for highest score, "STRONG MATCH" for others
- [ ] Eligibility badge: Green "Possibly Eligible" or Amber "Likely Not Eligible"
- [ ] Trial title + NCT number
- [ ] Phase + Recruiting status (with pulse indicator if recruiting)
- [ ] Location + distance (e.g., "Memorial Sloan Kettering, 8 miles")
- [ ] "What's Being Tested" section (2-3 sentences, plain English)
- [ ] "Why You Match" list (2-4 specific criteria with green checkmarks)
- [ ] "What You'll Do" section (patient burden):
  - Visits per month
  - Imaging frequency
  - Biopsy required (yes/no)
  - Hospital stays (yes/no)
- [ ] "What to Confirm" list (1-3 items with amber warning icons)
- [ ] Action buttons: "See Full Details" (primary) and "Download Brief" (secondary)

**Zero-State Handling:**
- [ ] If 0 "Possibly Eligible" trials: Show empty state with message:
  - "We didn't find trials that exactly match your profile. This doesn't mean there aren't options:"
  - Button: "View exploratory options" (shows "Likely Not Eligible" trials)
  - Button: "Download results to discuss with your oncologist"
  - Link: "Learn about expanded access programs"

**"Other Trials" Section:**
- [ ] Collapsed by default with toggle: "Show trials outside your biomarker profile (X)"
- [ ] Requires acknowledgment: Warning message "These trials may not match your biomarkers"
- [ ] Trials displayed with reduced opacity (opacity-75)
- [ ] Amber badge: "LIKELY NOT ELIGIBLE"

---

**A4. Trial Detail Modal**

**Requirements:**
- [ ] Modal opens on "See Full Details" click
- [ ] Four tabs: Overview | How It Works | Eligibility | Locations
- [ ] Modal is scrollable on mobile
- [ ] Close button (X) in top-right corner
- [ ] Keyboard accessible (Tab navigation, Escape to close)

**Overview Tab:**
- [ ] Trial title + NCT number (linked to ClinicalTrials.gov)
- [ ] Phase, sponsor, recruiting status, last updated date
- [ ] "In Plain English" section:
  - What's Being Tested (from translatedInfo.design)
  - The Goal (from translatedInfo.goal)
- [ ] "Why This Matched" panel (green background, checkmarks)
- [ ] "What to Confirm Next" panel (amber background, warning icons)

**How It Works Tab:**
- [ ] Treatment Timeline (visual or text):
  - Week 1: Screening
  - Week 2: Randomization (explain what this means)
  - Month 1-3: Active treatment
  - Month 4+: Maintenance
- [ ] What Happens (from translatedInfo.whatHappens)
- [ ] How Long (from translatedInfo.duration)

**Eligibility Tab:**
- [ ] Eligibility criteria grouped into:
  - ✅ You Meet These (green section)
  - ❓ Need to Confirm (amber section)
  - ❌ May Not Meet (red section, if any)
- [ ] Legend at bottom: ✓ Criterion Met | ? More Info Needed | ✗ May Not Meet

**Locations Tab:**
- [ ] List of trial sites (for MVP: single NYC location per trial)
- [ ] Address, distance from patient
- [ ] Contact info: trial coordinator phone/email (if available)
- [ ] "Before Your Visit" section (practical tips):
  - Bring all current medications and supplements
  - Bring recent lab results and imaging reports
  - Prepare questions for the research team
  - Plan for the visit to take 2-3 hours

---

**A5. Clinician Brief (PDF)**

**Requirements:**
- [ ] One-page format (ideally), max 2 pages
- [ ] Print-optimized: Serif font (Georgia or Times), black text on white
- [ ] Professional medical report aesthetic

**Required Content:**

**Header:**
- [ ] Title: "Clinical Trial Matching Report"
- [ ] Subtitle: "Generated by TrialScout"
- [ ] Date: [Generation date]
- [ ] Version: "v1.0"

**Patient Profile Section:**
- [ ] Demographics: Age, Sex
- [ ] Diagnosis: [Cancer type], Stage [X]
- [ ] ECOG Performance Status: [0-4 or Unknown]
- [ ] Key Biomarkers:
  - For breast: ER, PR, HER2 status
  - For lung: EGFR, ALK, ROS1, KRAS, PD-L1 status
- [ ] Prior Treatments: List of therapies received
- [ ] Current Line of Therapy: [First-line, Post-targeted, Later-line]

**Matched Trials Section (Top 3-5):**

For each trial:
- [ ] Trial title + NCT ID (bolded)
- [ ] Phase | Sponsor | Recruiting Status
- [ ] Location: [Hospital name], [distance] miles
- [ ] Match Score: [X]/100 | Confidence: [High/Medium/Low]
- [ ] Why Matched: Bulleted list (2-4 specific criteria)
- [ ] What to Confirm: Bulleted list (1-3 items to verify)
- [ ] Trial Contact: [Coordinator name/phone if available, else "See ClinicalTrials.gov"]

**Footer:**
- [ ] Disclaimer: "This report is for educational purposes only and does not determine trial eligibility. Final eligibility must be confirmed by the trial site."
- [ ] Small print: "Generated by TrialScout on [date] | Dataset version [X.Y] | Ruleset version [X.Y]"
- [ ] Link: "Learn more at trialscout.com"

**Export Requirements:**
- [ ] PDF format (not Word, not HTML)
- [ ] File size <500 KB
- [ ] File name: "TrialScout_Brief_[Date].pdf"
- [ ] Renders correctly when emailed (mobile-friendly if viewed on phone)

---

### Appendix B: Technical Architecture

**Architecture Overview**

```
┌─────────────────────────────────────────────┐
│ FRONTEND (React/TypeScript)                 │
│ • Lovable.dev deployment                    │
│ • sessionStorage only (no cookies)          │
│ • Intake forms, results page, modals        │
└─────────────────────────────────────────────┘
                    ↓ HTTPS
┌─────────────────────────────────────────────┐
│ BACKEND API (Python FastAPI)                │
│ • Hosted: Replit or Vercel                  │
│ • Endpoints: /match, /trials/{id}, /brief   │
│ • Rule-based matching engine                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ DATABASE (PostgreSQL)                       │
│ • Supabase (managed Postgres)               │
│ • Tables: trials, biomarkers, eligibility   │
│ • Read-only for matching (no PHI stored)    │
└─────────────────────────────────────────────┘
```

**Technology Stack**

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend** | React + TypeScript + Tailwind CSS | Lovable.dev output, modern stack |
| **UI Components** | shadcn/ui + Framer Motion | Pre-built, accessible, polished |
| **State Management** | React Context + sessionStorage | Simple, no Redux needed for MVP |
| **Backend** | Python 3.11 + FastAPI | Fast, modern, great for data/ML |
| **Matching Logic** | Pure Python (if/then rules) | Deterministic, testable, no ML |
| **Database** | PostgreSQL (Supabase) | Reliable, full-text search, free tier |
| **File Storage** | N/A (PDFs generated on-demand) | No persistent storage needed |
| **Analytics** | Google Analytics 4 or Mixpanel | Track funnel, no custom infra |
| **Error Tracking** | Sentry (free tier) | Real-time error alerts |
| **Hosting** | Vercel (frontend) + Replit (backend) | Free tiers, easy deployment |

**API Endpoints (Backend)**

**POST /api/match**
- Input: Patient profile JSON (cancer type, stage, biomarkers, treatment history)
- Output: List of matched trials with scores, reasons, confidence
- Logic: Rule-based matching algorithm
- Performance: <3 seconds for 95th percentile
- Rate limit: 100 requests/IP/hour

**GET /api/trials/{nct_id}**
- Input: NCT number (e.g., "NCT05894239")
- Output: Full trial details (all fields)
- Cache: 1 hour (trials don't change frequently)

**POST /api/brief**
- Input: Patient profile + matched trials
- Output: PDF blob (clinician brief)
- Logic: Template-based PDF generation (ReportLab or similar)
- Performance: <5 seconds

**GET /api/health**
- Output: { "status": "ok", "dataset_version": "1.0", "last_updated": "2025-02-07" }
- Used for: Monitoring, uptime checks

**Data Model (PostgreSQL)**

**Table: trials**
```sql
CREATE TABLE trials (
  id SERIAL PRIMARY KEY,
  nct_number VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  phase VARCHAR(20),
  sponsor VARCHAR(255),
  status VARCHAR(20), -- recruiting, active_not_recruiting, etc.
  location VARCHAR(255),
  distance_miles INT,
  cancer_type VARCHAR(20), -- 'breast' or 'lung'
  last_updated DATE NOT NULL,
  eligibility_score VARCHAR(20), -- 'possibly_eligible' or 'likely_not_eligible'
  match_confidence VARCHAR(20), -- 'high', 'medium', 'low'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: eligibility_criteria**
```sql
CREATE TABLE eligibility_criteria (
  id SERIAL PRIMARY KEY,
  trial_id INT REFERENCES trials(id),
  criterion TEXT NOT NULL,
  category VARCHAR(50), -- 'biomarker', 'stage', 'treatment_history', etc.
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: trial_metadata**
```sql
CREATE TABLE trial_metadata (
  id SERIAL PRIMARY KEY,
  trial_id INT REFERENCES trials(id),
  field_name VARCHAR(100), -- 'translatedInfo.design', 'burden.visitsPerMonth', etc.
  field_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Rule-Based Matching Algorithm (Pseudocode)**

```python
def match_trials(patient_profile, all_trials):
    matched_trials = []
    
    for trial in all_trials:
        # Hard exclusions
        if should_exclude(patient_profile, trial):
            continue
        
        # Calculate match score
        score = calculate_score(patient_profile, trial)
        
        # Determine confidence
        confidence = determine_confidence(patient_profile, trial, score)
        
        # Generate reasons
        why_matched = generate_why_matched(patient_profile, trial)
        what_to_confirm = generate_what_to_confirm(patient_profile, trial)
        
        matched_trials.append({
            "trial": trial,
            "score": score,
            "confidence": confidence,
            "why_matched": why_matched,
            "what_to_confirm": what_to_confirm
        })
    
    # Sort by eligibility score (possibly_eligible first), then by match score
    return sorted(matched_trials, key=lambda x: (
        x["trial"]["eligibility_score"] == "possibly_eligible",
        x["score"]
    ), reverse=True)

def should_exclude(patient, trial):
    # Example exclusion rules
    if trial.requires_her2_positive and patient.her2_status == "negative":
        return True
    if trial.max_ecog == 1 and patient.ecog >= 3:
        return True
    if trial.requires_egfr_mutation and patient.egfr_status == "negative":
        return True
    # ... more rules
    return False

def calculate_score(patient, trial):
    score = 85  # Base score
    
    # Bonus points
    if patient.stage == trial.required_stage:
        score += 5
    if patient.ecog is not None and patient.ecog <= trial.max_ecog:
        score += 3
    if trial.distance_miles < 10:
        score += 2
    
    # Penalty points
    if len(generate_what_to_confirm(patient, trial)) > 0:
        score -= 5
    
    return min(score, 99)  # Cap at 99 (never 100 = false certainty)
```

**Performance Requirements**
- Matching: <3 seconds for 95th percentile
- Trial detail fetch: <1 second
- Clinician brief generation: <5 seconds
- Page load times: <2 seconds for all pages
- Mobile: Must work on 3G connection (optimize bundle size)

**Security**
- HTTPS only (SSL/TLS 1.3)
- CORS: Only allow requests from trialscout.com
- Rate limiting: 100 requests/IP/hour
- No API keys or secrets exposed client-side
- Input validation: Sanitize all user inputs to prevent injection attacks
- DDoS protection: Cloudflare or similar

**Observability**
- Error tracking: Sentry (free tier, 5K errors/month)
- Analytics: Google Analytics 4 or Mixpanel (free tier)
- Logging: Structured JSON logs (timestamp, user_id, action, dataset_version)
- Monitoring: Uptime checks every 5 minutes (UptimeRobot or similar)

---

### Appendix C: Data Strategy

**MVP Data Source (Phase 1-2)**
- **Method:** Manual curation
- **Scope:** 20 trials (10 breast, 10 NSCLC, NYC metro only)
- **Process:**
  1. Search ClinicalTrials.gov for recruiting trials
  2. Export trial details (NCT ID, title, eligibility criteria)
  3. Clinical advisor reviews and structures criteria into required fields
  4. Enter into database (via admin interface or SQL script)
  5. Generate plain-language summaries (hand-written by PM + clinical advisor)
- **Update frequency:** Weekly manual review
- **Quality control:** Clinical advisor spot-checks all trials before going live

**Trial Selection Criteria (for MVP)**
- Status: Recruiting (not completed, suspended, or withdrawn)
- Location: ≤20 miles from NYC (Manhattan, Brooklyn, Queens)
- Cancer types: Breast or NSCLC only
- Phase: II or III (exclude Phase I for safety, exclude Phase IV for low patient interest)
- Design: Interventional (exclude observational studies)
- Enrollment: ≥50 (exclude tiny trials with limited slots)
- Sponsor: Reputable pharma or academic medical center (exclude sketchy sponsors)

**Data Quality Checklist (per trial)**
- [ ] NCT number valid (links to ClinicalTrials.gov)
- [ ] Title accurate and up-to-date
- [ ] Phase confirmed
- [ ] Recruiting status verified within last 7 days
- [ ] Location address accurate (Google Maps check)
- [ ] Distance calculated correctly
- [ ] Eligibility criteria structured correctly:
  - Biomarkers: EGFR/ALK/HER2/ER/PR/PD-L1 clearly specified
  - Stage requirements: I/II/III/IV explicitly stated
  - ECOG requirements: 0-1, 0-2, or any explicitly stated
  - Prior therapy exclusions: Listed (e.g., "no prior osimertinib")
- [ ] Plain-language summary written (translatedInfo fields)
- [ ] Patient burden fields populated (visits/month, imaging, biopsies, hospital stays)
- [ ] Contact info for trial coordinator (if available)

**V2 Data Strategy (Phase 3+)**
- **Method:** Manual upload via CSV + review interface
- **Scope:** Expand to 50-100 trials per cancer type
- **Process:**
  1. Export trial list from ClinicalTrials.gov (CSV)
  2. Upload to admin interface
  3. LLM parses eligibility criteria into structured fields (with human review)
  4. Clinical advisor reviews and approves each trial
  5. Trials go live after approval
- **Update frequency:** Weekly batch upload
- **Quality control:** Clinical advisor reviews 10% random sample

**V3 Data Strategy (Future)**
- **Method:** Automated ingestion with LLM parsing
- **Scope:** 500+ trials, national coverage, 10+ cancer types
- **Process:**
  1. Daily API fetch from ClinicalTrials.gov
  2. LLM extracts structured eligibility criteria
  3. Automated quality checks (missing fields, suspicious data)
  4. Flagged trials reviewed by clinical advisor (spot-check 5%)
  5. Trials auto-publish after passing quality checks
- **Update frequency:** Daily
- **Quality control:** Automated checks + human review of edge cases

**Data Versioning**
- Every dataset tagged with version ID (e.g., "v1.0", "v1.1")
- Every matching decision logged with dataset version used
- Clinician briefs include dataset version in footer
- Allows rollback if bad data introduced

**Trial Staleness Warnings**
- Trials >7 days old: No warning (normal)
- Trials 8-30 days old: Small banner "Last updated [X] days ago"
- Trials >30 days old: Prominent banner "⚠️ This trial may be outdated. Confirm status at ClinicalTrials.gov"

---

### Appendix D: Privacy & Compliance

**Data Handling**
- **No PHI stored:** All patient data exists only in sessionStorage (browser), cleared on tab close
- **No user accounts:** No email, name, phone, or persistent identifiers collected
- **No server-side logging of PHI:** Matching happens server-side but patient data is NOT logged or persisted
- **Analytics:** Only aggregate, anonymized data (e.g., "50 users completed intake today", "median time 4 mins")
- **IP addresses:** Logged only for rate limiting (24-hour retention), then deleted

**Compliance**
- **HIPAA:** Not applicable (no PHI created, stored, or transmitted persistently)
- **GDPR:** Not applicable (no PII collected; no EU users targeted in MVP)
- **CCPA:** Not applicable (no personal information sold or shared)
- **FDA:** Not applicable (informational tool, not a medical device)

**Disclaimers (Displayed Throughout App)**

**Landing Page:**
> "TrialScout is an educational tool to help you explore clinical trial options. It does not determine eligibility or provide medical advice. Always discuss trials with your oncologist."

**Results Page Footer:**
> "Trial information is for educational purposes only. Eligibility must be confirmed with the trial site. Last updated: [date]."

**Clinician Brief Footer:**
> "This report is for educational purposes only and does not determine trial eligibility. Final eligibility must be confirmed by the trial site."

**Terms of Service (Summary)**
- User acknowledges tool is informational only
- No warranty or guarantee of trial eligibility or accuracy
- User responsible for verifying information with oncologist
- No liability for decisions made based on tool output
- No medical advice provided

**Security Measures**
- HTTPS only (SSL/TLS 1.3)
- No API keys or credentials exposed client-side
- Rate limiting: 100 requests/IP/hour
- DDoS protection: Cloudflare or similar
- Input validation: Sanitize all user inputs
- No credit card processing (free tool)

**User Survey Compliance**
- Exit survey is OPTIONAL (not required to use tool)
- Anonymous: No email or name collected
- Only asks:
  - "I understand why these trials were matched" (Likert scale)
  - "I plan to discuss these trials with my oncologist" (Yes/No/Unsure)
  - "How could we improve?" (free text, optional)
- Responses stored anonymously (no linkage to patient profile)

---

### Appendix E: Competitive Landscape

**Existing Clinical Trial Matching Tools**

| Tool | Strengths | Weaknesses | TrialScout Advantage |
|------|-----------|------------|---------------------|
| **ClinicalTrials.gov** | Comprehensive (429K trials), authoritative | Overwhelming, medical jargon, no matching | Curated, plain language, transparent matching |
| **Antidote** | Patient-facing, nice UX | Black-box matching, extensive data entry, slow | Transparent "why matched", faster (<5 min) |
| **Clara Health** | Patient-facing, pretty UI | Requires account, opaque matching | No account needed, explicit reasoning |
| **TrialJectory** | Broad trial coverage | Complex intake, no transparency | Simpler intake, clear "what to confirm" |
| **Tempus / Foundation Medicine** | Deep genomic analysis | Clinician-facing only, expensive ($5K+) | Patient-facing, free, accessible |
| **Deep 6 AI** | EHR-integrated, automated matching | Only available to health systems | Direct patient access, no EHR needed |
| **IBM Watson Oncology** | Comprehensive, AI-powered | Expensive, health system only | Free, transparent, no AI hype |

**TrialScout's Differentiation**

1. **Transparency** (Primary)
   - **What competitors do:** Black-box algorithms ("We found 5 trials for you!")
   - **What TrialScout does:** Explicit "why matched" (e.g., "EGFR exon 19 deletion required: ✓ Met") and "what to confirm" (e.g., "Verify ECOG 0-1 with your doctor")
   - **Why it matters:** Builds trust, empowers patients, enables productive doctor conversations

2. **Clinician-Ready Output** (Secondary)
   - **What competitors do:** Long PDFs, data dumps, or nothing exportable
   - **What TrialScout does:** One-page brief oncologists can review in 2 minutes during appointments
   - **Why it matters:** Bridges patient research → clinical action; doctors actually use it

3. **Speed** (Tertiary)
   - **What competitors do:** 30+ minute intake forms (Antidote, TrialJectory)
   - **What TrialScout does:** 3-minute intake, <5 minutes to first trial detail view
   - **Why it matters:** Reduces patient fatigue, increases completion rate

4. **Biomarker-Aware** (Tertiary)
   - **What competitors do:** Basic filters (cancer type, stage)
   - **What TrialScout does:** Understands HER2-low vs HER2-negative, EGFR subtypes, PD-L1 ranges
   - **Why it matters:** Modern oncology is biomarker-driven; generic matching misses critical nuances

**Positioning Statement**  
*"TrialScout is the only clinical trial matching tool that shows you exactly why each trial matched and prepares a one-page brief your oncologist can actually use—so you can have a confident, informed conversation about your options."*

**Target Market (MVP)**
- Stage IV breast cancer or NSCLC patients in NYC metro
- Actively seeking treatment options beyond standard of care
- Comfortable with web tools (not elderly, not low digital literacy)
- English-speaking (for MVP)

**Go-to-Market Strategy (Phase 2-3)**
- Partner with patient advocacy groups (LUNGevity, Living Beyond Breast Cancer)
- Oncologist referrals (one cancer center pilot)
- Organic search (SEO for "NSCLC clinical trials NYC", "breast cancer trials near me")
- Social media (patient communities on Facebook, Reddit r/cancer)

---

### Appendix F: User Research Plan (Post-Maven Course)

**Goals**
1. Validate top 3 patient pain points in trial discovery
2. Understand patient-oncologist communication dynamics
3. Validate "job-to-be-done" hypothesis
4. Test early UX concepts (wireframes or prototype)

**Method: Semi-Structured Interviews**
- **Sample size:** 8-10 patients
- **Inclusion criteria:**
  - Stage IV breast cancer or NSCLC
  - Diagnosed within last 2 years
  - Has had ≥2 oncology appointments
  - English-speaking
  - Willing to share experience (recorded, anonymous)
- **Recruitment:** LUNGevity, LBBC, local cancer center patient navigator referrals
- **Incentive:** $50 Amazon gift card per 45-minute interview
- **Timeline:** 2 weeks (1 week recruiting, 1 week interviews)

**Interview Guide (30 Core Questions)**

**Section 1: Cancer Journey (10 mins)**
1. Tell me about your diagnosis. When were you diagnosed?
2. What treatments have you tried so far?
3. How involved are you in treatment decisions vs your oncologist leading?

**Section 2: Clinical Trial Awareness (10 mins)**
4. Have you ever considered participating in a clinical trial?
5. If yes: What motivated you? How did you find out about trials?
6. If no: What held you back? (Fear, lack of awareness, logistics?)
7. How would you describe your understanding of clinical trials? (1-10 scale)
8. Do you know if your cancer center offers trials? How would you find out?

**Section 3: Information Seeking (10 mins)**
9. When you want to learn about treatment options, where do you go? (Doctor, internet, support groups?)
10. Have you ever looked up clinical trials online? If yes, what sites?
11. [Show ClinicalTrials.gov screenshot] What's your reaction to this?
12. What makes it hard to understand if a trial is right for you?
13. What information do you wish was easier to find?

**Section 4: Doctor-Patient Relationship (10 mins)**
14. How comfortable are you asking your oncologist about trials?
15. Have you ever brought research to your doctor? How did they react?
16. What would make you feel more confident bringing up trials?
17. If you found a trial online, what would you need to feel ready to discuss it?

**Section 5: Product Concept Validation (10 mins)**
18. [Show TrialScout wireframes] What's your initial reaction?
19. Would you use something like this? Why or why not?
20. What's the most important thing this tool should do for you?
21. What would make you trust the results?
22. Would you share results with your doctor? In what format?

**Analysis Framework**
- Transcribe all interviews (Rev.com or similar)
- Code for themes: pain points, motivations, fears, trust factors
- Create empathy maps for top 2 personas
- Identify top 3 unmet needs → prioritize in roadmap
- Validate or invalidate key assumptions (e.g., "patients want 3-5 trials vs 10+")

**Success Criteria**
- ≥80% of interviewees express interest in using TrialScout
- ≥2 actionable UX insights per interview (e.g., "I don't know what ECOG means")
- Clear consensus on top pain point (hypothesis: lack of transparency in matching)

---

### Appendix G: Future Roadmap (V2, V3, Beyond)

**V1.0 (MVP - Month 1-2)**
- 20 manually curated trials (10 breast, 10 NSCLC, NYC metro)
- Rule-based matching, sessionStorage only
- Clinician brief PDF export
- Limited beta (25 patients, 3 oncologist validators)

**V1.5 (Iteration - Month 3)**
- Expand to 50 trials per cancer type (100 total)
- Add more cancer centers in NYC metro (extend to Westchester, Long Island)
- Improve UX based on beta feedback (likely: simplify biomarker entry, add tooltips)
- Add Spanish language support (40% of NYC is Hispanic/Latino)

**V2.0 (Scale - Month 4-6)**
- Automated trial data updates (daily ingestion via ClinicalTrials.gov API)
- Expand to 3 additional cancer types: Colorectal, Melanoma, Pancreatic
- User accounts (optional): Save searches, email alerts for new matching trials
- Geographic expansion: Philadelphia, Boston, Washington DC
- Referral integration: "Request coordinator contact" button → email to trial site

**V3.0 (Clinician Tools - Month 7-12)**
- Clinician dashboard: Oncologists can pre-screen patients and send them TrialScout link
- EMR integration (Epic/Cerner): Import patient data directly (requires HIPAA compliance)
- Trial coordinator workflow: Manage referrals, track enrollment pipeline
- Analytics for cancer centers: "How many patients referred from TrialScout?"

**V4.0 (AI-Powered - Month 12+)**
- LLM-powered eligibility criteria parsing (reduce manual curation burden)
- Conversational interface: "I'm EGFR+ and osimertinib stopped working. What trials are available?"
- Personalized trial recommendations: Learn from patient preferences over time
- Predictive analytics: "Based on patients similar to you, 70% discussed this trial with their oncologist"

**Strategic Expansion Opportunities**
- **International:** Expand to EU (GDPR compliance required), UK (NHS partnerships)
- **Rare cancers:** Ovarian, glioblastoma, sarcoma (small patient populations, high need)
- **Pediatric oncology:** Entirely separate product (different regulations, ethics)
- **Enrollment support:** Partner with trial sites to streamline referral → enrollment
- **Pharma partnerships:** Sponsored trials (ethical considerations, disclose conflicts)

---

### Appendix H: Open Questions & Decisions Needed

**Open Questions (To Resolve Before Phase 2 Launch)**

1. **Clinical Advisor Identification**
   - Decision needed: Identify and onboard clinical advisor (oncologist)
   - Timeline: By Week 2 (before Phase 1 alpha testing)
   - Backup plan: Engage community oncology group if individual oncologist unavailable

2. **Patient Advocacy Partnership**
   - Decision needed: Which organization to partner with for beta recruitment?
   - Options: LUNGevity (NSCLC focus), Living Beyond Breast Cancer (breast focus), both?
   - Timeline: By Week 3 (to recruit 25 patients for Phase 2)

3. **Cancer Center Pilot Partner**
   - Decision needed: Which NYC cancer center to approach for Phase 3 pilot?
   - Top candidates: Memorial Sloan Kettering, NYU Langone, Columbia, Weill Cornell
   - Timeline: By Week 6 (need 2-4 weeks to negotiate partnership)

4. **Survey Tool**
   - Decision needed: What tool to use for exit survey?
   - Options: Google Forms (free), Typeform (better UX), built-in (custom)
   - Constraint: Must be compliant (anonymous, no PII collection)

5. **Legal Review**
   - Decision needed: Do we need legal review of disclaimers/Terms of Service?
   - Risk: Low (informational tool, no PHI, no medical advice)
   - Recommendation: Consult healthcare attorney before public launch (Phase 4)

6. **Spanish Translation**
   - Decision needed: Should V1.0 include Spanish language support?
   - Tradeoff: 40% of NYC is Hispanic/Latino, but adds 4 weeks of development time
   - Recommendation: English-only for MVP, add Spanish in V1.5

**Decisions Made (For Clarity)**

✅ **Matching approach:** Rule-based (not LLM-powered)  
✅ **Backend architecture:** Python FastAPI + PostgreSQL  
✅ **Trial data source (MVP):** Manual curation (20 trials)  
✅ **Privacy stance:** Conservative (no PHI storage, sessionStorage only)  
✅ **Competitive positioning:** Transparency + Clinician-ready brief  
✅ **MVP timeline:** 8 weeks to Phase 2 limited beta  
✅ **Initial cancer types:** Breast and NSCLC only  
✅ **Geography:** NYC metro only for MVP  

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 7, 2025 | Product Team | Initial draft for review |

---

## Approval

**Pending Review:**
- [ ] Product Lead
- [ ] Engineering Lead
- [ ] Clinical Advisor
- [ ] Legal (if required)

**Target Approval Date:** Feb 14, 2025  
**Target Launch Date:** April 1, 2025 (Phase 2 Limited Beta)

---

*End of PRD*