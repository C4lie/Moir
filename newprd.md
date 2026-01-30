
---

# PRD – Add-On Features (Post-Launch Enhancement)

**Project:** Moir (Journal App)
**Scope:** Enhancements only (base system already implemented)

---

## 1. Primary New Feature: Weekly Thought Summary

### Purpose

Help overthinkers gain clarity by seeing **patterns in what they wrote**, without invading privacy or acting like therapy.

### Requirements

* Add a **Weekly Summary** feature that generates a short text summary from user-approved notebooks only.
* Summary should cover:

  * recurring topics
  * repeated concerns
  * general focus of the week

### Privacy Rules

* Each notebook must have a toggle:

  * **Private (default)** → never processed
  * **Include in Weekly Summary** → opt-in
* Only opt-in notebooks are analyzed.
* No background processing of private content.

### Output Rules

* Plain text paragraph only
* No advice
* No diagnosis
* No emotional labels
* No suggestions

Example output:

> “This week, your writing focused mainly on work stress, overthinking decisions, and mental fatigue.”

---

## 2. Additional Minimal Features (Cool but Not Noisy)



### 2.1 Thought Frequency Highlights

* Detect commonly repeated words or phrases (from opted-in notebooks only)
* Display them as a **small, quiet list** or subtle highlight
* No charts, no scores

Why: Helps users notice what their mind keeps returning to.

---

### 2.2 Entry Time Insight (Optional)

* Show when the user usually writes (morning / night)
* Simple text insight, not analytics

Example:

> “You usually write late at night.”

Why: Makes the app feel self-aware without being invasive.

---

### 2.3 Weekly Reflection Page

* A simple page that shows:

  * weekly summary text
  * number of entries written
  * notebooks involved
* Read-only
* No actions except “Close”

Why: Keeps reflection separate from writing.

---

## 3. What NOT to Add (Important)

* No mood scoring
* No emotion labels
* No AI advice
* No “you should” language
* No charts, graphs, or dashboards
* No social or public sharing

This is **clarity**, not therapy.

---

## 4. UX Rules for All New Features

* Features must feel **optional**
* No popups
* No forced onboarding
* No notifications
* Everything stays quiet and respectful

---

## 5. Implementation Notes for Anti-Gravity

* Treat all new features as **additive**
* Do not modify existing flows unless required
* No changes to base authentication, writing, calendar, or notebooks
* Follow existing UI style and components
* Add feature flags if needed

---

## Final Verdict (Straight Talk)

✅ Weekly summary → **good idea, safe if opt-in**
✅ Extra insights → **keep subtle, text-only**

