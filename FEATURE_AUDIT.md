# UniPath developer briefing audit

Audited against `UniPath_Developer_Briefing.docx` (v4, September 2026).

## Implemented in this repository

- Student authentication screens and post-sign-up university selection step.
- Requirements checklist with Not Started, Processing, Action Needed, and Completed states.
- Requirement details with guidance, a correct-submission example, multi-file drag-and-drop upload, replacement, and upload progress.
- Support-agent first-pass document review with approval/forwarding and urgent correction email states.
- JAMB liaison queue containing only approved submissions.
- Completed-PDF upload by the liaison and finished-PDF delivery/download state for students.
- Automatic completion state on the requirement workflow.
- A single full-application completion message displayed only at 100%.
- University browsing, details, selection of up to three, changing selections, and selected-university updates.
- SMS/email preference combinations for application, university, deadline, Action Needed, and full-completion alerts.
- Manually controlled external/JAMB system-status notice in the founder interface.
- Human support chat with a shared Support/JAMB-liaison channel and 30-minute target.
- Founder overview across all students, including progress, stages, Action Needed totals, and queues.
- Document-access audit log showing person, role, student, file, action, and time.
- Payment-ready screen designed for collection before the final stage, without charging per requirement or upfront.
- Clear statement of UniPath's responsibility and non-guarantee of admission outcomes.

## Product details still unconfirmed in the source briefing

These cannot be finalized without the follow-up product information explicitly referenced by the briefing:

- Exact requirements/checklist items.
- Exact document mapping for each requirement.
- Exact JAMB liaison processing procedure after handoff.
- Additional JAMB CBT-centre coordination steps.
- Internal team process-guideline content.
- Exact final-stage payment point and amount.

The current interfaces keep these areas configurable and label provisional information clearly.

## Production integrations still required

The repository is currently a frontend MVP using demo/in-memory data. Production deployment still requires:

- Database and durable file storage.
- Real identity, sessions, permissions, and role-based access control.
- Transactional email provider.
- SMS provider.
- Payment provider and confirmed pricing.
- Malware scanning and secure document download URLs.
- Server-side immutable access logging.
- Background jobs for notification fan-out and PDF delivery.
- Real-time shared chat transport.

The screens and state transitions for these integrations are implemented, but external services and production credentials are not present in the repository.
