# Data Type Compatibility Report: Backend ↔ Frontend

## Executive Summary

This report documents data type compatibility between the TrialScout backend (Python/Pydantic) and frontend (TypeScript/React). Several mismatches have been identified and require attention.

---

## 1. Trial Object Structure

### Backend (schemas.py - TrialDetail)
```python
class TrialDetail(TrialBase):
    nct_number: str
    title: str
    phase: Optional[str]
    sponsor: Optional[str]
    status: str  # "recruiting" | "active_not_recruiting" | "completed"
    location: Optional[str]
    distance_miles: Optional[int]
    cancer_type: str
    last_updated: date  # Python date object
    eligibility_score: Optional[str]
    match_confidence: Optional[str]
```

### Frontend (api.ts - Trial)
```typescript
interface Trial {
    nct_number: string;
    title: string;
    phase: 'Phase I' | 'Phase I/II' | 'Phase II' | 'Phase II/III' | 'Phase III';
    sponsor: string;
    status: 'recruiting' | 'active_not_recruiting' | 'completed';
    location: string;
    distance: number;  // ⚠️ MISMATCH: backend uses "distance_miles"
    cancer_type: 'breast' | 'lung';
    last_updated: string;  // ✅ OK: date serialized to string
    // ... additional fields
}
```

### Frontend (oncology.ts - Trial)
```typescript
interface Trial {
    id: string;
    nctNumber: string;  // ⚠️ MISMATCH: backend uses "nct_number"
    title: string;
    phase: string;
    status?: "recruiting" | "active_not_recruiting" | "completed" | TrialStatus;
    last_updated?: string;  // ✅ FIXED: Now accepts backend field name
    // ... additional fields
}
```

---

## 2. Match Response Structure

### Backend (schemas.py - MatchedTrial)
```python
class MatchedTrial(BaseModel):
    trial: TrialDetail
    score: int  # 0-99
    confidence: str  # "high" | "medium" | "low"
    why_matched: List[MatchReason]
    what_to_confirm: List[ConfirmationItem]
    patient_burden: Dict[str, Any]
```

### Frontend (api.ts - MatchResult)
```typescript
interface MatchResult {
    trial: Trial;
    score: number;  // ✅ OK: int → number
    confidence: 'high' | 'medium' | 'low';  // ✅ OK
    why_matched: string[];  // ⚠️ MISMATCH: backend sends MatchReason objects
    what_to_confirm: string[];  // ⚠️ MISMATCH: backend sends ConfirmationItem objects
    excluded_by?: string;
}
```

---

## 3. Detailed Compatibility Issues

### 🔴 CRITICAL ISSUES

#### Issue 1: Field Name Mismatch - `distance` vs `distance_miles`
- **Backend sends**: `distance_miles: int`
- **Frontend expects**: `distance: number`
- **Impact**: Distance information not displayed
- **Fix Required**: Update frontend to use `distance_miles` OR update backend to send `distance`

#### Issue 2: Field Name Mismatch - `nct_number` vs `nctNumber`
- **Backend sends**: `nct_number: str`
- **Frontend expects**: `nctNumber: string`
- **Impact**: NCT numbers may not display correctly
- **Current Workaround**: ResultsStep.tsx transforms this in `transformAPITrial()`
- **Status**: ✅ HANDLED by transformation layer

#### Issue 3: `why_matched` Structure Mismatch
- **Backend sends**: `List[MatchReason]` where `MatchReason = {criterion: str, met: bool, description: str}`
- **Frontend expects**: `string[]`
- **Impact**: Match reasons may not display correctly
- **Current Status**: Backend likely flattens to strings in actual response

#### Issue 4: `what_to_confirm` Structure Mismatch
- **Backend sends**: `List[ConfirmationItem]` where `ConfirmationItem = {item: str, description: str, priority: str}`
- **Frontend expects**: `string[]`
- **Impact**: Confirmation items may not display correctly
- **Current Status**: Backend likely flattens to strings in actual response

### 🟡 MODERATE ISSUES

#### Issue 5: `patient_burden` vs `burden` Field Name
- **Backend sends**: `patient_burden: Dict[str, Any]`
- **Frontend expects**: `burden: TrialBurden`
- **Impact**: Burden information may not display
- **Current Workaround**: ResultsStep.tsx manually constructs burden object

#### Issue 6: Phase Type Strictness
- **Backend**: `Optional[str]` (any string)
- **Frontend api.ts**: Union of specific phase strings
- **Frontend oncology.ts**: `string` (any string)
- **Impact**: Type safety inconsistency
- **Recommendation**: Backend should validate phase values

### 🟢 RESOLVED ISSUES

#### ✅ Issue 7: Status Field (FIXED)
- **Problem**: Backend sends `status: "recruiting"` (string), frontend expected `status.recruiting` (object property)
- **Solution**: Updated Trial type to accept both formats, updated TrialCard.tsx to check string value
- **Status**: RESOLVED

#### ✅ Issue 8: `last_updated` Field (FIXED)
- **Problem**: Frontend wasn't receiving last_updated from backend
- **Solution**: Added `last_updated: apiTrial.trial.last_updated` to ResultsStep.tsx transformation
- **Status**: RESOLVED

---

## 4. Transformation Layer Analysis

### Current Transformation (ResultsStep.tsx lines 47-76)

The `transformAPITrial()` function handles several conversions:

```typescript
const transformAPITrial = (apiTrial: APIMatchedTrial): Trial => ({
    id: apiTrial.trial.nct_number,  // ✅ Creates id from nct_number
    nctNumber: apiTrial.trial.nct_number,  // ✅ Converts snake_case
    title: apiTrial.trial.title,
    phase: apiTrial.trial.phase || "Unknown",
    sponsor: apiTrial.trial.sponsor || "Unknown",
    location: apiTrial.trial.location || "Multiple locations",
    status: apiTrial.trial.status,  // ✅ FIXED: Now passes through
    last_updated: apiTrial.trial.last_updated,  // ✅ FIXED: Now passes through
    matchConfidence: apiTrial.confidence,  // ✅ Converts to camelCase
    matchScore: apiTrial.score,  // ✅ Converts to camelCase
    whyMatched: apiTrial.why_matched || [],  // ✅ Converts to camelCase
    whatToConfirm: apiTrial.what_to_confirm || [],  // ✅ Converts to camelCase
    burden: {  // ⚠️ Manually constructs from patient_burden
        visitsPerMonth: apiTrial.trial.burden?.visits_per_month || 2,
        biopsyRequired: apiTrial.trial.burden?.biopsy_required || false,
        hospitalDays: apiTrial.trial.burden?.hospital_stays || false,
        imagingFrequency: apiTrial.trial.burden?.imaging_frequency || "Every 6-8 weeks",
        burdenScore: "medium",
    },
    // ⚠️ MISSING: distance field not mapped
});
```

---

## 5. Recommendations

### High Priority

1. **Add distance field mapping**
   ```typescript
   distance: apiTrial.trial.distance_miles || 0,
   ```

2. **Verify backend response structure**
   - Check if `why_matched` is actually sent as strings or objects
   - Check if `what_to_confirm` is actually sent as strings or objects
   - Check if `patient_burden` exists in trial object or only in MatchedTrial

3. **Update backend to include burden in trial object**
   - Currently burden seems to be in MatchedTrial.patient_burden
   - Frontend expects it in trial.burden
   - Consider adding burden to TrialDetail schema

### Medium Priority

4. **Standardize field naming convention**
   - Option A: Backend uses snake_case, frontend transforms to camelCase (current approach)
   - Option B: Backend sends both formats for compatibility
   - Recommendation: Keep current approach but document it

5. **Add TypeScript validation**
   - Create runtime validators using Zod or similar
   - Validate API responses match expected types
   - Log warnings for unexpected data

### Low Priority

6. **Consider GraphQL or tRPC**
   - Would provide end-to-end type safety
   - Eliminates manual transformation layer
   - Future enhancement consideration

---

## 6. Testing Recommendations

### Unit Tests Needed

1. Test `transformAPITrial()` with various backend response shapes
2. Test handling of missing optional fields
3. Test handling of null vs undefined values

### Integration Tests Needed

1. Test full matching flow with real backend
2. Verify all trial fields display correctly
3. Test edge cases (missing data, malformed responses)

---

## 7. Action Items

- [ ] Add distance field to transformation
- [ ] Verify actual backend response structure for why_matched and what_to_confirm
- [ ] Test burden field mapping with real data
- [ ] Add runtime type validation
- [ ] Document transformation layer in code comments
- [ ] Create integration tests for API compatibility

---

## Appendix: Field Mapping Reference

| Backend Field | Frontend Field (api.ts) | Frontend Field (oncology.ts) | Status |
|--------------|------------------------|----------------------------|--------|
| nct_number | nct_number | nctNumber | ✅ Transformed |
| title | title | title | ✅ Match |
| phase | phase | phase | ✅ Match |
| sponsor | sponsor | sponsor | ✅ Match |
| status | status | status | ✅ Fixed |
| location | location | location | ✅ Match |
| distance_miles | distance | - | ⚠️ Missing |
| last_updated | last_updated | last_updated | ✅ Fixed |
| cancer_type | cancer_type | - | ✅ Match |
| score | - | matchScore | ✅ Transformed |
| confidence | - | matchConfidence | ✅ Transformed |
| why_matched | why_matched | whyMatched | ⚠️ Verify structure |
| what_to_confirm | what_to_confirm | whatToConfirm | ⚠️ Verify structure |
| patient_burden | - | burden | ⚠️ Manual construction |
