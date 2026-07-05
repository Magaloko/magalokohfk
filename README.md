# MAGALOKO HFK Cockpit

**Status:** Internal Cockpit / Portfolio Prototype  
**Demo:** https://magalokohfk.vercel.app  
**Repository:** https://github.com/Magaloko/magalokohfk

MAGALOKO HFK Cockpit is an internal steering prototype for HFK/Mago context: system map, roadmap, access overview and briefing tools around SeBo, JTL, N8N, Brevo and VEKTRA-related work.

The project is not positioned as a finished SeBo product. It is a cockpit and documentation layer for orientation, planning and decision support.

## Purpose

The cockpit collects operational context that is usually scattered across tools, notes and conversations:

- daily focus and decision overview
- system map for JTL Wawi, JTL-Shop, SeBo, N8N, All-inkl, Analytics, GSC, Doofinder, DeepSeek and Brevo
- access overview without storing passwords or API keys
- roadmap / Kanban for Mago tasks
- Stephan briefing generator with Markdown output
- conversation preparation
- jobs and tasks: role profiles, task areas and step-by-step playbooks
- HFK context knowledge cards

## Scope Boundary

Important for client and portfolio conversations:

| Area | Positioning |
|---|---|
| SeBo | operative service layer |
| HFK Akademie / VEKTRA | sales training / academy module |
| MAGALOKO HFK Cockpit | internal steering, planning and system overview layer |

This repository should therefore be shown as cockpit/pre-work and strategic documentation tooling, not as a final delivery claim for SeBo.

## Tech / Runtime

The repository contains a lightweight cockpit prototype with local/browser-based MVP data flows and supporting documentation.

Local start, depending on the checked-out version:

```bash
node server.mjs
```

Then open:

```text
http://127.0.0.1:4177
```

## Security Note

Do not enter passwords, API keys or customer-sensitive data into the cockpit.

The MVP is designed for orientation and planning. Access lists are intended as references only, not as secret storage.

## Portfolio Note

This repository is useful as a portfolio reference for business cockpits, system maps and project steering interfaces.

Before external presentation, content should be curated so HFK, SeBo, Mago, Academy and VEKTRA topics stay clearly separated.
