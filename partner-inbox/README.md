# VakLease Partner Inbox

Interne mailclient en partner-CRM voor VakLease.

## V1
- STRATO mailbox via IMAP/SMTP
- Inbox lezen
- E-mail versturen
- Leasepartner CRM
- Outreach templates
- PostgreSQL logging
- Datamodel voor toekomstige leaseaanvragen en overdracht naar partners

## Render environment variables

Verplicht:
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `DATABASE_URL`

Mailbox zodra beschikbaar:
- `MAIL_USER` — bijvoorbeeld partners@vaklease.nl
- `MAIL_PASSWORD`
- `MAIL_FROM_NAME` — standaard VakLease

STRATO defaults zijn ingebouwd:
- `MAIL_IMAP_HOST=imap.strato.de`
- `MAIL_IMAP_PORT=993`
- `MAIL_SMTP_HOST=smtp.strato.de`
- `MAIL_SMTP_PORT=465`

## Render commands

Build:
`cd partner-inbox && npm install`

Start:
`cd partner-inbox && npm start`

De app weigert toegang als ADMIN_USER/ADMIN_PASSWORD ontbreken. De health endpoint blijft publiek beschikbaar voor monitoring.
