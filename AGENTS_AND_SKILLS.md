# CodeGuard AI — Agents & Skills

## Agent: Code Review Agent

### Description
Analyzes pull requests and detects bugs, risks, and improvements.

### Input
- PR diff
- PR metadata

### Output
- Findings
- Risk score

---

## Skill: Risk Analysis

### Description
Evaluates severity of code issues.

### Logic
- High → security / crashes
- Medium → logic flaws
- Low → style / minor issues

---

## Skill: Test Generation

### Description
Generates test cases based on detected issues.

### Output
- Unit test names
- Sample test code