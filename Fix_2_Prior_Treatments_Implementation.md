# Fix #2: Prior Treatments Extraction - Implementation Guide

## What You're Adding

When users upload oncology notes, the AI extracts prior treatments (like "surgery", "paclitaxel", "trastuzumab") but currently these don't populate the form checkboxes.

After this fix:
- ✅ Upload oncology note
- ✅ AI extracts treatment list
- ✅ Form checkboxes auto-populate
- ✅ User sees what was detected

---

## Step-by-Step Implementation

### STEP 1: Locate the File (1 minute)

**File to edit:** `src/components/steps/ScreenerStep.tsx`

**Find the function:** `handleOncologyUpload` (should be around line 178)

**Current code looks like this:**
```typescript
const handleOncologyUpload = async (extractedData: any) => {
  console.log('Oncology note extracted data:', extractedData);
  
  // Maybe some minimal updates here
  // But NOT mapping prior treatments to form fields
};
```

---

### STEP 2: Replace the Entire Function (5 minutes)

**Delete the current `handleOncologyUpload` function completely.**

**Paste this complete replacement:**

```typescript
const handleOncologyUpload = async (extractedData: any) => {
  console.log('Oncology note extracted data:', extractedData);
  
  // Update cancer type if detected
  if (extractedData.cancer_type) {
    setPatientData(prev => ({
      ...prev,
      cancerType: extractedData.cancer_type
    }));
  }
  
  // Update stage if detected
  if (extractedData.stage) {
    setPatientData(prev => ({
      ...prev,
      stage: extractedData.stage
    }));
  }
  
  // Update ECOG if detected
  if (extractedData.ecog) {
    setPatientData(prev => ({
      ...prev,
      ecog: extractedData.ecog
    }));
  }
  
  // Map prior treatments from array to specific fields
  if (extractedData.prior_treatments && Array.isArray(extractedData.prior_treatments)) {
    const treatments = extractedData.prior_treatments;
    
    console.log('Processing prior treatments:', treatments);
    
    // Map common treatment categories
    const updatedTreatments = {
      surgery: treatments.some(t => {
        const lower = t.toLowerCase();
        return lower.includes('surgery') || 
               lower.includes('resection') ||
               lower.includes('lumpectomy') ||
               lower.includes('mastectomy') ||
               lower.includes('lobectomy');
      }),
      
      chemotherapy: treatments.some(t => {
        const lower = t.toLowerCase();
        return lower.includes('chemotherapy') ||
               lower.includes('chemo') ||
               lower.includes('paclitaxel') ||
               lower.includes('taxol') ||
               lower.includes('carboplatin') ||
               lower.includes('cisplatin') ||
               lower.includes('docetaxel') ||
               lower.includes('gemcitabine') ||
               lower.includes('pemetrexed') ||
               lower.includes('etoposide');
      }),
      
      radiation: treatments.some(t => {
        const lower = t.toLowerCase();
        return lower.includes('radiation') ||
               lower.includes('radiotherapy') ||
               lower.includes('xrt') ||
               lower.includes('sbrt') ||
               lower.includes('imrt');
      }),
      
      immunotherapy: treatments.some(t => {
        const lower = t.toLowerCase();
        return lower.includes('immunotherapy') ||
               lower.includes('pembrolizumab') ||
               lower.includes('keytruda') ||
               lower.includes('nivolumab') ||
               lower.includes('opdivo') ||
               lower.includes('atezolizumab') ||
               lower.includes('durvalumab');
      }),
      
      targeted_therapy: treatments.some(t => {
        const lower = t.toLowerCase();
        return lower.includes('targeted') ||
               lower.includes('trastuzumab') ||
               lower.includes('herceptin') ||
               lower.includes('pertuzumab') ||
               lower.includes('perjeta') ||
               lower.includes('osimertinib') ||
               lower.includes('tagrisso') ||
               lower.includes('erlotinib') ||
               lower.includes('tarceva') ||
               lower.includes('gefitinib') ||
               lower.includes('iressa') ||
               lower.includes('alectinib') ||
               lower.includes('crizotinib');
      }),
      
      hormone_therapy: treatments.some(t => {
        const lower = t.toLowerCase();
        return lower.includes('hormone') ||
               lower.includes('endocrine') ||
               lower.includes('tamoxifen') ||
               lower.includes('letrozole') ||
               lower.includes('femara') ||
               lower.includes('anastrozole') ||
               lower.includes('arimidex') ||
               lower.includes('exemestane') ||
               lower.includes('palbociclib') ||
               lower.includes('ibrance') ||
               lower.includes('ribociclib') ||
               lower.includes('kisqali') ||
               lower.includes('fulvestrant') ||
               lower.includes('faslodex');
      }),
    };
    
    console.log('Mapped treatment categories:', updatedTreatments);
    
    // Update patient data with treatment categories
    setPatientData(prev => ({
      ...prev,
      priorTreatmentTypes: treatments, // Keep raw array
      
      // Set boolean flags for common categories
      // Make sure these field names match your form structure
      hasSurgery: updatedTreatments.surgery,
      hasChemotherapy: updatedTreatments.chemotherapy,
      hasRadiation: updatedTreatments.radiation,
      hasImmunotherapy: updatedTreatments.immunotherapy,
      hasTargetedTherapy: updatedTreatments.targeted_therapy,
      hasHormoneTherapy: updatedTreatments.hormone_therapy,
    }));
    
    // Show success message with count
    const treatmentCount = Object.values(updatedTreatments).filter(Boolean).length;
    if (treatmentCount > 0) {
      toast.success(
        `✓ Detected ${treatmentCount} treatment ${treatmentCount === 1 ? 'category' : 'categories'} from oncology note`,
        { duration: 3000 }
      );
    }
  }
  
  // Show overall success message
  toast.success('Oncology note analyzed successfully!', { duration: 3000 });
};
```

---

### STEP 3: Check Your Form Field Names (IMPORTANT - 5 minutes)

**The code above assumes your form fields are named:**
- `hasSurgery`
- `hasChemotherapy`
- `hasRadiation`
- `hasImmunotherapy`
- `hasTargetedTherapy`
- `hasHormoneTherapy`

**YOU NEED TO VERIFY THIS!**

**How to check:**

1. Open your intake form component (wherever treatment checkboxes are)
2. Look for the checkbox inputs
3. Find their `name` or `value` bindings

**Example - what you might see:**
```typescript
<Checkbox 
  checked={patientData.hasSurgery}
  onChange={(e) => setPatientData({...patientData, hasSurgery: e.target.checked})}
/>
```

**If your field names are different, update the code in Step 2:**

**For example, if your fields are:**
- `surgery` (not `hasSurgery`)
- `chemotherapy` (not `hasChemotherapy`)

**Then change this section:**
```typescript
// Instead of:
hasSurgery: updatedTreatments.surgery,
hasChemotherapy: updatedTreatments.chemotherapy,

// Use:
surgery: updatedTreatments.surgery,
chemotherapy: updatedTreatments.chemotherapy,
```

---

### STEP 4: Add Toast Import (If Missing - 1 minute)

**At the top of `ScreenerStep.tsx`, check if you have:**

```typescript
import { toast } from 'react-hot-toast';
// OR
import { toast } from 'sonner';
// OR whatever toast library you use
```

**If missing, add it.**

**If you don't have a toast library at all, replace the toast lines with console.log:**

```typescript
// Replace this:
toast.success('Detected 3 treatment categories', { duration: 3000 });

// With this:
console.log('Detected 3 treatment categories');
```

---

### STEP 5: Test the Fix (10 minutes)

**Test 1: Upload Oncology Note**
```
1. Navigate to intake form
2. Upload patient_a_oncology_note.txt
3. Wait for extraction (6-8 seconds)
4. Check browser console - should see:
   - "Oncology note extracted data: {...}"
   - "Processing prior treatments: [...]"
   - "Mapped treatment categories: {...}"
5. Look at form - treatment checkboxes should be checked
6. Should see toast: "✓ Detected 3 treatment categories from oncology note"
```

**Test 2: Verify Specific Treatments**

**For Patient A oncology note, should detect:**
- ✓ Surgery (lumpectomy mentioned)
- ✓ Chemotherapy (paclitaxel mentioned)
- ✓ Hormone therapy (letrozole, palbociclib mentioned)

**For Patient D oncology note, should detect:**
- ✓ Surgery (lobectomy mentioned)
- ✓ Targeted therapy (osimertinib mentioned)
- ✓ Chemotherapy (carboplatin, pemetrexed mentioned)

**Test 3: End-to-End**
```
1. Upload patient_a_breast_pathology.txt
   → Biomarkers extracted
2. Upload patient_a_oncology_note.txt
   → Treatments extracted and form updated
3. Review complete profile
4. Click "Find Trials"
5. Should see matched trials considering both biomarkers AND treatment history
```

---

### STEP 6: Debug If Needed (5 minutes)

**If checkboxes don't populate:**

**Check 1: Console logs**
```typescript
// Should see in browser console:
"Processing prior treatments: ["surgery", "paclitaxel", "letrozole"]"
"Mapped treatment categories: {surgery: true, chemotherapy: true, ...}"
```

**Check 2: Field names**
```typescript
// Make sure the field names match
// In handleOncologyUpload:
hasSurgery: updatedTreatments.surgery,

// In your form:
<Checkbox checked={patientData.hasSurgery} />

// They MUST match exactly (case-sensitive!)
```

**Check 3: State update**
```typescript
// Add debug log after setPatientData
setPatientData(prev => {
  const updated = {
    ...prev,
    hasSurgery: updatedTreatments.surgery,
    // ...
  };
  console.log('Updated patient data:', updated);
  return updated;
});
```

---

## Common Issues & Solutions

### Issue 1: Checkboxes Don't Check

**Cause:** Field name mismatch

**Fix:**
```typescript
// Check your form component
// If it uses: patientData.surgery
// Then update to: surgery: updatedTreatments.surgery
// (Remove "has" prefix)
```

### Issue 2: Toast Doesn't Show

**Cause:** Toast library not imported

**Fix:**
```typescript
// Add import at top of file
import { toast } from 'react-hot-toast';

// OR remove toast calls entirely and use console.log
console.log(`Detected ${treatmentCount} treatment categories`);
```

### Issue 3: Treatments Not Detected

**Cause:** Drug names don't match patterns

**Fix:** Add more drug name variations
```typescript
chemotherapy: treatments.some(t => {
  const lower = t.toLowerCase();
  return lower.includes('chemotherapy') ||
         lower.includes('YOUR_DRUG_NAME_HERE') ||
         // Add more variations
});
```

---

## Success Criteria

**After implementing, you should be able to:**

✅ Upload patient_a_oncology_note.txt
✅ See console logs showing extraction
✅ See treatment checkboxes auto-populate
✅ See toast message: "Detected 3 treatment categories"
✅ Upload patient_d_oncology_note.txt
✅ See different treatment pattern (targeted therapy detected)
✅ Click "Find Trials" with complete profile
✅ Trial matching works with both biomarkers and treatments

---

## Time Breakdown

- Step 1: Find file (1 min)
- Step 2: Replace function (5 min)
- Step 3: Verify field names (5 min)
- Step 4: Check imports (1 min)
- Step 5: Test (10 min)
- Step 6: Debug if needed (5 min)

**Total: 27 minutes**

---

## What to Tell Snapdev (If Using)

```
Please implement Fix #2 for prior treatments extraction:

FILE: src/components/steps/ScreenerStep.tsx
FUNCTION: handleOncologyUpload (around line 178)

TASK: Replace the function with the enhanced version that:
1. Maps extracted treatment array to form checkbox fields
2. Detects treatment categories (surgery, chemo, radiation, etc.)
3. Shows toast notification with count
4. Updates patient data state

IMPORTANT: 
- Verify form field names match (hasSurgery vs surgery)
- Check toast library is imported
- Test with patient_a_oncology_note.txt

CODE: See Fix_#2_Prior_Treatments_Implementation.md

TIME: 30 minutes
```

---

**Ready to implement? Let's do this! 🚀**

**Start with Step 1: Find the `handleOncologyUpload` function in ScreenerStep.tsx**

**Once you find it, tell me what it currently looks like and I'll confirm next steps!**
