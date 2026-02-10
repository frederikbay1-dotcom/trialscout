# SNAPDEV: Complete Clinician Brief Redesign - Clinical Note Style
**Priority: CRITICAL | Implementation: ALL AT ONCE | Time: 90 minutes**

---

## 🎯 OBJECTIVE

Replace the current multi-page PDF format with a **clean, clinical note-style** brief that looks like what oncologists actually write in EMRs.

**Reference:** User provided mock example showing the desired format (dark theme, concise bullets, evidence-linked, 1-2 pages max).

---

## 📋 NEW FORMAT SPECIFICATIONS

### **Overall Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│ TRIALSCOUT CLINICIAN BRIEF                                  │
│ Clinical Trial Matching Report                             │
│                                                             │
│ Generated for: Patient ID | Date: Feb 10, 2026             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. CLINICAL SNAPSHOT                                       │
│    • Primary Diagnosis: [...]                              │
│    • Key Biomarkers: [...]                                 │
│    • Treatment History: [...]                              │
│    • Performance Status: [...]                             │
│                                                             │
│ 2. TOP PRECISION MATCHES (High Confidence)                 │
│                                                             │
│    TrialScout filtered 20 local trials down to 2 matches   │
│    based on specific biomarker and treatment requirements. │
│                                                             │
│    MATCH #1: [TRIAL NAME] (NCT#)                          │
│    • Phase: [...]                                          │
│    • Distance: [...]                                       │
│    • MATCH RATIONALE: [why patient matches]                │
│    • EVIDENCE LINK: [specific document reference]          │
│                                                             │
│    MATCH #2: [TRIAL NAME] (NCT#)                          │
│    • [Same format]                                         │
│                                                             │
│ 3. CONTACT & NEXT STEPS                                    │
│    Primary Recommendation: [Trial #1]                      │
│    Site: [...] | Phone: [...] | Email: [...]             │
│    Pre-screening checklist: [3-4 items]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles:**
- **1-2 pages maximum** (not 5 pages)
- **Concise bullets** (not paragraphs)
- **Evidence-linked** (show source documents)
- **Clinical note tone** (professional, direct)
- **Dark theme with white text** (like mock example) OR clean white background
- **Sans-serif font** (easier to scan)

---

## 🔨 COMPLETE IMPLEMENTATION INSTRUCTIONS

### **PART 1: FILE STRUCTURE**

**File to modify:** The component/function that generates the clinician brief PDF

**Likely locations:**
- `src/components/ClinicianBriefModal.tsx` (if React component)
- `src/components/clinician-brief/[component].tsx`
- A PDF generation service/utility file

**What to do:**
1. **Find** where the PDF is generated (search for "TRIALSCOUT CLINICAL CONSULT" or "Executive Summary")
2. **Replace** the entire PDF structure with the new clinical note format below

---

### **PART 2: NEW TEMPLATE (Complete HTML/JSX)**

**Copy this entire template and replace your current PDF generation code:**

```tsx
// ClinicianBrief Component - NEW CLINICAL NOTE STYLE

interface ClinicianBriefProps {
  patient: PatientData;
  matches: MatchedTrial[];
  generatedDate: string;
}

export const ClinicianBriefClinicalNote = ({ patient, matches, generatedDate }: ClinicianBriefProps) => {
  // Get top 2 matches
  const topMatches = matches.slice(0, 2);
  const totalTrials = 20; // Or dynamic based on your database
  
  return (
    <div className="bg-white text-gray-900 font-sans max-w-[8.5in] mx-auto p-12">
      
      {/* HEADER */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">TrialScout Clinician Brief: Clinical Trial Matching Report</h1>
        <p className="text-sm text-gray-700">
          Generated for: Patient ID: {patient.id} | Date: {generatedDate}
        </p>
      </div>

      {/* SECTION 1: CLINICAL SNAPSHOT */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">
          1. CLINICAL SNAPSHOT
        </h2>
        <ul className="space-y-2 ml-4">
          <li className="text-sm">
            <strong>Primary Diagnosis:</strong> {patient.cancerType}, {patient.cancerStage}
            {patient.histology && `, ${patient.histology}`}.
          </li>
          
          <li className="text-sm">
            <strong>Key Biomarkers:</strong> {formatBiomarkers(patient.biomarkerProfile)}
            {patient.detectionMethod && ` (Detected via ${patient.detectionMethod}, ${patient.detectionDate})`}.
          </li>
          
          <li className="text-sm">
            <strong>Treatment History:</strong> {formatTreatmentHistory(patient)}
          </li>
          
          <li className="text-sm">
            <strong>Performance Status:</strong> {patient.ecogStatus} ({getEcogDescription(patient.ecogStatus)}).
          </li>
        </ul>
      </div>

      {/* SECTION 2: TOP MATCHES */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">
          2. TOP PRECISION MATCHES (High Confidence)
        </h2>
        
        <p className="text-sm italic mb-4 text-gray-700">
          TrialScout has filtered {totalTrials} local {patient.cancerType} trials down to the{' '}
          <strong>{topMatches.length} matches below</strong> based on specific biomarker and 
          treatment history requirements.
        </p>

        {topMatches.map((match, index) => (
          <div key={match.id} className="mb-6">
            <h3 className="text-base font-bold mb-2">
              MATCH #{index + 1}: {match.title} ({match.nctNumber})
            </h3>
            
            <ul className="space-y-1.5 ml-4 text-sm">
              <li><strong>Phase:</strong> {match.phase}.</li>
              
              <li>
                <strong>Distance:</strong> {match.distance} miles ({match.location}).
              </li>
              
              <li>
                <strong>MATCH RATIONALE:</strong> {generateMatchRationale(match, patient)}
              </li>
              
              <li>
                <strong>EVIDENCE LINK:</strong> {generateEvidenceLink(match, patient)}
              </li>
            </ul>
          </div>
        ))}
      </div>

      {/* SECTION 3: CONTACT & NEXT STEPS */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">
          3. CONTACT & NEXT STEPS
        </h2>
        
        <div className="ml-4 space-y-3 text-sm">
          <div>
            <p className="font-bold mb-1">Primary Recommendation: {topMatches[0].title}</p>
            <p>Site: {topMatches[0].location}</p>
            <p>Contact: {topMatches[0].phone} | {topMatches[0].email}</p>
          </div>
          
          <div>
            <p className="font-bold mb-1">Pre-screening Checklist:</p>
            <ul className="ml-4 space-y-1">
              {topMatches[0].whatToConfirm.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          
          <div className="pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-600 italic">
              This report is generated for informational purposes only and does not constitute 
              medical advice. Clinical trial eligibility should be verified with the study team.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t-2 border-gray-900 pt-4 text-xs text-gray-600">
        <p>Report generated: {generatedDate} | Data freshness: Within 7 days</p>
        <p>Source: ClinicalTrials.gov | TrialScout Matching Engine v2.0</p>
      </div>
    </div>
  );
};

// Helper Functions

function formatBiomarkers(biomarkers: BiomarkerProfile): string {
  const parts = [];
  
  if (biomarkers.mutations) {
    Object.entries(biomarkers.mutations).forEach(([gene, mutation]) => {
      if (mutation && mutation !== 'unknown') {
        parts.push(`${gene} ${mutation}`);
      }
    });
  }
  
  if (biomarkers.expression) {
    Object.entries(biomarkers.expression).forEach(([marker, level]) => {
      if (level && level !== 'unknown') {
        parts.push(`${marker}: ${level}`);
      }
    });
  }
  
  if (biomarkers.hormoneReceptors) {
    Object.entries(biomarkers.hormoneReceptors).forEach(([receptor, status]) => {
      if (status && status !== 'unknown') {
        parts.push(`${receptor} ${status === 'present' ? '+' : '-'}`);
      }
    });
  }
  
  return parts.join(', ') || 'Not fully characterized';
}

function formatTreatmentHistory(patient: PatientData): string {
  const history = patient.treatmentHistory || [];
  
  if (history.length === 0) {
    return 'Treatment-naive.';
  }
  
  // Get current/most recent treatment
  const current = history[history.length - 1];
  const status = patient.lineOfTherapy?.includes('post') 
    ? `Progressed on ${current.name}` 
    : `Currently on ${current.name}`;
  
  const duration = current.duration ? ` (Treatment duration: ${current.duration} months)` : '';
  
  return `${status}${duration}.`;
}

function getEcogDescription(ecog: string): string {
  const descriptions: Record<string, string> = {
    '0': 'Fully active, no restrictions',
    '1': 'Ambulatory, capable of light work',
    '2': 'Ambulatory, unable to work, up >50% of waking hours',
    '3': 'Limited self-care, confined to bed/chair >50% of waking hours',
    '4': 'Completely disabled, no self-care'
  };
  
  return descriptions[ecog] || 'Performance status assessed';
}

function generateMatchRationale(match: MatchedTrial, patient: PatientData): string {
  const reasons = match.whyMatched || [];
  
  // Take first 2-3 key reasons
  const keyReasons = reasons.slice(0, 3);
  
  return keyReasons.join('. ') + '.';
}

function generateEvidenceLink(match: MatchedTrial, patient: PatientData): string {
  // Generate evidence linking based on match reasoning
  const evidence = [];
  
  // Example: Link to specific documents
  if (match.biomarkerMatch) {
    evidence.push(`Biomarker confirmation from Pathology Report dated ${patient.biomarkerDate || 'recent'}`);
  }
  
  if (match.treatmentHistoryMatch) {
    evidence.push(`Treatment progression noted in Clinical Note dated ${patient.lastTreatmentNote || 'recent'}`);
  }
  
  return evidence.join('; ') || 'Patient data matched to trial inclusion criteria.';
}
```

---

### **PART 3: STYLING (If Using CSS)**

**If you need separate CSS/styling:**

```css
/* Clinician Brief - Clinical Note Style */

.clinician-brief {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #1a1a1a;
  max-width: 8.5in;
  margin: 0 auto;
  padding: 1in;
  background: white;
}

.clinician-brief h1 {
  font-size: 18pt;
  font-weight: 700;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 0.5rem;
}

.clinician-brief h2 {
  font-size: 13pt;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #666;
  padding-bottom: 0.25rem;
}

.clinician-brief h3 {
  font-size: 11pt;
  font-weight: 700;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.clinician-brief ul {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
}

.clinician-brief li {
  margin-bottom: 0.5rem;
}

.clinician-brief strong {
  font-weight: 600;
}

.clinician-brief .evidence-link {
  font-style: italic;
  color: #555;
}

.clinician-brief .disclaimer {
  font-size: 9pt;
  color: #666;
  font-style: italic;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #ccc;
}

/* Print styles */
@media print {
  .clinician-brief {
    padding: 0.5in;
  }
  
  .clinician-brief h2 {
    page-break-after: avoid;
  }
}
```

---

### **PART 4: EXACT TEXT CONTENT**

**Use this exact wording for each section:**

#### **Section 1: Clinical Snapshot**

```
1. CLINICAL SNAPSHOT

• Primary Diagnosis: [Cancer Type], [Stage], [Histology if available].

• Key Biomarkers: [List mutations, expressions, receptors] 
  (Detected via [method], [date]).

• Treatment History: [Current status - progressed/stable/responding on [drug]] 
  (Treatment duration: [X] months).

• Performance Status: ECOG [0-4] ([Description]).
```

**Example:**
```
• Primary Diagnosis: Non-Small Cell Lung Cancer (NSCLC), Stage IV, Adenocarcinoma.

• Key Biomarkers: EGFR Exon 19 Deletion (Detected via NGS, 12/15/2025).

• Treatment History: Progressed on first-line Osimertinib (Treatment duration: 11 months).

• Performance Status: ECOG 1 (Patient is ambulatory and able to carry out light work).
```

---

#### **Section 2: Top Precision Matches**

```
2. TOP PRECISION MATCHES (High Confidence)

TrialScout has filtered [X] local [cancer type] trials down to the [N] matches below 
based on specific biomarker and treatment history requirements.

MATCH #1: [TRIAL NAME] (NCT[NUMBER])

• Phase: [Phase].
• Distance: [X] miles ([Hospital Name, City]).
• MATCH RATIONALE: [This protocol specifically requires patients who have [key criteria]. 
  The AI identified [specific matching elements] from the uploaded oncology notes.]
• EVIDENCE LINK: "[Specific inclusion criterion]" matched to [Document Type] dated [Date].

MATCH #2: [TRIAL NAME] (NCT[NUMBER])

[Same format]
```

**Example:**
```
MATCH #1: MARIPOSA-2 (NCT04484129)

• Phase: III.
• Distance: 4.2 miles (Memorial Sloan Kettering, NYC).
• MATCH RATIONALE: This protocol specifically requires patients who have progressed 
  after Osimertinib. The AI identified the progression date and treatment line from 
  the uploaded oncology notes.
• EVIDENCE LINK: "Inclusion 3.2: Disease progression on or after most recent therapy 
  (Osimertinib)" matched to Patient Note dated 01/20/2026.
```

---

#### **Section 3: Contact & Next Steps**

```
3. CONTACT & NEXT STEPS

Primary Recommendation: [Trial #1 Name]
Site: [Hospital Name, City]
Contact: [Phone] | [Email]

Pre-screening Checklist:
• [Item 1 to verify]
• [Item 2 to verify]
• [Item 3 to verify]

---

This report is generated for informational purposes only and does not constitute medical 
advice. Clinical trial eligibility should be verified with the study team.
```

**Example:**
```
Primary Recommendation: MARIPOSA-2 (Amivantamab + Lazertinib)
Site: Memorial Sloan Kettering Cancer Center, New York, NY
Contact: (212) 639-2000 | trials@mskcc.org

Pre-screening Checklist:
• Verify ECOG 0-1 status
• Confirm disease progression on most recent CT scan
• Check adequate organ function (liver, kidney)
```

---

### **PART 5: LAYOUT SPECIFICATIONS**

**Page dimensions:**
- **Paper:** US Letter (8.5" x 11")
- **Margins:** 1 inch all sides
- **Font:** Arial or Helvetica, 11pt body text
- **Headers:** 18pt (H1), 13pt (H2), 11pt bold (H3)
- **Line spacing:** 1.5
- **Colors:** Black text (#1a1a1a), gray for secondary (#666)

**Page breaks:**
- Aim for 1 page if 2 matches
- Max 2 pages if 3+ matches
- Keep each match section together (no break mid-match)

---

### **PART 6: DARK THEME ALTERNATIVE (Optional)**

**If you want the dark theme like the mock image:**

```css
.clinician-brief-dark {
  background: #1a1a1a;
  color: #f5f5f5;
}

.clinician-brief-dark h1,
.clinician-brief-dark h2 {
  color: #ffffff;
  border-color: #f5f5f5;
}

.clinician-brief-dark strong {
  color: #ffffff;
}

.clinician-brief-dark .disclaimer {
  color: #999;
}
```

**Toggle between light/dark:**
```tsx
const [theme, setTheme] = useState<'light' | 'dark'>('light');

<div className={theme === 'dark' ? 'clinician-brief-dark' : 'clinician-brief'}>
  {/* content */}
</div>
```

---

### **PART 7: PDF GENERATION CODE**

**If using a PDF library (e.g., jsPDF, react-pdf, puppeteer):**

```tsx
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generateClinicianBriefPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // Capture as canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });
  
  const imgWidth = 8.5;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};

// Usage in component:
<button onClick={() => generateClinicianBriefPDF('clinician-brief', 'TrialScout_Brief.pdf')}>
  Download PDF
</button>
```

---

### **PART 8: INTEGRATION CHECKLIST**

**Step-by-step implementation:**

1. **[ ] Locate PDF generation code**
   - Search for "TRIALSCOUT CLINICAL CONSULT" or "Executive Summary"
   - Likely in `ClinicianBriefModal.tsx` or similar

2. **[ ] Replace entire template**
   - Copy the new `ClinicianBriefClinicalNote` component from PART 2
   - Replace existing PDF generation logic

3. **[ ] Update helper functions**
   - Copy `formatBiomarkers()`, `formatTreatmentHistory()`, etc.
   - Ensure they work with your data structure

4. **[ ] Add/update styling**
   - Copy CSS from PART 3
   - Or use Tailwind classes as shown in component

5. **[ ] Test with sample patients**
   - Patient A (breast cancer)
   - Patient D (lung cancer)
   - Verify 1-2 page output

6. **[ ] Verify all sections render**
   - Clinical Snapshot: 4 bullets
   - Top Matches: 2 trials
   - Contact & Next Steps: complete

7. **[ ] Check evidence linking**
   - Ensure document references show
   - Format dates correctly

8. **[ ] Test PDF generation**
   - Download button works
   - PDF is readable
   - Formatting preserved

9. **[ ] Optional: Add dark theme toggle**
   - If desired based on user preference

10. **[ ] Remove old code**
    - Delete old multi-page template
    - Remove unused components

---

### **PART 9: DATA STRUCTURE REQUIREMENTS**

**Ensure your data includes these fields:**

```typescript
interface PatientData {
  id: string;
  cancerType: string;
  cancerStage: string;
  histology?: string;
  biomarkerProfile: BiomarkerProfile;
  biomarkerDate?: string;
  detectionMethod?: string;
  treatmentHistory: TreatmentHistory[];
  lineOfTherapy?: string;
  lastTreatmentNote?: string;
  ecogStatus: string;
}

interface MatchedTrial {
  id: string;
  nctNumber: string;
  title: string;
  phase: string;
  location: string;
  distance: number;
  phone: string;
  email: string;
  whyMatched: string[];
  whatToConfirm: string[];
  matchScore: number;
  biomarkerMatch?: boolean;
  treatmentHistoryMatch?: boolean;
}
```

**If any fields are missing, add them or adjust the template accordingly.**

---

### **PART 10: VALIDATION & TESTING**

**Test cases:**

**Test 1: Breast Cancer Patient**
- Should show 2 matches
- Biomarkers: ER+, PR+, HER2 IHC 0
- Treatment: Progressed on CDK4/6i
- Output: 1 page, all sections complete

**Test 2: Lung Cancer Patient**
- Should show 2 matches
- Biomarkers: EGFR Exon 19 deletion
- Treatment: Progressed on Osimertinib
- Output: 1 page, evidence links correct

**Test 3: No Matches**
- Should show "No high-confidence matches found" message
- Still show patient snapshot
- Suggest broadening criteria

**Success criteria:**
- ✅ Loads in <2 seconds
- ✅ 1-2 pages max (not 5)
- ✅ All sections present
- ✅ Evidence links show document dates
- ✅ Contact info correct
- ✅ PDF downloads successfully
- ✅ Formatting preserved in PDF

---

### **PART 11: TROUBLESHOOTING**

**Issue: Content overflows 2 pages**

**Solution:**
```tsx
// Truncate long trial names
const shortTitle = trial.title.length > 80 
  ? trial.title.substring(0, 80) + '...' 
  : trial.title;

// Limit "why matched" to 2-3 key reasons
const keyReasons = trial.whyMatched.slice(0, 3);
```

---

**Issue: Evidence links don't show**

**Solution:**
```tsx
// Ensure you're passing document metadata
interface EvidenceLink {
  documentType: string;  // "Pathology Report", "Clinical Note"
  date: string;          // "12/15/2025"
  criterion: string;     // "EGFR mutation required"
}

// Example usage:
const evidenceLink = `"${criterion}" matched to ${documentType} dated ${date}.`;
```

---

**Issue: PDF generation fails**

**Solution:**
```tsx
// Add error handling
try {
  await generateClinicianBriefPDF('clinician-brief', 'TrialScout_Brief.pdf');
} catch (error) {
  console.error('PDF generation failed:', error);
  // Fallback: offer HTML print
  window.print();
}
```

---

**Issue: Formatting looks wrong in PDF**

**Solution:**
```css
/* Ensure print styles are defined */
@media print {
  body {
    margin: 0;
    padding: 0;
  }
  
  .clinician-brief {
    width: 100%;
    max-width: none;
  }
  
  /* Prevent page breaks in middle of sections */
  h2, h3 {
    page-break-after: avoid;
  }
  
  ul, ol {
    page-break-inside: avoid;
  }
}
```

---

## 📊 BEFORE/AFTER COMPARISON

### **Before (Current 5-Page Format):**
```
Page 1: Executive Summary (repeated content)
Page 2: Trial Card #1 (repeated content)
Page 3: Trial Card #2 (repeated content)
Page 4: Clinician Brief (yet more repetition)
Page 5: Footer/disclaimers

Total: 5 pages
Scan time: 2+ minutes
Format: Marketing-style with lots of graphics
Tone: Patient-facing
```

### **After (New Clinical Note Format):**
```
Page 1:
- Clinical Snapshot (4 bullets)
- Top 2 Matches (concise, evidence-linked)
- Contact & Next Steps

Total: 1-2 pages
Scan time: 30 seconds
Format: Clinical note-style
Tone: Physician-to-physician
```

---

## ✅ FINAL CHECKLIST

**Before marking complete:**

- [ ] Old PDF template completely removed
- [ ] New clinical note template implemented
- [ ] All helper functions working
- [ ] Styling applied (light theme minimum)
- [ ] PDF generation works
- [ ] Tested with 2+ patient profiles
- [ ] Output is 1-2 pages max
- [ ] Evidence links show document dates
- [ ] Contact info displays correctly
- [ ] Disclaimer at bottom
- [ ] No console errors
- [ ] Looks professional (like a real clinical note)

---

## 🎯 SUCCESS CRITERIA

**You'll know it's working when:**

1. ✅ **Oncologist can scan in 30 seconds** and find:
   - What cancer/biomarkers (Section 1)
   - Which trials match (Section 2)
   - Who to call (Section 3)

2. ✅ **Looks like a clinical note:**
   - Concise bullets
   - Professional tone
   - Evidence-linked
   - No marketing fluff

3. ✅ **Fits on 1-2 pages:**
   - No scrolling through 5 pages
   - All essential info visible

4. ✅ **PDF downloads cleanly:**
   - Formatting preserved
   - Readable on any device
   - Printable if needed

---

## 🚀 IMPLEMENTATION TIMELINE

**You said you want all changes at once. Here's the sequence:**

1. **Minutes 0-20:** Replace template (PART 2)
2. **Minutes 20-40:** Add helper functions (PART 2)
3. **Minutes 40-60:** Apply styling (PART 3)
4. **Minutes 60-75:** Test PDF generation (PART 7)
5. **Minutes 75-90:** Test with sample patients, fix any issues

**Total: 90 minutes for complete replacement**

---

## 💬 COMMUNICATION WITH USER

**After implementation, show user:**

1. **Screenshot of new 1-page format** (Section 1, 2, 3 visible)
2. **PDF download** (have them test)
3. **Comparison:** "Here's the old 5-page version vs new 1-page version"

**Ask:**
- "Is this the clinical note style you wanted?"
- "Should we add dark theme option?"
- "Any sections missing?"

---

**This is a complete replacement. No half-measures. Implement all parts together.** 🎯

**Timeline: 90 minutes from start to complete**

**Questions before starting? Flag them now.**

**Ready to implement? Let's do this.** 🚀
