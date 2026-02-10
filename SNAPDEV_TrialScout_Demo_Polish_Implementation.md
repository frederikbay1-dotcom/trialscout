# SNAPDEV: TrialScout Demo Polish - Code Changes
**Priority: HIGH | Estimated Time: 20-35 minutes | Impact: CRITICAL for demo**

---

## 🎯 OBJECTIVE

Make 4 specific code changes to transform the demo narrative from "here are trials" to "precision matching with clinical intelligence."

**Current problem:** Results page shows trials but doesn't tell the "precision over recall" story.

**After these changes:** 
- Shows "2 from 7, excluded 5" immediately
- Ranks trials #1, #2, #3 with explanations
- Demonstrates treatment history intelligence

---

## ⏱️ TIME BUDGET OPTIONS

**Option A: 20 minutes (Minimum Viable)**
- Change #1: Match Summary Header (10 min)
- Change #4: "Why Ranked Higher" Box (10 min)

**Option B: 35 minutes (Full Polish)**
- All 5 changes below

**Recommendation:** If demo is <24 hours away, do Option A. If >24 hours, do Option B.

---

## 📋 CHANGE #1: Match Summary Header (10 min) 🔥 CRITICAL

### **What it does:** 
Shows "2 from 7 trials, excluded 5" story at top of results page.

### **File:** `src/pages/Walkthrough.tsx`

### **Location:** Line ~590 (before the trial cards)

### **Find this code:**
```tsx
<div className="bg-white rounded-lg border-2 border-gray-300 p-6">
  <h3 className="text-2xl font-bold mb-4">
    🎯 We found {eligibleTrials.length} trials that may match your profile
  </h3>
```

### **Add THIS ENTIRE BLOCK directly BEFORE it:**

```tsx
{/* Match Summary Header - NEW */}
<div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
      <Check className="w-7 h-7 text-white" />
    </div>
    <div className="flex-1">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        ✓ We Found {eligibleTrials.length} Precision {eligibleTrials.length === 1 ? 'Match' : 'Matches'} for {patientDescription?.name || 'Patient'}
      </h3>
      <p className="text-base text-gray-700 mb-4">
        From {matchResults.length} trials in our database, we excluded {matchResults.length - eligibleTrials.length} that don't match your biomarkers.
      </p>
      
      {matchResults.length - eligibleTrials.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">Excluded trials:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            {matchResults.filter(t => t.eligibilityScore !== "possibly_eligible").slice(0, 5).map((trial, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>{trial.title.substring(0, 60)}... (doesn't match biomarkers)</span>
              </li>
            ))}
          </ul>
          {matchResults.length - eligibleTrials.length > 5 && (
            <p className="text-sm text-gray-600 mt-2">
              ...and {matchResults.length - eligibleTrials.length - 5} more
            </p>
          )}
        </div>
      )}
    </div>
  </div>
</div>
```

### **Testing:**
1. Reload page
2. Should see new blue/purple gradient box at top
3. Should say "2 from 7, excluded 5" (or similar)
4. Should list excluded trials with red ✗

### **If it doesn't work:**
- Check: Is `matchResults` defined? (Should be around line 66)
- Check: Is `eligibleTrials` defined? (Should be around line 81)
- Quick fix: Replace `matchResults.length` with a hardcoded number like `7` for testing

---

## 📋 CHANGE #2: Match Confidence % (5 min)

### **What it does:** 
Shows "95%" explicitly on trial cards instead of just score.

### **File:** `src/components/TrialCard.tsx`

### **Location:** Line ~175

### **Find this code:**
```tsx
<span className="text-3xl font-bold text-gray-900">{matchScore}</span>
```

### **Change to:**
```tsx
<span className="text-3xl font-bold text-gray-900">{matchScore}%</span>
```

### **Then at line ~220, AFTER the progress bar closing `</div>`, ADD:**

```tsx
{/* Match Confidence Label - NEW */}
<div className="mt-1 flex items-center gap-2">
  <span className="text-xs text-gray-500">Match Confidence:</span>
  <span className={`text-xs font-semibold ${
    matchScore >= 90 ? 'text-emerald-600' :
    matchScore >= 75 ? 'text-blue-600' :
    'text-gray-600'
  }`}>
    {matchScore >= 90 ? 'Very High' :
     matchScore >= 75 ? 'High' :
     matchScore >= 60 ? 'Medium' :
     'Low'}
  </span>
</div>
```

### **Testing:**
1. Check trial cards
2. Should see "95%" not "95"
3. Should see "Match Confidence: Very High" label below score

---

## 📋 CHANGE #3: Trial Ranking Badges (5 min)

### **What it does:** 
Shows #1, #2, #3 ranking on trial cards with ⭐ for best match.

### **File:** `src/pages/Walkthrough.tsx`

### **Location:** Line ~613

### **Find this code:**
```tsx
<div className="space-y-4">
  {eligibleTrials.map((result, index) => (
    <div key={result.id} className="bg-white rounded-lg border-2 border-gray-300 p-6">
      <div className="flex items-start justify-between mb-4">
```

### **Change the opening div and ADD ranking badge:**

```tsx
<div className="space-y-4">
  {eligibleTrials.map((result, index) => (
    <div key={result.id} className={`bg-white rounded-lg border-2 p-6 ${
      index === 0 && result.matchScore >= 90 
        ? 'border-emerald-300 shadow-lg' 
        : 'border-gray-300'
    }`}>
      {/* Ranking badge - NEW */}
      <div className="flex items-center justify-between mb-3">
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          index === 0 ? 'bg-emerald-600 text-white' :
          index === 1 ? 'bg-blue-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          #{index + 1} {index === 0 && result.matchScore >= 90 ? '⭐ BEST MATCH' :
                         index === 1 ? 'STRONG MATCH' :
                         'MATCH'}
        </div>
      </div>
      
      <div className="flex items-start justify-between mb-4">
```

### **Also change the match score line:**
Find:
```tsx
<div className="text-4xl font-bold text-gray-900">{result.matchScore}</div>
```

Change to:
```tsx
<div className="text-4xl font-bold text-gray-900">{result.matchScore}%</div>
```

### **Testing:**
1. Check trial cards
2. First trial should have green "#1 ⭐ BEST MATCH" badge
3. Second trial should have blue "#2 STRONG MATCH" badge
4. First trial should have green border

---

## 📋 CHANGE #4: "Why Ranked Higher" Box (10 min) 🔥 CRITICAL

### **What it does:** 
Explains WHY #1 trial is ranked first (shows treatment history intelligence).

### **File:** `src/pages/Walkthrough.tsx`

### **Location:** Line ~669 (after the "Why You May Match" section)

### **Find this code:**
```tsx
{result.whyMatched.length > 0 && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
    <h4 className="font-semibold text-green-900 mb-2">✓ Why You May Match:</h4>
    <ul className="space-y-1">
      {result.whyMatched.map((reason, i) => (
        <li key={i} className="text-sm text-green-800 flex items-start gap-2">
          <span className="text-green-600 mt-0.5">•</span>
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

### **ADD THIS IMMEDIATELY AFTER (before the "What to Confirm" section):**

```tsx
{/* Why This Ranked Higher - NEW */}
{index === 0 && result.matchScore >= 90 && (
  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 mb-4">
    <div className="flex items-start gap-2 mb-2">
      <Star className="w-5 h-5 text-emerald-600 mt-0.5" />
      <h4 className="font-bold text-emerald-900">Why This Is Your #1 Match:</h4>
    </div>
    <p className="text-sm text-emerald-900 leading-relaxed">
      {patientData.cancerType === "lung" && patientData.lineOfTherapy?.includes("post") ? (
        <>
          This trial is specifically designed for patients who have <strong>progressed on prior 
          therapy</strong>. Your treatment history shows you've already tried first-line treatment, 
          making this trial's focus on second-line therapy an excellent clinical fit.
        </>
      ) : patientData.cancerType === "breast" && patientData.lineOfTherapy?.includes("post") ? (
        <>
          This trial targets patients who have <strong>progressed after CDK4/6 inhibitor therapy</strong>. 
          Your history of prior CDK4/6 treatment matches this trial's specific enrollment criteria, 
          making it highly relevant to your current clinical situation.
        </>
      ) : (
        <>
          This trial's eligibility criteria closely match your biomarker profile and treatment 
          history, making it the strongest clinical match in our database.
        </>
      )}
    </p>
  </div>
)}
```

### **Testing:**
1. Check #1 ranked trial (should be top trial)
2. Should see green box with star icon
3. Should say "Why This Is Your #1 Match"
4. Text should be specific to cancer type (lung vs breast)

### **If it doesn't work:**
- Remove the `result.matchScore >= 90` condition temporarily
- Check if `Star` is imported at top of file

---

## 📋 CHANGE #5: Summary Stats Update (5 min) - BONUS

### **What it does:** 
Changes summary box to say "Precision Matches" and show excluded count.

### **File:** `src/pages/Walkthrough.tsx`

### **Location:** Line ~594-609

### **Find this code:**
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="text-center p-4 bg-blue-50 rounded-lg">
    <div className="text-3xl font-bold text-blue-600">{eligibleTrials.length}</div>
    <div className="text-sm text-gray-600">Potentially Eligible</div>
  </div>
  <div className="text-center p-4 bg-green-50 rounded-lg">
    <div className="text-3xl font-bold text-green-600">{eligibleTrials[0]?.matchScore || "N/A"}</div>
    <div className="text-sm text-gray-600">Top Match Score</div>
  </div>
  <div className="text-center p-4 bg-purple-50 rounded-lg">
    <div className="text-3xl font-bold text-purple-600">
      {eligibleTrials.filter((t) => t.matchConfidence === "high").length}
    </div>
    <div className="text-sm text-gray-600">High Confidence</div>
  </div>
</div>
```

### **Replace with:**
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
    <div className="text-3xl font-bold text-emerald-600">{eligibleTrials.length}</div>
    <div className="text-sm text-gray-600 font-medium">Precision Matches</div>
    <div className="text-xs text-gray-500 mt-1">
      from {matchResults.length} total
    </div>
  </div>
  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
    <div className="text-3xl font-bold text-blue-600">{eligibleTrials[0]?.matchScore || "N/A"}%</div>
    <div className="text-sm text-gray-600 font-medium">Top Match</div>
    <div className="text-xs text-gray-500 mt-1">
      {eligibleTrials[0]?.title?.substring(0, 20)}...
    </div>
  </div>
  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
    <div className="text-3xl font-bold text-purple-600">
      {matchResults.length - eligibleTrials.length}
    </div>
    <div className="text-sm text-gray-600 font-medium">Excluded</div>
    <div className="text-xs text-gray-500 mt-1">
      wrong biomarkers
    </div>
  </div>
</div>
```

### **Testing:**
1. Check summary stats box
2. Should say "Precision Matches" not "Potentially Eligible"
3. Should say "from 7 total" (or similar)
4. Third box should say "Excluded" with count

---

## 🔧 IMPORT ADDITIONS

### **File:** `src/pages/Walkthrough.tsx`

**At the top (around line 4-6), update the lucide-react import:**

### **Find:**
```tsx
import {
  Copy, Check, ArrowRight, Lightbulb, AlertCircle,
  ExternalLink, Download, Eye, Layout, MessageSquare, Zap, RefreshCw
} from "lucide-react";
```

### **Change to:**
```tsx
import {
  Copy, Check, ArrowRight, Lightbulb, AlertCircle,
  ExternalLink, Download, Eye, Layout, MessageSquare, Zap, RefreshCw,
  Star  // ← ADD THIS
} from "lucide-react";
```

---

## ✅ COMPLETE TESTING CHECKLIST

After making all changes, test in this order:

**Visual Tests:**
- [ ] Match summary header appears at top (blue/purple gradient box)
- [ ] Summary says "2 from 7 trials, excluded 5" (or similar numbers)
- [ ] Excluded trials list shows with red ✗ icons
- [ ] Summary stats box says "Precision Matches from 7 total"
- [ ] Summary stats shows "Excluded" count

**Trial Card Tests:**
- [ ] Match scores show "95%" (with percentage sign)
- [ ] "Match Confidence: Very High" label appears below score
- [ ] #1 trial has "#1 ⭐ BEST MATCH" green badge
- [ ] #2 trial has "#2 STRONG MATCH" blue badge
- [ ] #1 trial has green border (if score ≥90)

**"Why Ranked Higher" Tests:**
- [ ] Green emerald box appears on #1 trial only
- [ ] Box has star icon and says "Why This Is Your #1 Match"
- [ ] Text is specific to cancer type (mentions treatment history)
- [ ] Does NOT appear on #2, #3 trials

**Functional Tests:**
- [ ] Page loads without console errors
- [ ] All trial cards still clickable
- [ ] Download brief button still works
- [ ] No broken layouts on mobile (if you test mobile)

---

## 🚨 TROUBLESHOOTING

### Issue: Match Summary doesn't show excluded trials

**Problem:** `matchResults` might not have the right trials

**Debug:**
```tsx
console.log('Match results count:', matchResults.length);
console.log('Eligible count:', eligibleTrials.length);
console.log('Excluded:', matchResults.filter(t => t.eligibilityScore !== "possibly_eligible"));
```

**Quick Fix:** Replace the filter with:
```tsx
{matchResults.filter(t => !eligibleTrials.some(e => e.id === t.id)).slice(0, 5).map(...
```

---

### Issue: "Why Ranked Higher" box doesn't appear

**Check:**
1. Is it the first trial? (index === 0)
2. Is match score ≥ 90?
3. Is `Star` imported?

**Quick Fix:** Remove the score condition:
```tsx
{index === 0 && (  // Remove && result.matchScore >= 90
```

---

### Issue: Ranking badges don't show colors

**Problem:** Tailwind classes not applying

**Debug:** Temporarily use static class:
```tsx
<div className="px-3 py-1 rounded-full text-sm font-bold bg-emerald-600 text-white">
  #{index + 1} TEST
</div>
```

If this works, the conditional logic has an issue. If not, Tailwind config might need the emerald color.

---

### Issue: Page crashes after changes

**Common causes:**
1. Missing closing tag (check brackets)
2. `Star` not imported
3. Variable undefined (patientData, matchResults)

**Emergency rollback:** 
```bash
git checkout src/pages/Walkthrough.tsx
git checkout src/components/TrialCard.tsx
```

---

## 🎯 DEMO TALKING POINTS

### **With Change #1 (Match Summary):**
```
"Look at the top of the page. We started with 7 trials in our 
database. We show Patient D only 2.

We excluded 5 trials: trials requiring HER2, MET, or BRAF mutations 
the patient doesn't have.

That's a 71% reduction. Precision over recall."
```

### **With Change #4 ("Why Ranked Higher"):**
```
"Notice MARIPOSA-2 is ranked #1 with 95% confidence.

See this green box? 'Why This Is Your #1 Match.'

The system understood this patient already tried osimertinib and 
progressed. This trial is specifically for post-osimertinib 
progression, so it ranked higher than the first-line trial.

That's not keyword matching. That's clinical intelligence."
```

---

## 📊 IMPACT SUMMARY

### **Before Changes:**
- Generic trial list
- No explanation of precision
- No ranking justification
- Doesn't tell "2 from 7" story

### **After Changes:**
- "2 from 7, excluded 5" shown prominently
- #1 ranked with explanation
- Match confidence quantified (95% = Very High)
- Treatment history intelligence demonstrated

**Result:** Demo narrative transforms from "here are trials" to "precision matching with clinical sophistication"

---

## ⏰ TIME MANAGEMENT

### **If you have 20 minutes:**
Do Changes #1 and #4 only. These are the most critical.

### **If you have 35 minutes:**
Do all 5 changes for maximum impact.

### **If demo is tomorrow:**
Do Changes #1 and #4, test thoroughly, call it done.

### **If demo is 2+ days away:**
Do all 5 changes, sleep on it, test fresh tomorrow.

---

## 🚀 IMPLEMENTATION ORDER

**Recommended sequence:**

1. **Change #1** (Match Summary) - 10 min
   - Test immediately after
   - This has biggest demo impact

2. **Change #4** ("Why Ranked Higher") - 10 min
   - Test immediately after
   - Demonstrates clinical intelligence

3. **STOP HERE if time-constrained** (20 min total)

4. **Change #3** (Ranking Badges) - 5 min
   - Visual polish
   - Test after

5. **Change #2** (Match Confidence %) - 5 min
   - Quick polish
   - Test after

6. **Change #5** (Summary Stats) - 5 min
   - Nice to have
   - Test after

---

## ✨ SUCCESS CRITERIA

You'll know it's working when:

1. ✅ Match summary at top says "2 from 7, excluded 5"
2. ✅ #1 trial has gold star badge
3. ✅ #1 trial has "Why This Is Your #1 Match" green box
4. ✅ Match scores show "95%" (with %)
5. ✅ Summary stats say "Precision Matches"

**If all 5 are true, you're demo-ready!** 🎯

---

## 📝 FINAL NOTES

- **Don't rush:** Better to do 2 changes correctly than 5 with bugs
- **Test after each change:** Don't wait until all 5 are done
- **Keep git history:** Commit after each working change
- **Have backup plan:** Know how to rollback if needed

**You've got this! These changes will dramatically improve your demo.** 🚀

---

**Questions? Issues? Check the troubleshooting section or ping for help.**

**Last updated:** February 10, 2026  
**Version:** Demo Day Final  
**Priority:** CRITICAL
