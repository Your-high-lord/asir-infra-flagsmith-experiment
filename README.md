# ASIR.INFRA — Remote Linux Preflight Experiment

A standalone hackathon demo inspired by the ASIR.INFRA Remote Linux Infrastructure Lab.

## Experiment

Compare two pre-deployment runbook experiences with Flagsmith:
- `quick` — concise checklist instructions (control)
- `guided` — added context and troubleshooting explanations (variant)

**Hypothesis:** a guided runbook increases the proportion of visitors who complete the infrastructure preflight checklist.

**Conversion event:** `preflight_completed`.

The four checks cover SSH access, Tailscale/private network reachability, Apache/httpd service health and DNS resolution. This is a manual checklist: the browser does not connect to hosts, inspect private networks or execute system commands.

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without a Flagsmith client-side environment key, the app runs in local preview mode without sending experiment events.

## Configure Flagsmith

Experimentation access and warehouse availability depend on your Flagsmith account and plan. Confirm both before running a live experiment.

1. Create a project and use its client-side Development environment key.
2. Set `VITE_FLAGSMITH_ENVIRONMENT_KEY` in `.env.local`. Never expose a server-side or master key in browser code.
3. Create a multivariate string flag named `preflight_experience` with `quick` and `guided` variations.
4. Create an increase conversion metric for the exact event `preflight_completed`.
5. Create and start an experiment for the flag and metric (suggested initial split: 50/50).
6. Verify assignments and conversion events in Flagsmith using real visitors. Do not fabricate experiment results.

The SDK uses `@flagsmith/flagsmith`, `enableEvents: true`, a pseudonymous visitor identifier, `identify()`, `getExperimentFlag('preflight_experience')` and `trackEvent('preflight_completed')`.

## GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys on pushes to `main`.

1. Select **GitHub Actions** as the Pages build source under repository Settings → Pages.
2. Add repository Actions variable `VITE_FLAGSMITH_ENVIRONMENT_KEY` with the client-side environment key.
3. Push to `main` or manually run the Pages workflow.

## Pre-submission checklist

- [ ] Confirm Flagsmith Experimentation and warehouse access.
- [ ] Configure and start the experiment.
- [ ] Verify flag assignment and conversion tracking.
- [ ] Collect genuine participant traffic.
- [ ] Record a demo showing both variants and actual results.
- [ ] Explain the manual verification limitation.

## References

- https://docs.flagsmith.com/experimentation/set-up-with-a-coding-agent
- https://docs.flagsmith.com/experimentation/run-an-experiment
- https://github.com/Flagsmith/flagsmith-js-client
