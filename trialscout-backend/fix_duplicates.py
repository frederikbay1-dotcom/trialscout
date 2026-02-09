#!/usr/bin/env python3
"""Fix duplicate NCT numbers in mock_trials.py"""

import re

# Read the file
with open('app/data/mock_trials.py', 'r', encoding='utf-8') as f:
    content = f.read()

print("Before changes:")
print(f"  NCT05123456 count: {content.count('NCT05123456')}")
print(f"  NCT05789234 count: {content.count('NCT05789234')}")

# Replace lung_trial_002 NCT number
content = re.sub(
    r'(id="lung_trial_002",\s+nct_number=")NCT05123456(")',
    r'\1NCT05123457\2',
    content,
    flags=re.DOTALL
)

# Replace lung_trial_008 NCT number  
content = re.sub(
    r'(id="lung_trial_008",\s+nct_number=")NCT05789234(")',
    r'\1NCT05789235\2',
    content,
    flags=re.DOTALL
)

# Write back
with open('app/data/mock_trials.py', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
with open('app/data/mock_trials.py', 'r', encoding='utf-8') as f:
    new_content = f.read()

print("\nAfter changes:")
print(f"  NCT05123456 count: {new_content.count('NCT05123456')}")
print(f"  NCT05123457 count: {new_content.count('NCT05123457')}")
print(f"  NCT05789234 count: {new_content.count('NCT05789234')}")
print(f"  NCT05789235 count: {new_content.count('NCT05789235')}")

# Validate
nct_numbers = re.findall(r'nct_number="(NCT\d+)"', new_content)
print(f"\nTotal trials: {len(nct_numbers)}")
print(f"Unique NCT numbers: {len(set(nct_numbers))}")

if len(nct_numbers) == len(set(nct_numbers)):
    print("✓ All NCT numbers are unique!")
else:
    from collections import Counter
    counts = Counter(nct_numbers)
    print("✗ Duplicates found:")
    for nct, count in counts.items():
        if count > 1:
            print(f"  {nct}: {count} times")