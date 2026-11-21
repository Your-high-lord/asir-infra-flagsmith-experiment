# Flagsmith configuration checklist

Use a client-side Development environment key.

## Feature flag
- Name: `preflight_experience`
- Type: multivariate string
- Variation A: `quick`
- Variation B: `guided`

## Conversion metric
- Event name: `preflight_completed` (case-sensitive)
- Direction: increase

## Experiment
- Name: Guided preflight vs quick checklist
- Hypothesis: Visitors assigned to the guided runbook will complete the infrastructure preflight checklist at a higher rate than visitors assigned to the quick checklist.
- Flag: `preflight_experience`
- Metric: `preflight_completed`
- Suggested initial allocation: 50% quick / 50% guided

Confirm Flagsmith Experimentation and warehouse access before starting a live test. Do not expose server-side or master keys in browser code.
