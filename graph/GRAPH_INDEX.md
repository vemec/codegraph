# Code Graph — Index

> Source: `/Users/vemec/DG-Projects/encaja/` @ `881bc176` ⚠ working tree with uncommitted changes
> Generated: 2026-06-27T04:17:22.984Z
> Languages: json, ts · Nodes: 5217 · Edges: 15110

Map of code relationships. Use it to orient before reading files: the
**God nodes** are the most connected symbols (touching them has wide impact), and the
**per-module breakdown** tells you what lives where. For specific detail, query `graph.json`.

## Snapshot

| Metric | Value |
|---|--:|
| Files | 1324 |
| Symbols | 3288 |
| — functions | 2234 |
| — classes | 63 |
| — interfaces | 359 |
| — methods | 44 |
| — other exports | 588 |
| Exported symbols | 2698 |
| Unused exports | 1173 |
| Modules | 578 |
| External deps | 605 |
| Edges | 15110 |
| Density (edges/node) | 2.9 |

**Edges by kind:** imports 6318 · contains 3317 · calls 2836 · references 1866 · renders 737 · extends 32 · implements 4

## God nodes (most connected)

| Symbol | Kind | Connections | Location |
|---|---|--:|---|
| `cn` | function | 305 | `packages/ui/src/lib/utils.ts:4` |
| `db` | export | 245 | `packages/db/src/client.ts:141` |
| `auth` | export | 201 | `packages/auth/src/index.ts:198` |
| `internalErrorResponse` | function | 156 | `packages/lib/api/responses.ts:151` |
| `unauthorizedResponse` | function | 145 | `packages/lib/api/responses.ts:72` |
| `users` | export | 82 | `packages/db/src/schema.ts:165` |
| `badRequestResponse` | function | 79 | `packages/lib/api/responses.ts:55` |
| `successResponse` | function | 79 | `packages/lib/api/responses.ts:22` |
| `Button` | function | 73 | `packages/ui/src/components/button.tsx:41` |
| `getAuthUser` | export | 50 | `packages/auth/src/session.ts:61` |
| `noContentResponse` | function | 47 | `packages/lib/api/responses.ts:48` |
| `notFoundResponse` | function | 44 | `packages/lib/api/responses.ts:120` |
| `CommerceError` | class | 40 | `apps/platform/modules/commerce/errors.ts:6` |
| `handleFormInvalidLogs` | function | 39 | `packages/lib/utils/form-helpers.ts:16` |
| `validationErrorResponse` | function | 37 | `packages/lib/api/responses.ts:135` |

## Architectural layers

Modules ranked by **instability** `I = fan-out / (fan-in + fan-out)`, measured from
the dependency graph. High I = depends on many, used by few (application/edge layer);
low I = used widely, depends on little (foundation). The order IS the layering.

| Module | Layer | Fan-in | Fan-out | Instability |
|---|---|--:|--:|--:|
| `apps/platform/modules-product/employee/components/profile` | Application | 0 | 100 | 1.00 |
| `apps/platform/modules/support/components` | Application | 0 | 100 | 1.00 |
| `apps/platform/modules/account/actions` | Application | 0 | 93 | 1.00 |
| `apps/platform/components/base-ui/form-elements` | Application | 0 | 67 | 1.00 |
| `apps/platform/modules-product/receipts/components/forms` | Application | 0 | 58 | 1.00 |
| `apps/platform/modules/account/components/security` | Application | 0 | 44 | 1.00 |
| `apps/platform/modules/auth/components` | Application | 0 | 38 | 1.00 |
| `apps/platform/modules/account/components/account` | Application | 0 | 38 | 1.00 |
| `apps/platform/modules/billing/components` | Application | 0 | 36 | 1.00 |
| `apps/platform/modules/addresses/actions` | Application | 0 | 36 | 1.00 |
| `apps/platform/modules/contact-methods/actions` | Application | 0 | 35 | 1.00 |
| `apps/platform/modules-product/employee/components/bank-accounts` | Application | 0 | 34 | 1.00 |
| `apps/public/modules/layout/components` | Application | 0 | 33 | 1.00 |
| `apps/platform/modules/notifications/components/bell` | Application | 0 | 32 | 1.00 |
| `apps/platform/modules/commerce/services` | Application | 0 | 30 | 1.00 |
| `apps/platform/modules-product/receipts/components/sueldo` | Application | 0 | 30 | 1.00 |
| `apps/platform/modules/system-events/jobs` | Application | 0 | 28 | 1.00 |
| `apps/platform/modules/contact-methods/components` | Application | 0 | 27 | 1.00 |
| `apps/platform/modules-product/employee/components/salary-updates` | Application | 0 | 26 | 1.00 |
| `apps/public/components` | Application | 0 | 24 | 1.00 |
| `apps/platform/modules-product/receipts/components/history` | Application | 0 | 22 | 1.00 |
| `apps/platform/components/base-ui/skeletons` | Application | 0 | 22 | 1.00 |
| `apps/platform/modules/notifications/components/preferences` | Application | 0 | 22 | 1.00 |
| `apps/platform/app/api/(product)/receipts/[id]` | Application | 0 | 21 | 1.00 |
| `apps/platform/modules-product/receipts/jobs` | Application | 0 | 21 | 1.00 |
| `apps/public/modules/pricing/components` | Application | 0 | 21 | 1.00 |
| `apps/platform/modules/chat/components` | Application | 0 | 21 | 1.00 |
| `apps/platform/modules/notifications/components/inbox` | Application | 0 | 21 | 1.00 |
| `apps/platform/modules/billing/components/settings` | Application | 0 | 20 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]` | Application | 0 | 19 | 1.00 |
| `apps/platform/app/api/(product)/employer-profiles` | Application | 0 | 19 | 1.00 |
| `apps/platform/modules-product/receipts/components` | Application | 0 | 19 | 1.00 |
| `apps/public/modules/home/components` | Application | 0 | 19 | 1.00 |
| `apps/platform/modules/addresses/components` | Application | 0 | 19 | 1.00 |
| `apps/platform/app/api/organizations/[id]` | Application | 0 | 18 | 1.00 |
| `apps/platform/modules/notifications/components/detail` | Application | 0 | 18 | 1.00 |
| `apps/platform/app/api/addresses/[id]` | Application | 0 | 17 | 1.00 |
| `apps/public/modules/contact/components` | Application | 0 | 17 | 1.00 |
| `apps/platform/app/api/(product)/attendance/workplaces` | Application | 0 | 17 | 1.00 |
| `apps/platform/app/api/social/blocks` | Application | 0 | 17 | 1.00 |
| `apps/platform/modules-product/attendance/components/qr` | Application | 0 | 17 | 1.00 |
| `apps/platform/components/base-ui/data-table` | Application | 0 | 16 | 1.00 |
| `apps/platform/app/api/contact-methods/[id]` | Application | 0 | 16 | 1.00 |
| `apps/platform/app/api/addresses` | Application | 0 | 15 | 1.00 |
| `apps/platform/app/api/contact-methods` | Application | 0 | 15 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/bank-accounts/[bankAccountId]` | Application | 0 | 14 | 1.00 |
| `apps/platform/app/api/chat/conversations` | Application | 0 | 14 | 1.00 |
| `apps/platform/modules/account/components/profile` | Application | 0 | 14 | 1.00 |
| `apps/public/modules/blog/components` | Application | 0 | 14 | 1.00 |
| `apps/platform/app/[locale]` | Application | 0 | 14 | 1.00 |
| `apps/platform/modules-product/trabajo-domestico/scenarios/runner` | Application | 0 | 14 | 1.00 |
| `apps/public/modules/how-it-works/components` | Application | 0 | 14 | 1.00 |
| `apps/platform/components/base-ui/modal` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/(product)/receipt-gen-settings` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/(product)/attendance/qr` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/(product)/attendance/records` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/account/password` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/account/sessions` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/commerce/offerings/prices` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/commerce/offerings` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/commerce` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/organizations/[id]/members/[memberId]` | Application | 0 | 13 | 1.00 |
| `apps/platform/app/api/social/follows` | Application | 0 | 13 | 1.00 |
| `apps/platform/modules/notifications/jobs` | Application | 0 | 13 | 1.00 |
| `apps/platform/modules-product/home/components` | Application | 0 | 13 | 1.00 |
| `apps/public/modules/seo/utils` | Application | 0 | 12 | 1.00 |
| `apps/platform/components/base-ui` | Application | 0 | 12 | 1.00 |
| `apps/platform/app/api/(product)/employees` | Application | 0 | 12 | 1.00 |
| `apps/platform/app/api/account/connections` | Application | 0 | 12 | 1.00 |
| `apps/platform/app/api/account/profile` | Application | 0 | 12 | 1.00 |
| `apps/platform/app/api/notifications/preferences` | Application | 0 | 12 | 1.00 |
| `apps/platform/app/api/organizations` | Application | 0 | 12 | 1.00 |
| `apps/platform/app/api/referrals/invites` | Application | 0 | 12 | 1.00 |
| `apps/public/modules/features/components` | Application | 0 | 12 | 1.00 |
| `apps/platform/components/base-ui/confirm-dialog` | Application | 0 | 11 | 1.00 |
| `apps/platform/app/api/account/deletion` | Application | 0 | 11 | 1.00 |
| `apps/platform/app/api/data-export` | Application | 0 | 11 | 1.00 |
| `apps/platform/modules/auth/hooks` | Application | 0 | 11 | 1.00 |
| `apps/platform/modules/data-export/components` | Application | 0 | 11 | 1.00 |
| `apps/platform/lib` | Application | 0 | 11 | 1.00 |
| `apps/platform/components/base-ui/empty-state` | Application | 0 | 10 | 1.00 |
| `apps/platform/app/api/admin/support/tickets/[id]/reply` | Application | 0 | 10 | 1.00 |
| `apps/platform/app/api/admin/support/tickets/[id]/status` | Application | 0 | 10 | 1.00 |
| `apps/platform/modules-product/attendance/components/checkin` | Application | 0 | 10 | 1.00 |
| `apps/platform/app/api/chat/conversations/[id]/messages` | Application | 0 | 10 | 1.00 |
| `apps/platform/app/[locale]/(auth)/employee-invite/[token]/register` | Application | 0 | 10 | 1.00 |
| `apps/platform/scripts` | Application | 0 | 10 | 1.00 |
| `apps/public/modules/faq/components` | Application | 0 | 10 | 1.00 |
| `apps/platform/modules-product/employer-profile/components` | Application | 0 | 10 | 1.00 |
| `apps/platform/modules-product/employee-invitation/db` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/support/tickets/[id]/messages` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/support/tickets/[id]/rate` | Application | 0 | 9 | 1.00 |
| `apps/public/modules/newsletter/components` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/(product)/attendance/workplaces/[id]` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/bank-accounts` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/recargo-config` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/receipts` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/(product)/receipts/check` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/(product)/receipts/generate` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/(product)/receipts/leave-balance` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/account/email` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/billing/downgrade` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/billing/resume` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/chat/conversations/[id]` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/data-export/[id]/download` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/data-export/[id]` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/notifications/[id]` | Application | 0 | 9 | 1.00 |
| `apps/platform/app/api/referrals/invites/[id]` | Application | 0 | 9 | 1.00 |
| `apps/public/modules/about/components` | Application | 0 | 9 | 1.00 |
| `apps/public/modules/help/components` | Application | 0 | 9 | 1.00 |
| `apps/public/app/[locale]` | Application | 0 | 9 | 1.00 |
| `apps/public/modules/problem-solution/components` | Application | 0 | 9 | 1.00 |
| `apps/platform/modules-product/employee/components/create-employee` | Application | 0 | 9 | 1.00 |
| `apps/public/modules/calculator/components` | Application | 0 | 9 | 1.00 |
| `apps/platform/modules/audit/components` | Application | 0 | 9 | 1.00 |
| `apps/mobile/modules/layout/components` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/admin/support/tickets/[id]` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/admin/support/tickets` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/support` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/attendance/breakdown` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/attendance/events` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/bank-accounts/[bankAccountId]/default` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/history` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/soft-delete` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/employees/[id]/suspend` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/receipts/[id]/pdf` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/receipts/preview` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/(product)/receipts` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/account/activity` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/account/avatar` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/audit` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/billing/cancel` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/billing/checkout` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/billing/portal` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/chat/message` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/feedback` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/notifications/archive` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/notifications/delete` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/notifications/read` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/notifications` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/notifications/unread` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/[id]/invitations/[invitationId]` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/[id]/invitations` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/[id]/members/me` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/[id]/members` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/[id]/transfer-ownership` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/invitations/accept` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/invitations/decline` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/organizations/members` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/referrals/claim` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/referrals/code` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/referrals` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/social/follow-requests/[requesterId]/accept` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/social/follow-requests/[requesterId]/reject` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/social/follow-requests/[requesterId]` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/social/follow-status` | Application | 0 | 8 | 1.00 |
| `apps/platform/app/api/social/followers` | Application | 0 | 8 | 1.00 |
| `apps/mobile/modules/account/components` | Application | 0 | 8 | 1.00 |
| `apps/platform/modules-product/attendance/components/workplace/list` | Application | 0 | 8 | 1.00 |
| `apps/platform/modules-product/bps-sync/components` | Application | 0 | 8 | 1.00 |
| `apps/platform/modules-product/receipt-gen-settings/components` | Application | 0 | 8 | 1.00 |
| `apps/platform/components/base-ui/page` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/support/tickets/[id]` | Application | 0 | 7 | 1.00 |
| `apps/platform/modules-product/navigation/constants` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/(product)/home` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/account/email/verify` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/account/sessions/other` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/auth/session` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/billing/overview` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/billing/subscription` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/commerce/checkout` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/dashboard` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/notifications/read-all` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/social/follow-requests` | Application | 0 | 7 | 1.00 |
| `apps/platform/app/api/social/following` | Application | 0 | 7 | 1.00 |
| `apps/platform/modules-product/bps-sync/scripts` | Application | 0 | 7 | 1.00 |
| `apps/platform/modules/referrals/jobs` | Application | 0 | 7 | 1.00 |
| `apps/public/modules/consent/components` | Application | 0 | 7 | 1.00 |
| `apps/platform/components` | Application | 0 | 6 | 1.00 |
| `apps/public/app/[locale]/blog/[slug]` | Application | 0 | 6 | 1.00 |
| `apps/platform/app/api/(product)/attendance/checkin-receipt` | Application | 0 | 6 | 1.00 |
| `apps/platform/app/api/(product)/attendance/checkin-state` | Application | 0 | 6 | 1.00 |
| `apps/platform/app/api/(product)/attendance/checkin` | Application | 0 | 6 | 1.00 |
| `apps/platform/app/api/billing/access` | Application | 0 | 6 | 1.00 |
| `apps/platform/app/api/support/tickets` | Application | 0 | 6 | 1.00 |
| `apps/platform/modules-product/attendance/components/workplace/layout` | Application | 0 | 6 | 1.00 |
| `apps/platform/modules-product/auth` | Application | 0 | 6 | 1.00 |
| `apps/platform/modules-product/employee/components/list` | Application | 0 | 6 | 1.00 |
| `apps/platform/modules-product/employee/components/settings` | Application | 0 | 6 | 1.00 |
| `apps/platform/app/api/auth/logout` | Application | 0 | 6 | 1.00 |
| `apps/platform/modules/dashboard/actions` | Application | 0 | 6 | 1.00 |
| `apps/platform/modules/system-events` | Application | 0 | 6 | 1.00 |
| `apps/public/modules/testimonials/components` | Application | 0 | 6 | 1.00 |
| `apps/platform/db` | Application | 0 | 5 | 1.00 |
| `apps/public/app/[locale]/faq` | Application | 0 | 5 | 1.00 |
| `apps/platform/app/api/auth/reset-password` | Application | 0 | 5 | 1.00 |
| `apps/platform/app/api/webhooks/commerce/stripe` | Application | 0 | 5 | 1.00 |
| `apps/platform/app/api/webhooks/mercadopago` | Application | 0 | 5 | 1.00 |
| `apps/platform/app/api/webhooks/resend` | Application | 0 | 5 | 1.00 |
| `apps/platform/app/api/webhooks/stripe` | Application | 0 | 5 | 1.00 |
| `apps/platform/modules-product/attendance/components/workplace` | Application | 0 | 5 | 1.00 |
| `apps/platform/modules-product/receipt-gen-settings` | Application | 0 | 5 | 1.00 |
| `apps/platform/modules/system-status/components` | Application | 0 | 5 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees/[id]` | Application | 0 | 4 | 1.00 |
| `apps/platform/modules/addresses/hooks` | Application | 0 | 4 | 1.00 |
| `apps/platform/modules/auth/actions` | Application | 0 | 4 | 1.00 |
| `apps/platform/modules/auth/db` | Application | 0 | 4 | 1.00 |
| `apps/platform/modules/contact-methods/hooks` | Application | 0 | 4 | 1.00 |
| `apps/public/app/[locale]/blog` | Application | 0 | 4 | 1.00 |
| `apps/platform/app/api/auth/request-password-reset` | Application | 0 | 4 | 1.00 |
| `apps/platform/app/api/billing/plans` | Application | 0 | 4 | 1.00 |
| `apps/platform/app/api/billing/providers` | Application | 0 | 4 | 1.00 |
| `apps/platform/app/[locale]/(checkout)/checkout/success` | Application | 0 | 4 | 1.00 |
| `apps/platform/app/[locale]/(public-product)/checkin/[token]` | Application | 0 | 4 | 1.00 |
| `apps/platform/app/api/storage/upload` | Application | 0 | 4 | 1.00 |
| `apps/platform/app` | Application | 0 | 4 | 1.00 |
| `apps/platform/modules/account/components/privacy` | Application | 0 | 4 | 1.00 |
| `apps/platform/modules/data-export/jobs` | Application | 0 | 4 | 1.00 |
| `apps/public/app` | Application | 0 | 4 | 1.00 |
| `apps/platform/app/api/system-status` | Application | 0 | 3 | 1.00 |
| `apps/platform/modules-product/bps-sync/browser/actions` | Application | 0 | 3 | 1.00 |
| `apps/platform/modules-product/secrets` | Application | 0 | 3 | 1.00 |
| `apps/platform/modules/dashboard/components` | Application | 0 | 3 | 1.00 |
| `apps/platform/modules/referrals/hooks` | Application | 0 | 3 | 1.00 |
| `apps/platform` | Application | 0 | 3 | 1.00 |
| `apps/public/app/[locale]/precios` | Application | 0 | 3 | 1.00 |
| `apps/platform/modules/background-ops` | Application | 0 | 3 | 1.00 |
| `apps/mobile/app/(app)/(tabs)` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(auth)/post-login` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(checkout)/checkout` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(dashboard)/admin/support` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(dashboard)/support/[id]` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(dashboard)/support/chat` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/attendance/[workplaceId]` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees/[id]/agreements` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees/[id]/bps` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees/[id]/contract` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees/[id]/salary-updates` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees/[id]/schedule` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees/[id]/settings` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/aguinaldo` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/dismissal` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/resignation` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/salary` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/vacation` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(product)/(onboarding)` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/api/auth/[...all]` | Application | 0 | 2 | 1.00 |
| `apps/platform/components/base-ui/info-item` | Application | 0 | 2 | 1.00 |
| `apps/platform/components/base-ui/meta-item` | Application | 0 | 2 | 1.00 |
| `apps/platform/lib/encaja` | Application | 0 | 2 | 1.00 |
| `apps/platform/modules-product/employee/components/layout` | Application | 0 | 2 | 1.00 |
| `apps/platform/modules/account/jobs` | Application | 0 | 2 | 1.00 |
| `apps/public/modules/legal/components` | Application | 0 | 2 | 1.00 |
| `apps/public` | Application | 0 | 2 | 1.00 |
| `packages/db` | Application | 0 | 2 | 1.00 |
| `apps/platform/app/[locale]/(dashboard)/support` | Application | 0 | 1 | 1.00 |
| `apps/platform/app/[locale]/(product)/(employer)/employees` | Application | 0 | 1 | 1.00 |
| `apps/platform/modules/account/lib` | Application | 0 | 1 | 1.00 |
| `apps/platform/modules/auth/constants` | Application | 0 | 1 | 1.00 |
| `apps/platform/modules/auth/types` | Application | 0 | 1 | 1.00 |
| `apps/platform/modules/chat/jobs` | Application | 0 | 1 | 1.00 |
| `apps/public/modules/pricing/constants` | Application | 0 | 1 | 1.00 |
| `apps/platform/modules/referrals/actions` | Application | 2 | 44 | 0.96 |
| `apps/platform/modules-product/onboarding/components` | Application | 1 | 21 | 0.95 |
| `apps/platform/components/base-ui/section-layout` | Application | 1 | 20 | 0.95 |
| `apps/platform/modules/layout/components/topnav` | Application | 2 | 37 | 0.95 |
| `apps/platform/modules-product/receipt-composer/pdf-templates` | Application | 1 | 18 | 0.95 |
| `apps/platform/modules-product/receipt-composer/templates` | Application | 1 | 16 | 0.94 |
| `apps/platform/modules/feedback/components` | Application | 1 | 16 | 0.94 |
| `apps/platform/modules-product/bps-sync/jobs` | Application | 1 | 16 | 0.94 |
| `apps/platform/modules/layout/components/sidebar` | Application | 8 | 94 | 0.92 |
| `apps/platform/app/[locale]/(auth)/employee-invite/[token]` | Application | 2 | 23 | 0.92 |
| `apps/platform/modules-product/attendance/components/history` | Application | 4 | 39 | 0.91 |
| `apps/platform/modules/feedback/actions` | Application | 1 | 8 | 0.89 |
| `apps/platform/modules/billing/adapters` | Application | 4 | 24 | 0.86 |
| `apps/platform/components/base-ui/sidebar` | Application | 1 | 6 | 0.86 |
| `apps/platform/modules-product/secrets/services` | Application | 2 | 11 | 0.85 |
| `apps/platform/modules/commerce/domain` | Application | 14 | 74 | 0.84 |
| `apps/platform/modules/dashboard/db` | Application | 2 | 9 | 0.82 |
| `apps/platform/modules/audit/actions` | Application | 2 | 9 | 0.82 |
| `apps/platform/modules/billing/context` | Application | 2 | 9 | 0.82 |
| `apps/platform/modules/organizations/domain` | Application | 20 | 85 | 0.81 |
| `apps/platform/modules/billing/actions` | Application | 16 | 66 | 0.80 |
| `apps/platform/modules/support/actions` | Application | 18 | 74 | 0.80 |
| `apps/platform/modules-product/receipts/hooks` | Application | 21 | 85 | 0.80 |
| `apps/platform/modules-product/trabajo-domestico/domain/liquidaciones` | Application | 15 | 60 | 0.80 |
| `apps/platform/modules/layout/components` | Application | 1 | 4 | 0.80 |
| `apps/platform/modules/data-export/actions` | Application | 8 | 29 | 0.78 |
| `apps/platform/modules/audit/db` | Application | 2 | 7 | 0.78 |
| `apps/platform/modules/feedback/services` | Application | 2 | 7 | 0.78 |
| `apps/platform/modules/social/hooks` | Application | 13 | 45 | 0.78 |
| `apps/platform/modules/organizations/hooks` | Application | 17 | 56 | 0.77 |
| `apps/platform/modules-product/receipts/services` | Application | 36 | 117 | 0.76 |
| `apps/platform/modules/commerce/hooks` | Application | 8 | 25 | 0.76 |
| `apps/platform/modules/notifications/actions` | Application | 20 | 62 | 0.76 |
| `apps/platform/modules/notifications/components/shared` | Application | 8 | 24 | 0.75 |
| `apps/platform/modules-product/employer-profile/actions` | Application | 5 | 15 | 0.75 |
| `apps/platform/modules/feedback/hooks` | Application | 2 | 6 | 0.75 |
| `apps/platform/modules/commerce/actions` | Application | 21 | 62 | 0.75 |
| `packages/email/src/templates` | Application | 8 | 23 | 0.74 |
| `apps/platform/modules/referrals/domain` | Application | 8 | 23 | 0.74 |
| `apps/platform/modules/chat/db` | Application | 6 | 17 | 0.74 |
| `apps/platform/modules/data-export/hooks` | Application | 6 | 17 | 0.74 |
| `apps/platform/modules/layout` | Application | 3 | 8 | 0.73 |
| `apps/platform/modules/organizations/actions` | Application | 45 | 118 | 0.72 |
| `apps/platform/modules-product/bps-sync/services` | Application | 7 | 18 | 0.72 |
| `apps/platform/modules/billing/services` | Application | 24 | 61 | 0.72 |
| `apps/platform/modules/social/actions` | Application | 36 | 91 | 0.72 |
| `apps/platform/modules-product/employer-profile/hooks` | Application | 4 | 10 | 0.71 |
| `apps/platform/modules/feedback/db` | Application | 2 | 5 | 0.71 |
| `apps/platform/modules-product/home/actions` | Application | 2 | 5 | 0.71 |
| `apps/platform/modules-product/home/db` | Application | 2 | 5 | 0.71 |
| `apps/platform/modules/system-status/actions` | Application | 2 | 5 | 0.71 |
| `apps/platform/modules-product/attendance/actions` | Application | 19 | 46 | 0.71 |
| `apps/platform/modules/addresses/db` | Application | 6 | 14 | 0.70 |
| `packages/storage/src/server` | Application | 3 | 7 | 0.70 |
| `apps/platform/modules/billing` | Application | 3 | 7 | 0.70 |
| `apps/platform/modules/notifications/services` | Application | 8 | 18 | 0.69 |
| `apps/platform/modules-product/employee/actions` | Application | 20 | 41 | 0.67 |
| `apps/platform/modules/addresses/services` | Application | 8 | 16 | 0.67 |
| `apps/platform/modules/contact-methods/services` | Application | 8 | 16 | 0.67 |
| `apps/platform/modules/contact-methods/db` | Application | 7 | 14 | 0.67 |
| `apps/platform/modules/chat/actions` | Application | 6 | 12 | 0.67 |
| `apps/platform/modules-product/bps-sync/actions` | Application | 4 | 8 | 0.67 |
| `apps/platform/modules/system-events/db` | Application | 2 | 4 | 0.67 |
| `apps/platform/lib/product` | Application | 2 | 4 | 0.67 |
| `apps/platform/modules/social/domain` | Intermediate | 29 | 56 | 0.66 |
| `apps/platform/modules/billing/hooks` | Intermediate | 10 | 19 | 0.66 |
| `apps/platform/modules/notifications/db` | Intermediate | 36 | 68 | 0.65 |
| `apps/platform/modules/referrals/services` | Intermediate | 8 | 15 | 0.65 |
| `apps/platform/modules-product/employee/services` | Intermediate | 17 | 30 | 0.64 |
| `apps/platform/modules-product/attendance/components/history/shared` | Intermediate | 4 | 7 | 0.64 |
| `apps/platform/modules/billing/db` | Intermediate | 36 | 62 | 0.63 |
| `apps/platform/modules/support/hooks` | Intermediate | 18 | 31 | 0.63 |
| `apps/platform/modules/support/services` | Intermediate | 10 | 16 | 0.62 |
| `apps/platform/modules-product/receipt-gen-settings/actions` | Intermediate | 5 | 8 | 0.62 |
| `apps/platform/modules-product/receipts/actions` | Intermediate | 35 | 54 | 0.61 |
| `apps/platform/modules/support/db` | Intermediate | 18 | 27 | 0.60 |
| `apps/platform/modules/account/db` | Intermediate | 16 | 24 | 0.60 |
| `apps/platform/modules/data-export/services` | Intermediate | 6 | 9 | 0.60 |
| `apps/platform/modules-product/receipt-gen-settings/services` | Intermediate | 6 | 9 | 0.60 |
| `packages/storage/src/adapters` | Intermediate | 4 | 6 | 0.60 |
| `apps/platform/modules-product/bps-sync/hooks` | Intermediate | 4 | 6 | 0.60 |
| `apps/platform/modules/notifications/channels` | Intermediate | 4 | 6 | 0.60 |
| `apps/platform/modules-product/home` | Intermediate | 2 | 3 | 0.60 |
| `apps/platform/modules-product/home/hooks` | Intermediate | 2 | 3 | 0.60 |
| `apps/platform/modules/audit/lib` | Intermediate | 2 | 3 | 0.60 |
| `apps/platform/modules/audit/hooks` | Intermediate | 2 | 3 | 0.60 |
| `apps/platform/modules/system-status/hooks` | Intermediate | 2 | 3 | 0.60 |
| `apps/public/modules/consent/hooks` | Intermediate | 2 | 3 | 0.60 |
| `apps/platform/modules/referrals/db` | Intermediate | 21 | 31 | 0.60 |
| `apps/platform/modules/data-export/db` | Intermediate | 9 | 13 | 0.59 |
| `apps/platform/modules/organizations/db` | Intermediate | 41 | 56 | 0.58 |
| `apps/platform/modules/social/services` | Intermediate | 14 | 19 | 0.58 |
| `apps/platform/modules-product/onboarding/hooks` | Intermediate | 3 | 4 | 0.57 |
| `apps/platform/modules-product/secrets/domain` | Intermediate | 3 | 4 | 0.57 |
| `apps/platform/modules/notifications/hooks` | Intermediate | 26 | 33 | 0.56 |
| `apps/platform/modules/account/hooks` | Intermediate | 19 | 24 | 0.56 |
| `apps/platform/modules/layout/components/shared` | Intermediate | 8 | 10 | 0.56 |
| `apps/platform/modules-product/secrets/db` | Intermediate | 4 | 5 | 0.56 |
| `apps/platform/modules/social/db` | Intermediate | 29 | 36 | 0.55 |
| `apps/platform/modules/feedback` | Intermediate | 5 | 6 | 0.55 |
| `apps/platform/modules/commerce/db` | Intermediate | 47 | 56 | 0.54 |
| `apps/platform/modules-product/bps-sync/db` | Intermediate | 14 | 16 | 0.53 |
| `apps/platform/modules-product/receipt-composer` | Intermediate | 21 | 23 | 0.52 |
| `apps/platform/modules/chat/hooks` | Intermediate | 6 | 6 | 0.50 |
| `apps/platform/modules-product/receipt-gen-settings/hooks` | Intermediate | 6 | 6 | 0.50 |
| `apps/platform/modules-product/home/components/employees` | Intermediate | 2 | 2 | 0.50 |
| `apps/platform/modules/background-ops/lib` | Intermediate | 1 | 1 | 0.50 |
| `apps/platform/modules/background-ops/registry` | Intermediate | 1 | 1 | 0.50 |
| `apps/platform/modules-product/attendance` | Intermediate | 22 | 21 | 0.49 |
| `apps/platform/modules/layout/components/banners` | Intermediate | 10 | 9 | 0.47 |
| `apps/platform/modules-product/employee/components/shared` | Intermediate | 18 | 15 | 0.45 |
| `apps/platform/modules/organizations/services` | Intermediate | 22 | 17 | 0.44 |
| `apps/platform/modules-product/attendance/db` | Intermediate | 22 | 17 | 0.44 |
| `apps/platform/modules/notifications` | Intermediate | 16 | 11 | 0.41 |
| `apps/platform/modules/social` | Intermediate | 41 | 28 | 0.41 |
| `apps/platform/modules-product/receipts/db` | Intermediate | 28 | 19 | 0.40 |
| `apps/platform/modules-product/attendance/hooks` | Intermediate | 37 | 25 | 0.40 |
| `apps/platform/modules/layout/hooks` | Intermediate | 6 | 4 | 0.40 |
| `apps/platform/modules-product/bps-sync/utils` | Intermediate | 3 | 2 | 0.40 |
| `apps/platform/modules-product/employee/db` | Intermediate | 34 | 21 | 0.38 |
| `apps/platform/modules/billing/lib` | Intermediate | 13 | 8 | 0.38 |
| `apps/platform/modules/notifications/lib` | Intermediate | 18 | 11 | 0.38 |
| `apps/platform/modules-product/trabajo-domestico` | Intermediate | 15 | 9 | 0.38 |
| `apps/platform/modules-product/trabajo-domestico/constants/versions` | Intermediate | 6 | 3 | 0.33 |
| `apps/platform/modules-product/bps-sync/browser` | Intermediate | 6 | 3 | 0.33 |
| `apps/mobile/modules/account/hooks` | Intermediate | 4 | 2 | 0.33 |
| `apps/platform/modules/audit/constants` | Intermediate | 4 | 2 | 0.33 |
| `apps/platform/modules-product/onboarding` | Intermediate | 2 | 1 | 0.33 |
| `apps/platform/modules-product/trabajo-domestico/scenarios/catalog/v1` | Intermediate | 2 | 1 | 0.33 |
| `packages/storage/src/client` | Intermediate | 2 | 1 | 0.33 |
| `apps/platform/modules/system-status/services` | Intermediate | 2 | 1 | 0.33 |
| `apps/platform/modules/system-status/constants` | Intermediate | 2 | 1 | 0.33 |
| `apps/platform/i18n` | Intermediate | 2 | 1 | 0.33 |
| `apps/public/modules/faq/constants` | Intermediate | 2 | 1 | 0.33 |
| `apps/public/modules/home/constants` | Intermediate | 2 | 1 | 0.33 |
| `apps/public/modules/testimonials/constants` | Intermediate | 2 | 1 | 0.33 |
| `apps/platform/modules-product/trabajo-domestico/scenarios` | Intermediate | 2 | 1 | 0.33 |
| `apps/platform/modules-product/receipt-gen-settings/db` | Foundation | 11 | 5 | 0.31 |
| `apps/platform/modules/organizations` | Foundation | 71 | 32 | 0.31 |
| `apps/platform/modules-product/trabajo-domestico/domain` | Foundation | 64 | 27 | 0.30 |
| `apps/platform/modules-product/employee/hooks` | Foundation | 66 | 27 | 0.29 |
| `apps/platform/modules-product/receipts/components/shared` | Foundation | 30 | 11 | 0.27 |
| `apps/platform/modules-product/receipt-composer/utils` | Foundation | 15 | 5 | 0.25 |
| `apps/platform/modules-product/employer-profile` | Foundation | 6 | 2 | 0.25 |
| `apps/public/modules/calculator/utils` | Foundation | 3 | 1 | 0.25 |
| `packages/storage/src` | Foundation | 3 | 1 | 0.25 |
| `apps/platform/modules/commerce` | Foundation | 52 | 16 | 0.24 |
| `apps/platform/modules-product/attendance/utils` | Foundation | 13 | 4 | 0.24 |
| `apps/platform/modules-product/receipts/types` | Foundation | 7 | 2 | 0.22 |
| `packages/ui/src/components` | Foundation | 861 | 240 | 0.22 |
| `apps/platform/modules-product/employer-profile/db` | Foundation | 23 | 6 | 0.21 |
| `apps/public/modules/how-it-works/constants` | Foundation | 4 | 1 | 0.20 |
| `packages/email/src` | Foundation | 34 | 8 | 0.19 |
| `apps/platform/modules-product/receipt-composer/types` | Foundation | 13 | 3 | 0.19 |
| `apps/platform/modules-product/receipts/utils` | Foundation | 14 | 3 | 0.18 |
| `apps/platform/modules-product/bps-sync` | Foundation | 19 | 4 | 0.17 |
| `apps/platform/modules-product/secrets/constants` | Foundation | 5 | 1 | 0.17 |
| `apps/platform/modules-product/receipts` | Foundation | 43 | 8 | 0.16 |
| `apps/platform/modules-product/trabajo-domestico/constants` | Foundation | 40 | 6 | 0.13 |
| `apps/platform/modules/system-events/templates` | Foundation | 14 | 2 | 0.13 |
| `apps/platform/modules-product/employee` | Foundation | 58 | 7 | 0.11 |
| `apps/platform/modules/layout/constants` | Foundation | 9 | 1 | 0.10 |
| `apps/platform/modules/addresses/constants` | Foundation | 19 | 2 | 0.10 |
| `packages/ui/src/components/brand` | Foundation | 20 | 2 | 0.09 |
| `apps/platform/modules/referrals/types` | Foundation | 10 | 1 | 0.09 |
| `apps/platform/modules/contact-methods/constants` | Foundation | 21 | 2 | 0.09 |
| `apps/platform/modules/feedback/constants` | Foundation | 13 | 1 | 0.07 |
| `apps/platform/modules/system-events/services` | Foundation | 14 | 1 | 0.07 |
| `apps/platform/modules/data-export/constants` | Foundation | 14 | 1 | 0.07 |
| `apps/platform/modules/billing/ports` | Foundation | 15 | 1 | 0.06 |
| `apps/platform/modules/notifications/constants` | Foundation | 50 | 3 | 0.06 |
| `apps/platform/modules/billing/domain` | Foundation | 17 | 1 | 0.06 |
| `apps/platform/modules/support/constants` | Foundation | 38 | 2 | 0.05 |
| `apps/platform/modules/support/types` | Foundation | 19 | 1 | 0.05 |
| `apps/platform/modules/referrals/constants` | Foundation | 20 | 1 | 0.05 |
| `apps/platform/modules/notifications/types` | Foundation | 22 | 1 | 0.04 |
| `apps/platform/modules/organizations/constants` | Foundation | 45 | 2 | 0.04 |
| `apps/platform/modules/commerce/constants` | Foundation | 28 | 1 | 0.03 |
| `apps/platform/modules-product/employee/types` | Foundation | 30 | 1 | 0.03 |
| `apps/platform/modules/account/constants` | Foundation | 33 | 1 | 0.03 |
| `apps/platform/modules/social/constants` | Foundation | 36 | 1 | 0.03 |
| `packages/auth/src` | Foundation | 520 | 12 | 0.02 |
| `apps/platform/modules/billing/constants` | Foundation | 45 | 1 | 0.02 |
| `packages/ui/src/lib` | Foundation | 449 | 0 | 0.00 |
| `packages/db/src` | Foundation | 531 | 0 | 0.00 |
| `packages/lib/utils` | Foundation | 289 | 0 | 0.00 |
| `packages/lib/api` | Foundation | 745 | 0 | 0.00 |
| `apps/platform/modules/account` | Foundation | 15 | 0 | 0.00 |
| `apps/platform/modules/support` | Foundation | 23 | 0 | 0.00 |
| `apps/public/modules/seo/constants` | Foundation | 11 | 0 | 0.00 |
| `packages/lib/formatters` | Foundation | 76 | 0 | 0.00 |
| `apps/public/modules/layout/constants` | Foundation | 10 | 0 | 0.00 |
| `apps/platform/modules-product/trabajo-domestico/types` | Foundation | 20 | 0 | 0.00 |
| `apps/platform/modules/addresses` | Foundation | 11 | 0 | 0.00 |
| `apps/mobile/modules/layout/constants` | Foundation | 8 | 0 | 0.00 |
| `apps/platform/modules/contact-methods` | Foundation | 10 | 0 | 0.00 |
| `apps/platform/modules/referrals` | Foundation | 9 | 0 | 0.00 |
| `apps/platform/modules-product/employee/constants` | Foundation | 7 | 0 | 0.00 |
| `packages/storage/src/ports` | Foundation | 10 | 0 | 0.00 |
| `apps/platform/modules/billing/types` | Foundation | 19 | 0 | 0.00 |
| `apps/platform/modules/commerce/lib` | Foundation | 9 | 0 | 0.00 |
| `apps/public/modules/pricing/types` | Foundation | 6 | 0 | 0.00 |
| `packages/lib/settings` | Foundation | 25 | 0 | 0.00 |
| `apps/platform/modules/addresses/domain` | Foundation | 4 | 0 | 0.00 |
| `apps/platform/modules/commerce/types` | Foundation | 7 | 0 | 0.00 |
| `apps/platform/modules/data-export` | Foundation | 4 | 0 | 0.00 |
| `apps/platform/modules-product/pdf-generator` | Foundation | 3 | 0 | 0.00 |
| `apps/platform/modules/account/types` | Foundation | 4 | 0 | 0.00 |
| `apps/platform/modules/addresses/types` | Foundation | 6 | 0 | 0.00 |
| `apps/platform/modules/chat` | Foundation | 3 | 0 | 0.00 |
| `apps/platform/modules/contact-methods/types` | Foundation | 8 | 0 | 0.00 |
| `apps/platform/modules/contact-methods/domain` | Foundation | 3 | 0 | 0.00 |
| `apps/platform/modules/data-export/types` | Foundation | 6 | 0 | 0.00 |
| `apps/platform/modules/layout/types` | Foundation | 10 | 0 | 0.00 |
| `apps/public/modules/features/constants` | Foundation | 3 | 0 | 0.00 |
| `apps/public/modules/problem-solution/constants` | Foundation | 3 | 0 | 0.00 |
| `apps/mobile/modules/account` | Foundation | 3 | 0 | 0.00 |
| `apps/platform/modules-product/attendance/types` | Foundation | 9 | 0 | 0.00 |
| `apps/platform/modules-product/employer-profile/data` | Foundation | 2 | 0 | 0.00 |
| `apps/platform/modules-product/home/types` | Foundation | 6 | 0 | 0.00 |
| `apps/platform/modules-product/secrets/types` | Foundation | 5 | 0 | 0.00 |
| `apps/platform/modules/audit` | Foundation | 2 | 0 | 0.00 |
| `apps/platform/modules/chat/constants` | Foundation | 2 | 0 | 0.00 |
| `apps/platform/modules/layout/lib` | Foundation | 4 | 0 | 0.00 |
| `apps/platform/modules/social/types` | Foundation | 6 | 0 | 0.00 |
| `apps/public/modules/about/constants` | Foundation | 2 | 0 | 0.00 |
| `apps/public/modules/blog/utils` | Foundation | 2 | 0 | 0.00 |
| `apps/public/modules/consent/constants` | Foundation | 2 | 0 | 0.00 |
| `apps/public/modules/contact/actions` | Foundation | 2 | 0 | 0.00 |
| `apps/public/modules/help/constants` | Foundation | 2 | 0 | 0.00 |
| `apps/public/i18n` | Foundation | 2 | 0 | 0.00 |
| `packages/ui/src/hooks` | Foundation | 2 | 0 | 0.00 |
| `apps/mobile/modules/account/types` | Foundation | 1 | 0 | 0.00 |
| `apps/platform/modules-product/employer-profile/types` | Foundation | 6 | 0 | 0.00 |
| `apps/platform/modules/audit/types` | Foundation | 5 | 0 | 0.00 |
| `apps/platform/modules/background-ops/types` | Foundation | 3 | 0 | 0.00 |
| `apps/platform/modules/commerce/adapters` | Foundation | 1 | 0 | 0.00 |
| `apps/platform/modules/dashboard/types` | Foundation | 2 | 0 | 0.00 |
| `apps/platform/modules/organizations/types` | Foundation | 4 | 0 | 0.00 |
| `apps/platform/modules/system-status/types` | Foundation | 3 | 0 | 0.00 |
| `apps/public/modules/calculator/types` | Foundation | 1 | 0 | 0.00 |
| `apps/public/modules/consent/types` | Foundation | 1 | 0 | 0.00 |
| `apps/public/modules/faq` | Foundation | 2 | 0 | 0.00 |
| `apps/public/modules/home` | Foundation | 1 | 0 | 0.00 |
| `apps/public/modules/how-it-works/types` | Foundation | 1 | 0 | 0.00 |
| `apps/public/modules/seo/types` | Foundation | 1 | 0 | 0.00 |
| `apps/public/modules/testimonials/types` | Foundation | 1 | 0 | 0.00 |

## Cross-module dependencies

Directed coupling between modules (how many edges cross from one into another).

| From | → | To | Edges |
|---|:-:|---|--:|
| `packages/ui/src/components` | → | `packages/ui/src/lib` | 238 |
| `apps/platform/modules/layout/components/sidebar` | → | `packages/ui/src/components` | 62 |
| `apps/platform/modules/commerce/db` | → | `packages/db/src` | 55 |
| `apps/platform/modules/organizations/db` | → | `packages/db/src` | 55 |
| `apps/platform/modules/billing/db` | → | `packages/db/src` | 53 |
| `apps/platform/modules/notifications/db` | → | `packages/db/src` | 53 |
| `apps/platform/modules-product/trabajo-domestico/domain/liquidaciones` | → | `apps/platform/modules-product/trabajo-domestico/domain` | 48 |
| `apps/platform/modules/organizations/domain` | → | `apps/platform/modules/organizations/db` | 41 |
| `apps/platform/components/base-ui/form-elements` | → | `packages/ui/src/components` | 39 |
| `apps/platform/modules/social/db` | → | `packages/db/src` | 35 |
| `apps/platform/modules-product/receipts/hooks` | → | `apps/platform/modules-product/receipts/actions` | 33 |
| `apps/platform/modules/account/actions` | → | `apps/platform/modules/account/constants` | 31 |
| `apps/platform/modules/organizations/domain` | → | `apps/platform/modules/organizations` | 31 |
| `apps/platform/modules/commerce/domain` | → | `apps/platform/modules/commerce/db` | 30 |
| `apps/platform/modules/organizations/actions` | → | `apps/platform/modules/organizations/constants` | 30 |

## Modules

- **apps/mobile/app** (2) — `RootLayout`, `Index`
- **apps/mobile/app/(app)** (5) — `SupportScreen`, `TicketCard`, `AppLayout`, `FeedbackScreen`, `SelectModal`
- **apps/mobile/app/(app)/(tabs)** (3) — `SettingsScreen`, `TabsLayout`, `HomeScreen`
- **apps/mobile/app/(app)/settings** (3) — `DangerZoneScreen`, `ExportDataScreen`, `ProfileScreen`
- **apps/mobile/app/(auth)** (2) — `AuthLayout`, `LoginScreen`
- **apps/mobile/components/layout** (10) — `ScrollScreen`, `SCREEN_HEADER_HEIGHT`, `ScreenHeader`, `ScrollFade`, `Screen`, `BackButton`, `ScreenProps`, `ScreenHeaderProps`
- **apps/mobile/components/ui** (18) — `Badge`, `BadgeProps`, `Button`, `ButtonProps`, `Card`, `CardProps`, `FormField`, `FormFieldProps`
- **apps/mobile/lib** (12) — `apiClient`, `request`, `{ signIn, signOut, useSession }`, `authClient`, `detectLocale`, `Colors`, `useColors`, `clearToken`
- **apps/mobile/mocks** (1) — `mockTickets`
- **apps/mobile/modules/account** (1) — `profileFormSchema`
- **apps/mobile/modules/account/components** (1) — `ProfileForm`
- **apps/mobile/modules/account/hooks** (3) — `accountKeys`, `useProfile`, `useUpdateProfile`
- **apps/mobile/modules/account/types** (1) — `AccountProfile`
- **apps/mobile/modules/auth/hooks** (1) — `useEmailSignIn`
- **apps/mobile/modules/layout/components** (7) — `AppDrawer`, `DrawerContent`, `NavGroup`, `NavGroup`, `AppDrawerProps`, `AppHeader`, `AppHeaderProps`
- **apps/mobile/modules/layout/constants** (4) — `MAIN_NAV_ITEMS`, `SECONDARY_NAV_ITEMS`, `SETTINGS_NAV_ITEMS`, `NavItem`
- **apps/mobile/modules/layout/context** (3) — `DrawerContextValue`, `DrawerProvider`, `useDrawer`
- **apps/mobile/modules/privacy/hooks** (7) — `useCancelAccountDeletion`, `useScheduleAccountDeletion`, `ExportRequest`, `useExportRequests`, `PrivacyProfile`, `usePrivacyProfile`, `useRequestExport`
- **apps/mobile/modules/support/hooks** (1) — `useTickets`
- **apps/mobile/modules/support/types** (1) — `Ticket`
- **apps/platform** (5) — `proxy`, `redirectToLogin`, `resolveCallbackUrl`, `register`, `config`
- **apps/platform/app** (4) — `OGImage`, `size`, `RootNotFound`, `contentType`
- **apps/platform/app/[locale]** (6) — `Error`, `LocaleLayout`, `metadata`, `NotFound`, `RootPage`, `generateStaticParams`
- **apps/platform/app/[locale]/(auth)** (1) — `AuthLayout`
- **apps/platform/app/[locale]/(auth)/early-access** (2) — `EarlyAccessPage`, `generateMetadata`
- **apps/platform/app/[locale]/(auth)/employee-invite/[token]** (6) — `EmployerInviteView`, `claimEmployeeInvitationAction`, `EmployeeInvitePage`, `AcceptInvitationForm`, `acceptInvitationAction`, `EmployerInviteViewProps`
- **apps/platform/app/[locale]/(auth)/employee-invite/[token]/register** (3) — `ClaimForm`, `EmployeeInviteRegisterPage`, `ClaimFormProps`
- **apps/platform/app/[locale]/(auth)/forgot-password** (2) — `ForgotPasswordPage`, `generateMetadata`
- **apps/platform/app/[locale]/(auth)/login** (2) — `generateMetadata`, `LoginPage`
- **apps/platform/app/[locale]/(auth)/post-login** (2) — `PostLoginPage`, `isSafeCallbackUrl`
- **apps/platform/app/[locale]/(auth)/register** (2) — `generateMetadata`, `RegisterPage`
- **apps/platform/app/[locale]/(auth)/reset-password** (2) — `generateMetadata`, `ResetPasswordPage`
- **apps/platform/app/[locale]/(checkout)** (1) — `CheckoutLayout`
- **apps/platform/app/[locale]/(checkout)/checkout** (6) — `CheckoutPage`, `resolveProvider`, `isBillingInterval`, `isPaymentProvider`, `CheckoutPageProps`, `generateMetadata`
- **apps/platform/app/[locale]/(checkout)/checkout/success** (3) — `CheckoutSuccessPage`, `CheckoutSuccessPageProps`, `generateMetadata`
- **apps/platform/app/[locale]/(checkout)/plans** (2) — `generateMetadata`, `PricingPage`
- **apps/platform/app/[locale]/(dashboard)** (1) — `DashboardLayout`
- **apps/platform/app/[locale]/(dashboard)/admin/support** (4) — `AdminSupportLayout`, `AdminSupportPage`, `generateMetadata`, `Props`
- **apps/platform/app/[locale]/(dashboard)/admin/support/[id]** (3) — `AdminSupportTicketPage`, `generateMetadata`, `Props`
- **apps/platform/app/[locale]/(dashboard)/notifications** (3) — `generateMetadata`, `NotificationsPage`, `NotificationsPageProps`
- **apps/platform/app/[locale]/(dashboard)/notifications/[id]** (3) — `generateMetadata`, `NotificationDetailPage`, `NotificationDetailPageProps`
- **apps/platform/app/[locale]/(dashboard)/settings** (2) — `SettingsLayout`, `SettingsPage`
- **apps/platform/app/[locale]/(dashboard)/settings/account** (2) — `generateMetadata`, `SettingsAccountPage`
- **apps/platform/app/[locale]/(dashboard)/settings/addresses** (2) — `generateMetadata`, `SettingsAddressesPage`
- **apps/platform/app/[locale]/(dashboard)/settings/billing** (2) — `generateMetadata`, `SettingsBillingPage`
- **apps/platform/app/[locale]/(dashboard)/settings/bps** (2) — `generateMetadata`, `SettingsBpsPage`
- **apps/platform/app/[locale]/(dashboard)/settings/contact-methods** (2) — `generateMetadata`, `SettingsContactMethodsPage`
- **apps/platform/app/[locale]/(dashboard)/settings/employer-profile** (2) — `generateMetadata`, `SettingsEmployerProfilePage`
- **apps/platform/app/[locale]/(dashboard)/settings/notifications** (2) — `generateMetadata`, `SettingsNotificationsPage`
- **apps/platform/app/[locale]/(dashboard)/settings/privacy** (2) — `generateMetadata`, `SettingsPrivacyPage`
- **apps/platform/app/[locale]/(dashboard)/settings/profile** (2) — `generateMetadata`, `SettingsProfilePage`
- **apps/platform/app/[locale]/(dashboard)/settings/receipts** (2) — `generateMetadata`, `SettingsReceiptsPage`
- **apps/platform/app/[locale]/(dashboard)/settings/security** (2) — `generateMetadata`, `SettingsSecurityPage`
- **apps/platform/app/[locale]/(dashboard)/support** (3) — `SupportLayout`, `generateMetadata`, `SupportPage`
- **apps/platform/app/[locale]/(dashboard)/support/[id]** (3) — `SupportTicketPage`, `generateMetadata`, `Props`
- **apps/platform/app/[locale]/(dashboard)/support/chat** (2) — `SupportChatPage`, `generateMetadata`
- **apps/platform/app/[locale]/(dashboard)/support/new** (2) — `generateMetadata`, `NewSupportTicketPage`
- **apps/platform/app/[locale]/(product)/(employee)** (1) — `EmployeeLayout`
- **apps/platform/app/[locale]/(product)/(employee)/employee/home** (1) — `EmployeeHomePage`
- **apps/platform/app/[locale]/(product)/(employer)** (1) — `EmployerLayout`
- **apps/platform/app/[locale]/(product)/(employer)/attendance** (2) — `AttendancePage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/attendance/[workplaceId]** (3) — `WorkplaceDetailLayout`, `generateMetadata`, `WorkplaceQrPage`
- **apps/platform/app/[locale]/(product)/(employer)/attendance/[workplaceId]/history** (2) — `generateMetadata`, `WorkplaceHistoryPage`
- **apps/platform/app/[locale]/(product)/(employer)/attendance/[workplaceId]/settings** (2) — `generateMetadata`, `WorkplaceSettingsPage`
- **apps/platform/app/[locale]/(product)/(employer)/attendance/new** (2) — `generateMetadata`, `NewWorkplacePage`
- **apps/platform/app/[locale]/(product)/(employer)/employees** (2) — `EmployeesPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]** (4) — `EmployeeDetailLayout`, `EmployeePersonalDataPage`, `generateMetadata`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]/agreements** (2) — `EmployeeAgreementsPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]/bank-accounts** (2) — `EmployeeBankAccountsPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]/bps** (2) — `EmployeeBpsPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]/contract** (2) — `EmployeeContractPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]/salary-updates** (2) — `EmployeeSalaryUpdatesPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]/schedule** (2) — `EmployeeSchedulePage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/[id]/settings** (2) — `EmployeeSettingsPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/employees/new** (2) — `generateMetadata`, `NewEmployeePage`
- **apps/platform/app/[locale]/(product)/(employer)/home** (1) — `EmployerHomePage`
- **apps/platform/app/[locale]/(product)/(employer)/receipts** (2) — `generateMetadata`, `ReceiptsPage`
- **apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/aguinaldo** (2) — `AguinaldoReceiptPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/dismissal** (2) — `DismissalReceiptPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/resignation** (2) — `RenunciaReceiptPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/salary** (2) — `EmployeeSalaryPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(employer)/receipts/employee/[id]/vacation** (2) — `VacationReceiptPage`, `generateMetadata`
- **apps/platform/app/[locale]/(product)/(onboarding)** (1) — `OnboardingLayout`
- **apps/platform/app/[locale]/(product)/(onboarding)/onboarding** (2) — `generateMetadata`, `OnboardingPage`
- **apps/platform/app/[locale]/(public-product)** (1) — `PublicProductLayout`
- **apps/platform/app/[locale]/(public-product)/checkin/[token]** (3) — `CheckinTokenLayout`, `CheckinPage`, `generateMetadata`
- **apps/platform/app/[locale]/(public-product)/checkin/[token]/success** (1) — `CheckinSuccessPage`
- **apps/platform/app/[locale]/[...rest]** (1) — `CatchAllPage`
- **apps/platform/app/api/(product)/attendance/breakdown** (1) — `GET`
- **apps/platform/app/api/(product)/attendance/checkin** (1) — `POST`
- **apps/platform/app/api/(product)/attendance/checkin-receipt** (1) — `GET`
- **apps/platform/app/api/(product)/attendance/checkin-state** (1) — `GET`
- **apps/platform/app/api/(product)/attendance/events** (1) — `GET`
- **apps/platform/app/api/(product)/attendance/qr** (2) — `DELETE`, `POST`
- **apps/platform/app/api/(product)/attendance/records** (2) — `DELETE`, `PATCH`
- **apps/platform/app/api/(product)/attendance/workplaces** (3) — `DELETE`, `POST`, `GET`
- **apps/platform/app/api/(product)/attendance/workplaces/[id]** (1) — `GET`
- **apps/platform/app/api/(product)/employees** (3) — `POST`, `GET`, `getContext`
- **apps/platform/app/api/(product)/employees/[id]** (4) — `PUT`, `DELETE`, `GET`, `getContext`
- **apps/platform/app/api/(product)/employees/[id]/bank-accounts** (2) — `POST`, `getContext`
- **apps/platform/app/api/(product)/employees/[id]/bank-accounts/[bankAccountId]** (3) — `PATCH`, `DELETE`, `getContext`
- **apps/platform/app/api/(product)/employees/[id]/bank-accounts/[bankAccountId]/default** (2) — `POST`, `getContext`
- **apps/platform/app/api/(product)/employees/[id]/history** (1) — `GET`
- **apps/platform/app/api/(product)/employees/[id]/recargo-config** (2) — `PATCH`, `getContext`
- **apps/platform/app/api/(product)/employees/[id]/receipts** (1) — `GET`
- **apps/platform/app/api/(product)/employees/[id]/soft-delete** (2) — `POST`, `getContext`
- **apps/platform/app/api/(product)/employees/[id]/suspend** (2) — `POST`, `getContext`
- **apps/platform/app/api/(product)/employer-profiles** (3) — `PUT`, `GET`, `POST`
- **apps/platform/app/api/(product)/home** (1) — `GET`
- **apps/platform/app/api/(product)/receipt-gen-settings** (3) — `PATCH`, `GET`, `resolveCtx`
- **apps/platform/app/api/(product)/receipts** (1) — `GET`
- **apps/platform/app/api/(product)/receipts/[id]** (3) — `DELETE`, `GET`, `PATCH`
- **apps/platform/app/api/(product)/receipts/[id]/pdf** (1) — `GET`
- **apps/platform/app/api/(product)/receipts/check** (1) — `POST`
- **apps/platform/app/api/(product)/receipts/generate** (2) — `POST`, `parseDatesInInput`
- **apps/platform/app/api/(product)/receipts/leave-balance** (1) — `GET`
- **apps/platform/app/api/(product)/receipts/preview** (2) — `POST`, `parseDatesInInput`
- **apps/platform/app/api/account/activity** (1) — `GET`
- **apps/platform/app/api/account/avatar** (1) — `POST`
- **apps/platform/app/api/account/connections** (2) — `DELETE`, `GET`
- **apps/platform/app/api/account/deletion** (2) — `DELETE`, `POST`
- **apps/platform/app/api/account/email** (1) — `POST`
- **apps/platform/app/api/account/email/verify** (1) — `POST`
- **apps/platform/app/api/account/password** (2) — `POST`, `PUT`
- **apps/platform/app/api/account/profile** (2) — `PATCH`, `GET`
- **apps/platform/app/api/account/sessions** (2) — `DELETE`, `GET`
- **apps/platform/app/api/account/sessions/other** (1) — `DELETE`
- **apps/platform/app/api/addresses** (2) — `GET`, `POST`
- **apps/platform/app/api/addresses/[id]** (3) — `DELETE`, `PATCH`, `buildAuditContext`
- **apps/platform/app/api/admin/support/tickets** (1) — `GET`
- **apps/platform/app/api/admin/support/tickets/[id]** (1) — `GET`
- **apps/platform/app/api/admin/support/tickets/[id]/reply** (1) — `POST`
- **apps/platform/app/api/admin/support/tickets/[id]/status** (1) — `PATCH`
- **apps/platform/app/api/audit** (1) — `GET`
- **apps/platform/app/api/auth/[...all]** (1) — `{ GET, POST }`
- **apps/platform/app/api/auth/logout** (1) — `POST`
- **apps/platform/app/api/auth/request-password-reset** (1) — `POST`
- **apps/platform/app/api/auth/reset-password** (1) — `POST`
- **apps/platform/app/api/auth/session** (1) — `GET`
- **apps/platform/app/api/billing/access** (1) — `GET`
- **apps/platform/app/api/billing/cancel** (1) — `POST`
- **apps/platform/app/api/billing/checkout** (1) — `POST`
- **apps/platform/app/api/billing/downgrade** (1) — `POST`
- **apps/platform/app/api/billing/overview** (1) — `GET`
- **apps/platform/app/api/billing/plans** (1) — `GET`
- **apps/platform/app/api/billing/portal** (1) — `POST`
- **apps/platform/app/api/billing/providers** (1) — `GET`
- **apps/platform/app/api/billing/resume** (1) — `POST`
- **apps/platform/app/api/billing/subscription** (1) — `GET`
- **apps/platform/app/api/chat/conversations** (2) — `POST`, `GET`
- **apps/platform/app/api/chat/conversations/[id]** (1) — `GET`
- **apps/platform/app/api/chat/conversations/[id]/messages** (1) — `POST`
- **apps/platform/app/api/chat/message** (2) — `POST`, `withRetry`
- **apps/platform/app/api/commerce** (2) — `GET`, `POST`
- **apps/platform/app/api/commerce/checkout** (1) — `POST`
- **apps/platform/app/api/commerce/offerings** (2) — `GET`, `POST`
- **apps/platform/app/api/commerce/offerings/prices** (2) — `GET`, `POST`
- **apps/platform/app/api/contact-methods** (3) — `POST`, `GET`, `buildAuditContext`
- **apps/platform/app/api/contact-methods/[id]** (3) — `PATCH`, `DELETE`, `buildAuditContext`
- **apps/platform/app/api/dashboard** (1) — `GET`
- **apps/platform/app/api/data-export** (2) — `GET`, `POST`
- **apps/platform/app/api/data-export/[id]** (1) — `DELETE`
- **apps/platform/app/api/data-export/[id]/download** (1) — `GET`
- **apps/platform/app/api/feedback** (1) — `POST`
- **apps/platform/app/api/inngest** (1) — `{ GET, POST, PUT }`
- **apps/platform/app/api/notifications** (1) — `GET`
- **apps/platform/app/api/notifications/[id]** (1) — `GET`
- **apps/platform/app/api/notifications/archive** (1) — `PATCH`
- **apps/platform/app/api/notifications/delete** (1) — `PATCH`
- **apps/platform/app/api/notifications/preferences** (2) — `PATCH`, `GET`
- **apps/platform/app/api/notifications/read** (1) — `PATCH`
- **apps/platform/app/api/notifications/read-all** (1) — `PATCH`
- **apps/platform/app/api/notifications/unread** (1) — `PATCH`
- **apps/platform/app/api/organizations** (2) — `POST`, `GET`
- **apps/platform/app/api/organizations/[id]** (4) — `DELETE`, `PATCH`, `GET`, `buildAuditContext`
- **apps/platform/app/api/organizations/[id]/invitations** (1) — `GET`
- **apps/platform/app/api/organizations/[id]/invitations/[invitationId]** (1) — `DELETE`
- **apps/platform/app/api/organizations/[id]/members** (1) — `GET`
- **apps/platform/app/api/organizations/[id]/members/[memberId]** (3) — `DELETE`, `PATCH`, `buildAuditContext`
- **apps/platform/app/api/organizations/[id]/members/me** (1) — `DELETE`
- **apps/platform/app/api/organizations/[id]/transfer-ownership** (1) — `POST`
- **apps/platform/app/api/organizations/invitations/accept** (1) — `POST`
- **apps/platform/app/api/organizations/invitations/decline** (1) — `POST`
- **apps/platform/app/api/organizations/members** (1) — `POST`
- **apps/platform/app/api/referrals** (1) — `GET`
- **apps/platform/app/api/referrals/claim** (1) — `POST`
- **apps/platform/app/api/referrals/code** (1) — `GET`
- **apps/platform/app/api/referrals/invites** (3) — `POST`, `GET`, `buildAuditContext`
- **apps/platform/app/api/referrals/invites/[id]** (1) — `DELETE`
- **apps/platform/app/api/social/blocks** (4) — `DELETE`, `POST`, `GET`, `buildAuditContext`
- **apps/platform/app/api/social/follow-requests** (1) — `GET`
- **apps/platform/app/api/social/follow-requests/[requesterId]** (1) — `DELETE`
- **apps/platform/app/api/social/follow-requests/[requesterId]/accept** (1) — `POST`
- **apps/platform/app/api/social/follow-requests/[requesterId]/reject** (1) — `POST`
- **apps/platform/app/api/social/follow-status** (1) — `GET`
- **apps/platform/app/api/social/followers** (1) — `GET`
- **apps/platform/app/api/social/following** (1) — `GET`
- **apps/platform/app/api/social/follows** (3) — `DELETE`, `POST`, `buildAuditContext`
- **apps/platform/app/api/storage/upload** (1) — `POST`
- **apps/platform/app/api/support** (1) — `POST`
- **apps/platform/app/api/support/tickets** (1) — `GET`
- **apps/platform/app/api/support/tickets/[id]** (1) — `GET`
- **apps/platform/app/api/support/tickets/[id]/messages** (1) — `POST`
- **apps/platform/app/api/support/tickets/[id]/rate** (1) — `PATCH`
- **apps/platform/app/api/system-status** (1) — `GET`
- **apps/platform/app/api/webhooks/commerce/stripe** (1) — `POST`
- **apps/platform/app/api/webhooks/mercadopago** (4) — `POST`, `normalizeMpNotification`, `mpClient`, `verifyMpSignature`
- **apps/platform/app/api/webhooks/resend** (1) — `POST`
- **apps/platform/app/api/webhooks/stripe** (3) — `POST`, `normalizeStripeEvent`, `stripeClient`
- **apps/platform/components** (1) — `Providers`
- **apps/platform/components/base-ui** (5) — `AlertItem`, `FieldTooltip`, `AlertItemProps`, `DateSeparator`, `DateSeparatorProps`
- **apps/platform/components/base-ui/confirm-dialog** (2) — `ConfirmDialog`, `ConfirmDialogProps`
- **apps/platform/components/base-ui/data-table** (2) — `DataTable`, `DataTableProps`
- **apps/platform/components/base-ui/empty-state** (6) — `EmptyState`, `EMPTY_STATE_CONFIGS`, `BASE_EMPTY_STATE_CONFIGS`, `EmptyStateAction`, `EmptyStateConfig`, `EmptyStateProps`
- **apps/platform/components/base-ui/form-elements** (30) — `FieldDescription`, `FormLabel`, `FieldError`, `SelectField`, `DateField`, `InputGroupField`, `MaskedGroupField`, `MonthField`
- **apps/platform/components/base-ui/info-item** (2) — `InfoItem`, `InfoItemProps`
- **apps/platform/components/base-ui/meta-item** (2) — `MetaItem`, `MetaItemProps`
- **apps/platform/components/base-ui/modal** (2) — `Modal`, `ModalProps`
- **apps/platform/components/base-ui/page** (3) — `Header`, `Subheader`, `Wrapper`
- **apps/platform/components/base-ui/section-layout** (10) — `SectionHeader`, `SectionSubheader`, `SubmitButton`, `CollapsibleContent`, `CollapsibleTrigger`, `isReactNode`, `Collapsible`, `Section`
- **apps/platform/components/base-ui/sidebar** (2) — `Item`, `Group`
- **apps/platform/components/base-ui/skeletons** (28) — `SkeletonText`, `SkeletonTextBaseComponent`, `SkeletonMetaItem`, `SkeletonButton`, `SkeletonInfoItem`, `SkeletonAvatar`, `SkeletonBlock`, `SkeletonDot`
- **apps/platform/db** (45) — `employerProfiles`, `employees`, `receipts`, `attendanceEvents`, `employerProfilesRelations`, `employeeConditions`, `employeesRelations`, `main`
- **apps/platform/i18n** (15) — `loadAllModuleMessages`, `deepMerge`, `loadMessagesFromRoot`, `routing`, `featureMessages`, `isPlainObject`, `readJsonFile`, `resolveCoreModulesRoot`
- **apps/platform/lib** (25) — `storage`, `resolveAuthCallbackUrl`, `APP_RUNTIME_CONFIG`, `ENABLED_SETTINGS_SECTIONS`, `FEATURE_FLAGS`, `isFeatureEnabled`, `DEFAULT_AUTH_CALLBACK_URL`, `resolveCallbackUrl`
- **apps/platform/lib/encaja** (3) — `useEnCajaFormatter`, `ENCAJA_CONFIG`, `formatDocument`
- **apps/platform/lib/product** (6) — `PRODUCT_STORAGE_ROUTES`, `PRODUCT_APP_RUNTIME_CONFIG`, `PRODUCT_FEATURE_FLAGS`, `BpsSyncRunRequestedEvent`, `ReceiptsAguinaldoGenerationRequestedEvent`, `ReceiptsGenerationRequestedEvent`
- **apps/platform/modules-product** (1) — `SETTINGS_DEFAULT_PATH`
- **apps/platform/modules-product/attendance** (20) — `registerAttendanceService`, `getCheckinStateService`, `workplaceIdParamSchema`, `getBreakdownForPeriod`, `regenerateQrTokenService`, `getCheckinReceiptService`, `determineAttendanceStatus`, `generateQrToken`
- **apps/platform/modules-product/attendance/actions** (16) — `createWorkplaceAction`, `getMyEmployerId`, `deactivateQrTokenAction`, `deleteAttendanceRecordAction`, `generateNewQrTokenAction`, `getIp`, `updateAttendanceRecordAction`, `deleteWorkplaceAction`
- **apps/platform/modules-product/attendance/components/checkin** (5) — `CheckinFlow`, `CheckinSuccess`, `Row`, `EmployeeSelector`, `EmployeeSelectorProps`
- **apps/platform/modules-product/attendance/components/history** (10) — `EditAttendanceModal`, `ActionsCell`, `useAttendanceColumns`, `AttendanceWorkplaceHistory`, `AttendanceGlobalHistory`, `StatusCell`, `DurationCell`, `EmployeeCell`
- **apps/platform/modules-product/attendance/components/history/shared** (2) — `AttendanceHistoryTable`, `AttendanceHistoryTableProps`
- **apps/platform/modules-product/attendance/components/qr** (9) — `QrDisplay`, `QrContent`, `QrActions`, `ClientQRCode`, `QrCodeSection`, `QrActionsProps`, `QrCodeSectionProps`, `QrContentProps`
- **apps/platform/modules-product/attendance/components/workplace** (1) — `CreateWorkplaceForm`
- **apps/platform/modules-product/attendance/components/workplace/layout** (4) — `SettingsSection`, `WorkplaceHeader`, `WorkplaceNav`, `WorkplaceNavProps`
- **apps/platform/modules-product/attendance/components/workplace/list** (5) — `WorkplacesContent`, `WorkplaceRow`, `WorkplacesList`, `WorkplaceRowSkeleton`, `WorkplaceRowProps`
- **apps/platform/modules-product/attendance/db** (15) — `getWorkplaceByToken`, `getWorkplaceById`, `listAttendanceEvents`, `num`, `getWorkplaces`, `listTodayAttendanceEvents`, `updateWorkplaceQrToken`, `createWorkplace`
- **apps/platform/modules-product/attendance/hooks** (18) — `ATTENDANCE_KEYS`, `useWorkplace`, `useAttendanceFormatter`, `useAttendanceHistory`, `useDeleteAttendanceRecord`, `useRegisterAttendance`, `useUpdateAttendanceRecord`, `useWorkplaceHistory`
- **apps/platform/modules-product/attendance/types** (3) — `AttendanceEvent`, `AttendanceRecord`, `UpdateAttendanceRecordInput`
- **apps/platform/modules-product/attendance/utils** (14) — `computeAttendanceBreakdown`, `mergeRows`, `nightHoursInRange`, `scheduledHoursForDay`, `getExpectedEmployeeForEvent`, `groupAttendanceEvents`, `printQrCode`, `overlapMs`
- **apps/platform/modules-product/audit** (1) — `createProductAuditLog`
- **apps/platform/modules-product/auth** (12) — `getUserRole`, `getActiveRoleAction`, `validateAccess`, `useActiveRole`, `resolveProductPostLoginRedirect`, `RoleGuard`, `PRODUCT_GUEST_ONLY_PATHS`, `PRODUCT_PROTECTED_PREFIXES`
- **apps/platform/modules-product/background-ops/jobs** (1) — `PRODUCT_INNGEST_JOBS`
- **apps/platform/modules-product/billing** (3) — `PlansPageShell`, `SuccessPageShell`, `SuccessPageShellProps`
- **apps/platform/modules-product/bps-sync** (12) — `log`, `BPS_SYNC_TIMEZONE`, `BPS_MONTHLY_CRON`, `BPS_NOTIFICATION_TYPE_FAILED`, `BPS_NOTIFICATION_TYPE_SUCCESS`, `bpsCredentialsSchema`, `BpsExecutorInput`, `BpsExecutorResult`
- **apps/platform/modules-product/bps-sync/actions** (4) — `resolveCtx`, `saveBpsCredentialsAction`, `getBpsSettingsAction`, `revokeBpsCredentialsAction`
- **apps/platform/modules-product/bps-sync/browser** (6) — `executeBpsSyncInBrowser`, `createBpsSession`, `waitForSpinners`, `BpsEmployer`, `BpsSession`, `BpsSessionOptions`
- **apps/platform/modules-product/bps-sync/browser/actions** (8) — `BajaInput`, `BajaResult`, `runBaja`, `ModificarInput`, `ModificarResult`, `runModificar`, `PresentismoResult`, `runPresentismo`
- **apps/platform/modules-product/bps-sync/components** (1) — `BpsSettingsForm`
- **apps/platform/modules-product/bps-sync/db** (10) — `listEligibleEmployersForBpsSync`, `getBpsAutomationConfigForEmployer`, `createBpsSyncRunIfMissing`, `deleteBpsAutomationConfig`, `getBpsCredentialRefForEmployer`, `getBpsSyncRunExecutionContext`, `markBpsSyncRunCompleted`, `markBpsSyncRunFailed`
- **apps/platform/modules-product/bps-sync/hooks** (4) — `BPS_SETTINGS_KEYS`, `useBpsSettings`, `useRevokeBpsCredentials`, `useSaveBpsCredentials`
- **apps/platform/modules-product/bps-sync/jobs** (3) — `processBpsSyncRun`, `runMonthlyBpsSyncScheduler`, `BPS_SYNC_INNGEST_JOBS`
- **apps/platform/modules-product/bps-sync/scripts** (3) — `main`, `main`, `resolveCredentials`
- **apps/platform/modules-product/bps-sync/services** (5) — `queueMonthlyBpsSyncRuns`, `revokeBpsCredentials`, `saveBpsCredentials`, `isLastDayOfMonthInMontevideo`, `getBpsSettings`
- **apps/platform/modules-product/bps-sync/utils** (3) — `getDatePartsForTimezone`, `getDayOfMonthForTimezone`, `getYyyymmForTimezone`
- **apps/platform/modules-product/chat** (6) — `buildChatContext`, `ASSISTANT_AVATAR_URL`, `ASSISTANT_NAME`, `CHAT_SUGGESTIONS`, `TOOL_LABELS`, `buildChatTools`
- **apps/platform/modules-product/employee** (22) — `toWorkerData`, `toSituacionFamiliar`, `addBankAccountSchema`, `createEmployeeSchema`, `createEmployeeFormSchema`, `updateBpsDataFormSchema`, `updateContractDataFormSchema`, `updateEmployeeSchema`
- **apps/platform/modules-product/employee-invitation/db** (3) — `acceptEmployeeInvitation`, `getInvitationByToken`, `getInvitationByEmployeeId`
- **apps/platform/modules-product/employee/actions** (20) — `updateEmployeeActionBase`, `getContext`, `createBankAccountAction`, `updateBankAccountAction`, `createEmployeeAction`, `updateRecargoConfigAction`, `deleteBankAccountAction`, `getIp`
- **apps/platform/modules-product/employee/components/bank-accounts** (6) — `BankAccountCard`, `AddBankAccountForm`, `EditBankAccountForm`, `BankAccountsList`, `getBankLabel`, `EditBankAccountFormProps`
- **apps/platform/modules-product/employee/components/create-employee** (2) — `CreateEmployeeForm`, `isBeforeCurrentMonth`
- **apps/platform/modules-product/employee/components/layout** (4) — `EmployeeLayoutHeader`, `Props`, `EmployeeNav`, `EmployeeNavProps`
- **apps/platform/modules-product/employee/components/list** (1) — `EmployeesList`
- **apps/platform/modules-product/employee/components/profile** (23) — `RecargoForm`, `ContractForm`, `ScheduleForm`, `BpsForm`, `InvitationLinkClient`, `ContactForm`, `PersonalForm`, `DailyScheduleRow`
- **apps/platform/modules-product/employee/components/salary-updates** (7) — `SalaryUpdateSimulator`, `SalaryUpdatesView`, `ContractHistoryTable`, `Props`, `ProjectionBaseInput`, `Props`, `Props`
- **apps/platform/modules-product/employee/components/settings** (2) — `EmployeeSettingsView`, `EmployeeSettingsViewProps`
- **apps/platform/modules-product/employee/components/shared** (8) — `EmployeeCard`, `HistoryTable`, `UpdateOptionsField`, `EmployeeCardSkeleton`, `EffectiveDateCell`, `EmployeeCardProps`, `Props`, `Props`
- **apps/platform/modules-product/employee/constants** (2) — `BANK_GROUPS`, `BANK_OPTIONS`
- **apps/platform/modules-product/employee/db** (23) — `getEmployeeById`, `mapEmployee`, `listEmployeesByEmployer`, `createEmployee`, `getEmployeeConditionsHistory`, `mapContract`, `num`, `updateEmployee`
- **apps/platform/modules-product/employee/hooks** (22) — `useEmployee`, `EMPLOYEE_KEYS`, `useDayScheduleCalculations`, `useUpdateEmployeeBase`, `useUpdateContract`, `useUpdatePersonal`, `useBankAccountsQuery`, `useCreateBankAccount`
- **apps/platform/modules-product/employee/services** (18) — `getEmployerOrThrow`, `requireEmployeeOwnership`, `createBankAccountService`, `deactivateEmployeeService`, `getEmployeeConditionsHistoryService`, `softDeleteEmployeeService`, `suspendEmployeeService`, `updateEmployeeService`
- **apps/platform/modules-product/employee/types** (1) — `PAYMENT_METHOD_LABELS`
- **apps/platform/modules-product/employer-profile** (1) — `employerProfileSchema`
- **apps/platform/modules-product/employer-profile/actions** (3) — `createEmployerProfileAction`, `updateEmployerProfileAction`, `getMyEmployerProfileAction`
- **apps/platform/modules-product/employer-profile/components** (5) — `ContactSection`, `Form`, `RegistrationSection`, `Props`, `Props`
- **apps/platform/modules-product/employer-profile/data** (1) — `URUGUAY_DEPARTMENTS`
- **apps/platform/modules-product/employer-profile/db** (5) — `getEmployerByUserId`, `getEmployerById`, `mapRow`, `createEmployer`, `updateEmployer`
- **apps/platform/modules-product/employer-profile/hooks** (5) — `useEmployerProfileForm`, `EMPLOYER_PROFILE_KEYS`, `useCreateEmployerProfile`, `useEmployerProfile`, `useUpdateEmployerProfile`
- **apps/platform/modules-product/empty-state** (1) — `PRODUCT_EMPTY_STATE_CONFIGS`
- **apps/platform/modules-product/home** (2) — `getHomeDashboardPayload`, `resolveViewerName`
- **apps/platform/modules-product/home/actions** (1) — `getHomeDashboardStatsAction`
- **apps/platform/modules-product/home/components** (11) — `HomeView`, `RecentReceipts`, `QuickActionCard`, `QuickActions`, `RecentReceiptsSkeleton`, `PendingReceiptsAlert`, `PendingReceiptsAlertProps`, `AccentStyle`
- **apps/platform/modules-product/home/components/employees** (4) — `EmployeesSection`, `EmployeeCard`, `EmployeeCardProps`, `EmployeesSectionProps`
- **apps/platform/modules-product/home/db** (3) — `getHomeDashboardStats`, `formatPeriodLabel`, `scheduledDaysElapsedThisMonth`
- **apps/platform/modules-product/home/hooks** (2) — `useHomeDashboard`, `HOME_KEYS`
- **apps/platform/modules-product/home/types** (5) — `EmployeeTodayStatus`, `HomeDashboardPayload`, `HomeDashboardStats`, `MonthlyAttendanceItem`, `RecentReceipt`
- **apps/platform/modules-product/navigation/constants** (15) — `ReceiptEmployeeBreadcrumb`, `field`, `PRODUCT_SEGMENT_RESOLVERS_ENCAJA`, `formatSlug`, `PRODUCT_BREADCRUMB_PATTERNS_ENCAJA`, `PRODUCT_BREADCRUMB_PATTERNS`, `PRODUCT_SEGMENT_RESOLVERS`, `EMPLOYEE_MAIN_NAV_ITEMS`
- **apps/platform/modules-product/navigation/hooks** (1) — `useNavItems`
- **apps/platform/modules-product/notifications/channels** (1) — `PRODUCT_NOTIFICATION_CHANNEL_HANDLERS`
- **apps/platform/modules-product/notifications/constants** (4) — `PRODUCT_NOTIFICATION_CATEGORY_OPTIONS`, `PRODUCT_NOTIFICATION_ICONS`, `PRODUCT_NOTIFICATION_TYPE_DEFAULTS`, `PRODUCT_NOTIFICATION_TYPE_OPTIONS`
- **apps/platform/modules-product/onboarding** (1) — `onboardingProfileSchema`
- **apps/platform/modules-product/onboarding/components** (9) — `OnboardingView`, `BpsGuideStep`, `ProfileStep`, `MarketingStep`, `SuccessStep`, `parseStep`, `Props`, `Props`
- **apps/platform/modules-product/onboarding/hooks** (2) — `useOnboardingForm`, `UseOnboardingFormOptions`
- **apps/platform/modules-product/pdf-generator** (2) — `generatePDF`, `generatePDFStream`
- **apps/platform/modules-product/receipt-composer** (26) — `composeReceipt`, `item`, `generateReceiptPDF`, `buildPeriodEarnings`, `buildDeductions`, `buildEgresoDeductions`, `fmt`, `buildMetadata`
- **apps/platform/modules-product/receipt-composer/pdf-templates** (13) — `DefaultPDFTemplate`, `MinimalPDFTemplate`, `registerBuiltInPDFTemplates`, `fmt`, `fmtDate`, `fmtDays`, `SectionTable`, `fmt`
- **apps/platform/modules-product/receipt-composer/templates** (3) — `defaultTemplate`, `minimalTemplate`, `registerBuiltInTemplates`
- **apps/platform/modules-product/receipt-composer/utils** (10) — `escapeHtml`, `fmt`, `fmtDays`, `htmlDocument`, `numberToWords`, `fmtDate`, `receiptHeader`, `formatReceiptFooter`
- **apps/platform/modules-product/receipt-gen-settings** (1) — `UpdateSettingsSchema`
- **apps/platform/modules-product/receipt-gen-settings/actions** (4) — `resolveCtx`, `getReceiptGenNextDatesAction`, `getReceiptGenSettingsAction`, `updateReceiptGenSettingsAction`
- **apps/platform/modules-product/receipt-gen-settings/components** (1) — `ReceiptGenSettingsForm`
- **apps/platform/modules-product/receipt-gen-settings/db** (3) — `getReceiptGenSettings`, `upsertReceiptGenSettings`, `listEnabledEmployersForGeneration`
- **apps/platform/modules-product/receipt-gen-settings/hooks** (4) — `RECEIPT_GEN_SETTINGS_KEYS`, `useReceiptGenNextDates`, `useReceiptGenSettings`, `useUpdateReceiptGenSettings`
- **apps/platform/modules-product/receipt-gen-settings/services** (5) — `getNextDates`, `getOrCreateSettings`, `updateSettings`, `assertCutoffOrder`, `computeNextDates`
- **apps/platform/modules-product/receipts** (15) — `EmployeeIdSchema`, `log`, `ReceiptIdSchema`, `RECEIPT_NOTIFICATION_DRAFT_GENERATED`, `PaginationSchema`, `RECEIPT_NOTIFICATION_APPROVED`, `RECEIPT_NOTIFICATION_AUTO_APPROVED`, `RECEIPT_NOTIFICATION_UPCOMING`
- **apps/platform/modules-product/receipts/actions** (19) — `resolveReceiptCtx`, `checkExistingReceiptAction`, `getLeaveBalanceAction`, `listEmployeeReceiptsAction`, `approveReceiptAction`, `deleteReceiptAction`, `generateAguinaldoReceipt`, `generateDespidoReceipt`
- **apps/platform/modules-product/receipts/components** (3) — `EmployeeCardsContent`, `NameCell`, `EmployeeCardsSection`
- **apps/platform/modules-product/receipts/components/forms** (8) — `VacationForm`, `AguinaldoFormContent`, `DespidoForm`, `RenunciaForm`, `AguinaldoForm`, `ConfigSection`, `YearBalanceRow`, `AguinaldoFormProps`
- **apps/platform/modules-product/receipts/components/history** (7) — `ReceiptHistorySection`, `ActionsCell`, `DeleteReceiptButton`, `EmployeeCell`, `formatPeriod`, `PaymentDateCell`, `DeleteReceiptButtonProps`
- **apps/platform/modules-product/receipts/components/shared** (6) — `PagoSection`, `DescuentosSection`, `ReceiptFormSuccess`, `DescuentosSectionProps`, `PagoSectionProps`, `ReceiptFormSuccessProps`
- **apps/platform/modules-product/receipts/components/sueldo** (10) — `SueldoFormContent`, `PeriodoSection`, `HorasExtrasSection`, `AusenciasSection`, `SueldoForm`, `attrsToTypeKey`, `AusenciasSectionProps`, `HorasExtrasSectionProps`
- **apps/platform/modules-product/receipts/db** (19) — `createReceipt`, `deleteReceipt`, `getReceiptStatusAndCutoff`, `mapRow`, `findExistingAguinaldoReceipt`, `findExistingPeriodReceipt`, `findExistingVacationReceipt`, `getReceiptById`
- **apps/platform/modules-product/receipts/hooks** (28) — `useSueldoForm`, `RECEIPT_KEYS`, `useDespidoForm`, `useRenunciaForm`, `useVacationForm`, `useAguinaldoForm`, `useDeleteEmployerReceipt`, `useEmployerReceipts`
- **apps/platform/modules-product/receipts/jobs** (5) — `runReceiptsAutoApprove`, `generateAguinaldoReceiptsForEmployer`, `generateReceiptsForEmployer`, `RECEIPTS_INNGEST_JOBS`, `runReceiptsDailyScheduler`
- **apps/platform/modules-product/receipts/services** (33) — `resolveEmployee`, `generatePeriodReceipt`, `generateAguinaldoReceipt`, `generateVacationReceipt`, `autoGeneratePeriodReceiptsForEmployer`, `resolveAguinaldoInputs`, `buildInputPeriodoAuto`, `notifyEmployeeReceiptApproved`
- **apps/platform/modules-product/receipts/utils** (5) — `calcCutoffDate`, `isBizDay`, `RECEIPT_CUTOFF_ORDER`, `formatLastReceipt`, `LastReceiptLabels`
- **apps/platform/modules-product/referrals** (1) — `referralRewardHandler`
- **apps/platform/modules-product/secrets/constants** (3) — `log`, `SECRETS_MASTER_KEY_ENV`, `SECRETS_MASTER_KEY_VERSION_ENV`
- **apps/platform/modules-product/secrets/db** (4) — `getEncryptedSecretByRef`, `revokeSecretByRef`, `upsertEncryptedSecretByOwner`, `StoredSecretRecord`
- **apps/platform/modules-product/secrets/domain** (4) — `getMasterKey`, `decryptSecretPayload`, `encryptSecretPayload`, `parseMasterKey`
- **apps/platform/modules-product/secrets/services** (9) — `getSecretByRef`, `storeSecretForOwner`, `rotateSecretForOwner`, `getBpsCredentialsByRef`, `rotateBpsCredentialsForEmployer`, `storeBpsCredentialsForEmployer`, `revokeSecret`, `SecretNotFoundError`
- **apps/platform/modules-product/secrets/types** (3) — `BpsCredentials`, `SecretRecordPayloadMap`, `StoredSecretEnvelope`
- **apps/platform/modules-product/trabajo-domestico** (6) — `inputAguinaldoSchema`, `inputDespidoSchema`, `inputPeriodoSchema`, `inputRenunciaSchema`, `inputVacacionesSchema`, `fechaFinPosterior`
- **apps/platform/modules-product/trabajo-domestico/constants** (42) — `getRatesAt`, `BPS_VERSIONS`, `isFeriadoPago`, `DIAS_HABILES_MES`, `HORAS_JORNAL_BASE`, `HORAS_MENSUALES_BASE`, `FERIADOS_PAGOS`, `BPC`
- **apps/platform/modules-product/trabajo-domestico/constants/versions** (3) — `rates2025Julio`, `rates2025`, `rates2026`
- **apps/platform/modules-product/trabajo-domestico/domain** (25) — `netToGrossMonthly`, `calcularTasaFonasa`, `calcularIRPF`, `netToGrossHourly`, `buildDeducciones`, `calcularFonasa`, `calcularJubilacionPersonal`, `redondear`
- **apps/platform/modules-product/trabajo-domestico/domain/liquidaciones** (6) — `liquidarPeriodo`, `liquidarVacaciones`, `liquidarEgresoGeneral`, `liquidarAguinaldo`, `liquidarDespido`, `liquidarRenuncia`
- **apps/platform/modules-product/trabajo-domestico/scenarios/catalog/v1** (1) — `scenariosV1`
- **apps/platform/modules-product/trabajo-domestico/scenarios/runner** (39) — `buildScenarioCard`, `main`, `formatMoneyUY`, `buildDetailGroups`, `formatDecimalUY`, `formatPercent`, `liquidateScenario`, `validateScenarioInput`
- **apps/platform/modules/account** (11) — `changePasswordSchema`, `setPasswordSchema`, `avatarUploadSchema`, `changeEmailSchema`, `changePasswordFormSchema`, `disconnectAccountSchema`, `passwordFieldSchema`, `revokeSessionSchema`
- **apps/platform/modules/account/actions** (14) — `prepareAvatarUploadAction`, `changeEmailAction`, `revokeSessionAction`, `updateProfileAction`, `cancelAccountDeletionAction`, `changePasswordAction`, `disconnectAccountAction`, `getConnectedAccountsAction`
- **apps/platform/modules/account/components/account** (8) — `ChangeEmailForm`, `AccountOverviewCard`, `ChangePasswordForm`, `ConnectedAccounts`, `PasswordSection`, `SetPasswordForm`, `PasswordSkeleton`, `SetPasswordFormProps`
- **apps/platform/modules/account/components/privacy** (2) — `DangerZone`, `DeletionTimeline`
- **apps/platform/modules/account/components/profile** (9) — `ProfileAvatarSection`, `ProfileForm`, `ProfileBioSection`, `ProfileIdentitySection`, `ProfileLocaleSection`, `ProfileAvatarSectionProps`, `ProfileBioSectionProps`, `ProfileIdentitySectionProps`
- **apps/platform/modules/account/components/security** (8) — `TwoFactorSection`, `Enable2FADialog`, `SessionsList`, `RegenBackupCodesDialog`, `Disable2FADialog`, `Disable2FADialogProps`, `Enable2FADialogProps`, `RegenBackupCodesDialogProps`
- **apps/platform/modules/account/constants** (8) — `log`, `buildAvatarKey`, `AVATAR_MAX_BYTES`, `AVATAR_ALLOWED_TYPES`, `GENDERS`, `LOCALES`, `PRONOUNS`, `TIMEZONES`
- **apps/platform/modules/account/db** (10) — `cancelUserDeletion`, `getConnectedAccountsByUserId`, `getProfileByUserId`, `getSessionsByUserId`, `revokeSessionByToken`, `scheduleUserDeletion`, `setPendingEmail`, `updateProfileByUserId`
- **apps/platform/modules/account/hooks** (20) — `ACCOUNT_KEYS`, `use2FADisable`, `use2FASetup`, `useAvatarUpload`, `useConnectedAccounts`, `useProfileForm`, `useProfile`, `useCancelAccountDeletion`
- **apps/platform/modules/account/jobs** (2) — `processExpiredDeletions`, `ACCOUNT_INNGEST_JOBS`
- **apps/platform/modules/account/types** (3) — `AccountProfile`, `AccountSession`, `ConnectedAccount`
- **apps/platform/modules/addresses** (7) — `createAddressSchema`, `addressIdSchema`, `deleteAddressSchema`, `entityTypeSchema`, `listAddressesSchema`, `updateAddressSchema`, `addressTypeSchema`
- **apps/platform/modules/addresses/actions** (4) — `updateAddressAction`, `createAddressAction`, `deleteAddressAction`, `listAddressesAction`
- **apps/platform/modules/addresses/components** (7) — `AddressCard`, `AddAddressForm`, `EditAddressForm`, `AddressesSection`, `AddAddressFormProps`, `AddressCardProps`, `EditAddressFormProps`
- **apps/platform/modules/addresses/constants** (4) — `log`, `ADDRESS_TYPES`, `ADDRESS_TYPE_CONFIG`, `DEFAULT_ADDRESS_VALUES`
- **apps/platform/modules/addresses/db** (5) — `createAddress`, `deleteAddress`, `getAddressById`, `listAddresses`, `updateAddress`
- **apps/platform/modules/addresses/domain** (1) — `checkOrgMembership`
- **apps/platform/modules/addresses/hooks** (6) — `ADDRESS_KEYS`, `useAddresses`, `useCreateAddress`, `useDeleteAddress`, `useUpdateAddress`, `sortByDefault`
- **apps/platform/modules/addresses/services** (8) — `createAddressForUser`, `resolveOwnerOrThrow`, `listAddressesForUser`, `deleteAddressForUser`, `updateAddressForUser`, `AddressForbiddenError`, `AddressValidationError`, `AddressNotFoundError`
- **apps/platform/modules/addresses/types** (1) — `Address`
- **apps/platform/modules/audit** (1) — `auditLimitSchema`
- **apps/platform/modules/audit/actions** (1) — `getAuditLogsAction`
- **apps/platform/modules/audit/components** (4) — `ActivityLog`, `AuditLogSection`, `ActivityLogSkeleton`, `ActivityLogProps`
- **apps/platform/modules/audit/constants** (3) — `getActionIcon`, `log`, `ACTION_ICONS`
- **apps/platform/modules/audit/db** (3) — `getAuditLogsByUserId`, `createAuditLog`, `mapAuditRow`
- **apps/platform/modules/audit/hooks** (2) — `useAuditLogs`, `AUDIT_KEYS`
- **apps/platform/modules/audit/lib** (3) — `getEntrySubtitle`, `has`, `AuditTranslations`
- **apps/platform/modules/audit/types** (2) — `AuditLogEntry`, `CreateAuditLogInput`
- **apps/platform/modules/auth** (7) — `createLoginSchema`, `createRegisterSchema`, `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordApiSchema`, `resetPasswordSchema`
- **apps/platform/modules/auth/actions** (4) — `getSessionAction`, `logoutAction`, `requestPasswordResetAction`, `resetPasswordAction`
- **apps/platform/modules/auth/components** (9) — `LoginForm`, `RegisterForm`, `TwoFAVerificationStep`, `ForgotPasswordForm`, `ResetPasswordForm`, `BrandMark`, `EarlyAccessView`, `BrandMarkProps`
- **apps/platform/modules/auth/constants** (2) — `log`, `AUTH_PROVIDERS`
- **apps/platform/modules/auth/context** (4) — `InitialSessionProvider`, `useInitialSession`, `UserContextProvider`, `useUserContext`
- **apps/platform/modules/auth/db** (3) — `requestPasswordResetQuery`, `resetPasswordQuery`, `signOutQuery`
- **apps/platform/modules/auth/hooks** (11) — `AUTH_KEYS`, `useAuthSession`, `useAuth`, `useEmailSignIn`, `useEmailSignUp`, `useLogout`, `usePasswordToggle`, `useRequestPasswordReset`
- **apps/platform/modules/auth/lib** (9) — `DEFAULT_POST_LOGIN_REDIRECT_PATH`, `resolvePostLoginRedirectPath`, `isSafeInternalPath`, `getSession`, `SessionInfo`, `EARLY_ACCESS_PATH`, `GUEST_ONLY_PATHS`, `PROTECTED_PREFIXES`
- **apps/platform/modules/auth/types** (2) — `AuthError`, `AuthResult`
- **apps/platform/modules/background-ops/lib** (1) — `defineInngestJob`
- **apps/platform/modules/background-ops/registry** (2) — `registeredInngestFunctions`, `registeredInngestJobs`
- **apps/platform/modules/background-ops/types** (1) — `BackgroundOpsInngestJobDefinition`
- **apps/platform/modules/billing** (1) — `createCheckoutSchema`
- **apps/platform/modules/billing/actions** (10) — `getAccessSnapshotAction`, `cancelSubscriptionAction`, `createCheckoutAction`, `createPortalAction`, `downgradeToFreeAction`, `getAvailableProvidersAction`, `getBillingOverviewAction`, `resumeSubscriptionAction`
- **apps/platform/modules/billing/adapters** (25) — `MercadoPagoAdapter`, `StripeAdapter`, `stripeClient`, `createCheckoutSession`, `registerMercadoPagoProvider`, `registerStripeProvider`, `cancelSubscription`, `getSubscription`
- **apps/platform/modules/billing/components** (30) — `PricingSection`, `PricingCard`, `ProviderSelect`, `FAQ`, `PlansView`, `PricingGrid`, `FeatureGate`, `PricingCardCTA`
- **apps/platform/modules/billing/components/settings** (7) — `PlanRow`, `PlanSelector`, `BillingOverviewCard`, `resolvePlanIcon`, `BillingOverviewProps`, `PlanRowProps`, `PlanSelectorProps`
- **apps/platform/modules/billing/constants** (1) — `log`
- **apps/platform/modules/billing/context** (3) — `AccessProvider`, `useAccess`, `AccessContextValue`
- **apps/platform/modules/billing/db** (27) — `getDefaultSubscriberContextForUser`, `recordSubscriptionChange`, `ensureTrialSubscriptionForContext`, `getSubscriptionByUserId`, `expireTrialIfNeeded`, `getLatestSubscriptionForContext`, `grantLifetimeAccess`, `revokeLifetimeAccess`
- **apps/platform/modules/billing/domain** (12) — `isTrialActive`, `getSubscriptionAccessReason`, `hasSubscriptionAccess`, `isPaidPlan`, `isTrialExpired`, `subscriptionExpiresAt`, `getTrialConfig`, `getTrialDaysRemaining`
- **apps/platform/modules/billing/hooks** (10) — `BILLING_KEYS`, `useAvailableProviders`, `useBillingOverviewActions`, `useCancelSubscription`, `useDowngradeOrCancel`, `useDowngradeToFree`, `usePlans`, `useBillingPortal`
- **apps/platform/modules/billing/lib** (3) — `getDiscountLabel`, `FALLBACK_ACCESS_SNAPSHOT`, `serializeAccessSnapshot`
- **apps/platform/modules/billing/ports** (12) — `IPaymentProvider`, `PortalNotSupportedError`, `cancelSubscription`, `createCheckoutSession`, `createPortalSession`, `resolveCheckoutUrls`, `resumeSubscription`, `CheckoutParams`
- **apps/platform/modules/billing/services** (20) — `createCheckoutForUser`, `billingService`, `openBillingPortal`, `getBillingOverview`, `cancelSubscription`, `resumeSubscription`, `processWebhookEvent`, `getBillingAccessSnapshot`
- **apps/platform/modules/billing/types** (14) — `PAYMENT_PROVIDERS`, `BillingAccessSnapshot`, `BillingManagementSummary`, `BillingOverview`, `BillingPlanPriceSummary`, `BillingPlanSummary`, `EntitlementGrant`, `PaymentEvent`
- **apps/platform/modules/chat** (3) — `createConversationSchema`, `saveMessageSchema`, `chatRequestSchema`
- **apps/platform/modules/chat/actions** (6) — `saveUserMessageAction`, `createConversationAction`, `getAuthUserId`, `listConversationsAction`, `loadConversationAction`, `withRetry`
- **apps/platform/modules/chat/components** (13) — `ChatPage`, `ChatInput`, `ChatMessage`, `ChatMessagesArea`, `ChatMessageLoading`, `AssistantBubble`, `shouldShowSeparator`, `ChatInputProps`
- **apps/platform/modules/chat/constants** (1) — `CHAT_MAX_MESSAGES`
- **apps/platform/modules/chat/db** (7) — `getMessagesByConversation`, `createConversation`, `getConversationsByUser`, `saveMessage`, `verifyConversationOwnership`, `deleteConversationsOlderThan`, `touchConversation`
- **apps/platform/modules/chat/hooks** (5) — `useAssistant`, `chatKeys`, `useVisualLoadingDelay`, `AssistantOptions`, `toUIMessage`
- **apps/platform/modules/chat/jobs** (2) — `CHAT_INNGEST_JOBS`, `pruneOldChatConversations`
- **apps/platform/modules/chat/lib** (1) — `createLLMProvider`
- **apps/platform/modules/commerce** (21) — `CommerceError`, `PermissionDeniedError`, `CommerceProviderNotFoundError`, `OrganizationMembershipRequiredError`, `OfferingNotFoundError`, `OfferingPriceNotFoundError`, `CommerceProviderSlugAlreadyInUseError`, `InvalidCurrencyError`
- **apps/platform/modules/commerce/actions** (7) — `createOfferingPriceAction`, `createOfferingAction`, `createCommerceProviderAction`, `createCheckoutSessionAction`, `listOfferingPricesAction`, `listOfferingsAction`, `listCommerceProvidersAction`
- **apps/platform/modules/commerce/adapters** (3) — `normalizeStripeConnectEvent`, `extractPaymentIntentId`, `extractSubscriptionId`
- **apps/platform/modules/commerce/constants** (1) — `log`
- **apps/platform/modules/commerce/db** (26) — `getCommerceProviderById`, `getCommerceSubscriptionByProviderSubId`, `getCommercePaymentByProviderPaymentId`, `getOfferingById`, `userIsOrgMember`, `insertCommercePayment`, `insertOneTimeCommerceCheckout`, `updateCommerceSubscription`
- **apps/platform/modules/commerce/domain** (10) — `createCommerceProvider`, `createCheckoutSession`, `createOfferingPrice`, `createOffering`, `ensureCommerceProviderOwnership`, `listCommerceProviders`, `listOfferings`, `listOfferingPrices`
- **apps/platform/modules/commerce/hooks** (8) — `COMMERCE_QUERY_KEYS`, `useCommerceProviders`, `useCreateCommerceProvider`, `useCreateOfferingPrice`, `useCreateOffering`, `useOfferingPrices`, `useOfferings`, `useCreateCheckoutSession`
- **apps/platform/modules/commerce/lib** (3) — `calculatePlatformFee`, `resolvePlatformFeeBasisPoints`, `stripeConnect`
- **apps/platform/modules/commerce/services** (7) — `handleCheckoutCompleted`, `handleInvoicePaymentSucceeded`, `handleInvoicePaymentFailed`, `handleSubscriptionUpdated`, `processCommerceWebhookEvent`, `handleSubscriptionDeleted`, `mapStripeSubscriptionStatus`
- **apps/platform/modules/commerce/types** (14) — `CommercePaymentSummary`, `CommerceProviderSummary`, `CommerceSubscriptionSummary`, `CreateCheckoutSessionResult`, `CreateCommerceProviderResult`, `CreateOfferingPriceResult`, `CreateOfferingResult`, `GetProcessorAccountResult`
- **apps/platform/modules/contact-methods** (7) — `createContactMethodSchema`, `updateContactMethodSchema`, `contactMethodIdSchema`, `contactMethodTypeSchema`, `deleteContactMethodSchema`, `entityTypeSchema`, `listContactMethodsSchema`
- **apps/platform/modules/contact-methods/actions** (4) — `createContactMethodAction`, `deleteContactMethodAction`, `listContactMethodsAction`, `updateContactMethodAction`
- **apps/platform/modules/contact-methods/components** (7) — `ContactMethodCard`, `AddContactMethodForm`, `EditContactMethodForm`, `ContactMethodsSection`, `AddContactMethodFormProps`, `ContactMethodCardProps`, `EditContactMethodFormProps`
- **apps/platform/modules/contact-methods/constants** (5) — `log`, `CONTACT_METHOD_TYPE_CONFIG`, `CONTACT_METHOD_ICON_TYPES`, `DEFAULT_CONTACT_METHOD_VALUES`, `CONTACT_METHOD_TYPES`
- **apps/platform/modules/contact-methods/db** (5) — `getContactMethodById`, `createContactMethod`, `deleteContactMethod`, `listContactMethods`, `updateContactMethod`
- **apps/platform/modules/contact-methods/domain** (1) — `checkOrgMembership`
- **apps/platform/modules/contact-methods/hooks** (6) — `CONTACT_METHOD_KEYS`, `useContactMethods`, `useCreateContactMethod`, `useDeleteContactMethod`, `useUpdateContactMethod`, `sortByPrimary`
- **apps/platform/modules/contact-methods/services** (7) — `createContactMethodForUser`, `deleteContactMethodForUser`, `listContactMethodsForUser`, `updateContactMethodForUser`, `ContactMethodForbiddenError`, `ContactMethodNotFoundError`, `ContactMethodValidationError`
- **apps/platform/modules/contact-methods/types** (1) — `ContactMethod`
- **apps/platform/modules/dashboard/actions** (1) — `getDashboardBootstrapAction`
- **apps/platform/modules/dashboard/components** (1) — `LogoutButton`
- **apps/platform/modules/dashboard/db** (1) — `getDashboardBootstrap`
- **apps/platform/modules/dashboard/types** (3) — `DashboardBootstrap`, `PayerScopeSummary`, `ProviderScopeSummary`
- **apps/platform/modules/data-export** (1) — `exportRequestIdSchema`
- **apps/platform/modules/data-export/actions** (4) — `deleteExportAction`, `getDownloadUrlAction`, `getExportRequestsAction`, `requestExportAction`
- **apps/platform/modules/data-export/components** (4) — `ExportRequestRow`, `ExportSection`, `ExportListSkeleton`, `ExportRequestRowProps`
- **apps/platform/modules/data-export/constants** (1) — `log`
- **apps/platform/modules/data-export/db** (5) — `getExportRequestById`, `createExportRequest`, `deleteExportRequest`, `getExportRequestsByUserId`, `updateExportRequest`
- **apps/platform/modules/data-export/hooks** (8) — `useExportRequestRow`, `useExportRequests`, `DATA_EXPORT_KEYS`, `useDeleteExport`, `useRequestExport`, `useGetDownloadUrl`, `useExportCompletionNotifier`, `ExportRequestRowState`
- **apps/platform/modules/data-export/jobs** (2) — `processDataExport`, `DATA_EXPORT_INNGEST_JOBS`
- **apps/platform/modules/data-export/services** (8) — `getDownloadUrlForUser`, `deleteExportForUser`, `requestExportForUser`, `ExportNotFoundError`, `ExportExpiredError`, `ExportNotDeletableError`, `ExportNotReadyError`, `ExportStorageKeyMissingError`
- **apps/platform/modules/data-export/types** (1) — `DataExportRequest`
- **apps/platform/modules/feedback** (1) — `createFeedbackSchema`
- **apps/platform/modules/feedback/actions** (1) — `createFeedbackAction`
- **apps/platform/modules/feedback/components** (2) — `FeedbackPopover`, `FeedbackPopoverProps`
- **apps/platform/modules/feedback/constants** (6) — `log`, `FEEDBACK_MAX_CHARS`, `FEEDBACK_SATISFACTION_OPTIONS`, `FEEDBACK_SATISFACTION_VALUES`, `FEEDBACK_TOPIC_OPTIONS`, `FEEDBACK_TOPIC_VALUES`
- **apps/platform/modules/feedback/db** (1) — `saveFeedback`
- **apps/platform/modules/feedback/hooks** (3) — `useFeedbackForm`, `useSubmitFeedback`, `FEEDBACK_KEYS`
- **apps/platform/modules/feedback/services** (1) — `submitFeedbackForUser`
- **apps/platform/modules/layout** (2) — `BREADCRUMB_PATTERNS`, `SEGMENT_RESOLVERS`
- **apps/platform/modules/layout/components** (3) — `DashboardShell`, `DashboardShellProps`, `SettingsNav`
- **apps/platform/modules/layout/components/banners** (4) — `DeletionBanner`, `AlertBanners`, `NetworkStatusBanner`, `UnverifiedEmailBanner`
- **apps/platform/modules/layout/components/shared** (3) — `UserMenuContent`, `TrialStatusWidget`, `UserMenuContentProps`
- **apps/platform/modules/layout/components/sidebar** (11) — `NavMain`, `AppSidebar`, `OrgSwitcher`, `RouteBreadcrumb`, `SidebarShell`, `NavUser`, `NavSecondary`, `AppLogo`
- **apps/platform/modules/layout/components/topnav** (6) — `AppTopnav`, `TopnavHelpMenu`, `TopnavItem`, `TopnavShell`, `TopnavUserMenu`, `TopnavShellProps`
- **apps/platform/modules/layout/constants** (8) — `normalizeNavigationItems`, `SECONDARY_NAV_ITEMS`, `ADMIN_NAV_ITEMS`, `MAIN_NAV_ITEMS`, `EMPLOYEE_NAV_ITEMS`, `ROUTE_TITLES`, `SETTINGS_NAV_ITEMS`, `sortByOrder`
- **apps/platform/modules/layout/hooks** (2) — `useShellData`, `useNetworkStatus`
- **apps/platform/modules/layout/lib** (1) — `isRouteActive`
- **apps/platform/modules/layout/types** (3) — `NavigationItem`, `UserMenuItem`, `UserSessionProfile`
- **apps/platform/modules/notifications** (12) — `notificationInboxIdSchema`, `notificationPreferencesSchema`, `notifyBillingEvent`, `notifyOrganizationEvent`, `notifyReferralEvent`, `notifySecurityEvent`, `notifySocialEvent`, `notifySupportEvent`
- **apps/platform/modules/notifications/actions** (12) — `getNotificationBellDataAction`, `buildContext`, `getNotificationAction`, `getNotificationsAction`, `updateNotificationPreferencesAction`, `archiveNotificationAction`, `deleteNotificationAction`, `markNotificationAsReadAction`
- **apps/platform/modules/notifications/channels** (7) — `emailChannelHandler`, `NOTIFICATION_CHANNEL_HANDLERS`, `send`, `NotificationChannelHandler`, `NotificationChannelSendResult`, `NotificationDeliveryRecipient`, `NotificationForDelivery`
- **apps/platform/modules/notifications/components/bell** (5) — `NotificationBell`, `NotificationBellItem`, `NotificationLeadingIcon`, `NotificationBellItemProps`, `NotificationIconProps`
- **apps/platform/modules/notifications/components/detail** (3) — `NotificationDetailContent`, `NotificationDetailSkeleton`, `NotificationDetailContentProps`
- **apps/platform/modules/notifications/components/inbox** (8) — `NotificationsPageContent`, `NotificationCard`, `NotificationsSidebar`, `NotificationsListSkeleton`, `NotificationsPageContentFallback`, `buildHref`, `NotificationCardProps`, `NotificationsSidebarProps`
- **apps/platform/modules/notifications/components/preferences** (1) — `NotificationsForm`
- **apps/platform/modules/notifications/components/shared** (6) — `NotificationActionsMenu`, `NotificationAvatar`, `LeadingIcon`, `NotificationActionsMenuProps`, `LeadingIconProps`, `NotificationAvatarProps`
- **apps/platform/modules/notifications/constants** (13) — `log`, `NOTIFICATION_CATEGORY_OPTIONS`, `cloneNotificationPreferencesDefaults`, `DEFAULT_NOTIFICATION_PREFERENCES`, `NOTIFICATION_TYPE_OPTIONS`, `NOTIFICATION_CATEGORIES`, `toNotificationChannelPreferenceKey`, `toNotificationTypePreferenceKey`
- **apps/platform/modules/notifications/db** (22) — `createNotification`, `createNotificationFireAndForget`, `getNotificationsByUserId`, `getNotificationByInboxId`, `getNotificationPreferencesByUserId`, `getNotificationWithRecipient`, `markDeliveryFailed`, `normalizeNotificationPreferences`
- **apps/platform/modules/notifications/hooks** (17) — `NOTIFICATION_KEYS`, `useMarkNotificationRead`, `useArchiveNotification`, `useDeleteNotification`, `useMarkAllNotificationsRead`, `useMarkNotificationUnread`, `useNotificationBell`, `useNotificationPreferences`
- **apps/platform/modules/notifications/jobs** (2) — `processNotificationDeliveries`, `NOTIFICATIONS_INNGEST_JOBS`
- **apps/platform/modules/notifications/lib** (14) — `getNotificationIcon`, `resolveNotificationHref`, `getCategoryIcon`, `resolveFromPayload`, `filterNotificationsByView`, `groupNotificationsByDate`, `resolveNotificationsFilter`, `isSafeInternalHref`
- **apps/platform/modules/notifications/services** (9) — `emitInboxAudit`, `processResendWebhookEvent`, `archiveNotificationForUser`, `deleteNotificationForUser`, `markAllNotificationsReadForUser`, `markNotificationReadForUser`, `markNotificationUnreadForUser`, `updateNotificationPreferencesForUser`
- **apps/platform/modules/notifications/types** (6) — `CreateNotificationInput`, `Notification`, `NotificationCategoryOption`, `NotificationIconProps`, `NotificationPreferences`, `NotificationTypeOption`
- **apps/platform/modules/organizations** (21) — `OrganizationError`, `PermissionDeniedError`, `OrganizationNotFoundError`, `InvitationNotFoundError`, `InvalidOrganizationSlugError`, `InvitationEmailMismatchError`, `InvitationExpiredError`, `OrganizationSlugAlreadyInUseError`
- **apps/platform/modules/organizations/actions** (15) — `acceptOrganizationInvitationAction`, `createOrganizationAction`, `declineInvitationAction`, `deleteOrganizationAction`, `getOrganizationAction`, `inviteOrganizationMemberAction`, `leaveOrganizationAction`, `listOrganizationInvitationsAction`
- **apps/platform/modules/organizations/constants** (1) — `log`
- **apps/platform/modules/organizations/db** (25) — `getOrganizationById`, `getMembershipForUser`, `acceptOrganizationInvitation`, `getMemberById`, `getOrganizationBySlug`, `getPendingInvitationByToken`, `insertOrganizationWithOwner`, `listOrganizationsForUser`
- **apps/platform/modules/organizations/domain** (18) — `createOrganization`, `ensureOrganizationPermission`, `inviteOrganizationMember`, `updateOrganization`, `acceptOrganizationInvitation`, `declineInvitation`, `deleteOrganization`, `leaveOrganization`
- **apps/platform/modules/organizations/hooks** (16) — `ORGANIZATIONS_QUERY_KEYS`, `useAcceptOrganizationInvitation`, `useCreateOrganization`, `useDeclineInvitation`, `useDeleteOrganization`, `useInviteOrganizationMember`, `useLeaveOrganization`, `useOrganizationInvitations`
- **apps/platform/modules/organizations/services** (12) — `emitAudit`, `acceptOrganizationInvitationForUser`, `createOrganizationForUser`, `declineInvitationForUser`, `deleteOrganizationForUser`, `inviteOrganizationMemberForUser`, `leaveOrganizationForUser`, `removeMemberForUser`
- **apps/platform/modules/organizations/types** (10) — `CreateOrganizationResult`, `InviteOrganizationMemberResult`, `ListOrganizationInvitationsResult`, `ListOrganizationMembersResult`, `ListOrganizationsResult`, `OrganizationInvitationSummary`, `OrganizationMemberSummary`, `OrganizationSummary`
- **apps/platform/modules/referrals** (5) — `claimReferralSchema`, `generateInviteSchema`, `listConversionsSchema`, `revokeInviteSchema`, `referralCodeIdSchema`
- **apps/platform/modules/referrals/actions** (6) — `claimReferralAction`, `claimReferralFromCookieAction`, `generateInviteAction`, `revokeInviteAction`, `getOrCreateReferralCodeAction`, `listConversionsAction`
- **apps/platform/modules/referrals/constants** (4) — `log`, `REFERRAL_MAX_INVITES`, `REFERRAL_CODE_CHARS`, `REFERRAL_CODE_LENGTH`
- **apps/platform/modules/referrals/db** (13) — `createConversionAndMarkSource`, `getReferralCodeByCode`, `createReferralCode`, `createReferralInvite`, `getConversionById`, `getConversionByReferredUser`, `getReferralCodeByUserId`, `getReferralInviteById`
- **apps/platform/modules/referrals/domain** (7) — `createInvite`, `processReferralClaim`, `getOrCreateReferralCode`, `generateUniqueCode`, `randomCode`, `MaxInvitesReachedError`, `processReward`
- **apps/platform/modules/referrals/hooks** (2) — `useClaimReferralFromCookie`, `REFERRAL_KEYS`
- **apps/platform/modules/referrals/jobs** (2) — `processReferralReward`, `REFERRALS_INNGEST_JOBS`
- **apps/platform/modules/referrals/lib** (1) — `captureReferralParam`
- **apps/platform/modules/referrals/services** (7) — `revokeInviteForUser`, `emitAudit`, `claimReferralForUser`, `generateInviteForUser`, `getOrCreateReferralCodeForUser`, `InviteAlreadyUsedError`, `InviteNotFoundError`
- **apps/platform/modules/social** (16) — `SocialError`, `FollowRequestNotFoundError`, `FollowNotFoundError`, `AlreadyBlockedError`, `AlreadyFollowingError`, `BlockNotFoundError`, `CannotBlockYourselfError`, `CannotFollowYourselfError`
- **apps/platform/modules/social/actions** (12) — `getFollowStatusAction`, `acceptFollowRequestAction`, `blockUserAction`, `cancelFollowRequestAction`, `followAction`, `listFollowersAction`, `rejectFollowRequestAction`, `unblockUserAction`
- **apps/platform/modules/social/constants** (1) — `log`
- **apps/platform/modules/social/db** (17) — `getFollow`, `deleteFollowById`, `blockUserAndCleanupFollows`, `getBlock`, `isBlockedQuery`, `listFollowers`, `countFollowers`, `countFollowing`
- **apps/platform/modules/social/domain** (16) — `follow`, `blockUser`, `unblockUser`, `acceptFollowRequest`, `cancelFollowRequest`, `rejectFollowRequest`, `removeFollow`, `unfollow`
- **apps/platform/modules/social/hooks** (13) — `SOCIAL_QUERY_KEYS`, `useAcceptFollowRequest`, `useBlock`, `useBlockedUsers`, `useCancelFollowRequest`, `useFollowRequests`, `useFollowStatus`, `useFollow`
- **apps/platform/modules/social/services** (14) — `emitAudit`, `acceptFollowRequestForUser`, `blockUserForUser`, `cancelFollowRequestForUser`, `followForUser`, `rejectFollowRequestForUser`, `unblockUserForUser`, `unfollowForUser`
- **apps/platform/modules/social/types** (11) — `BlockSummary`, `FollowCountsResult`, `FollowerSummary`, `FollowingOrganizationSummary`, `FollowingUserSummary`, `FollowStatusResult`, `FollowSummary`, `ListBlockedResult`
- **apps/platform/modules/support** (7) — `addTicketMessageSchema`, `adminReplySchema`, `createSupportTicketSchema`, `ticketIdSchema`, `rateTicketSchema`, `updateTicketStatusSchema`, `adminTicketFiltersSchema`
- **apps/platform/modules/support/actions** (9) — `addMessageAction`, `adminGetTicketAction`, `adminReplyAction`, `adminUpdateStatusAction`, `createSupportTicketAction`, `getTicketAction`, `rateTicketAction`, `adminGetAllTicketsAction`
- **apps/platform/modules/support/components** (25) — `TicketConversation`, `AdminReplyForm`, `AdminTicketSidebar`, `AdminTicketItem`, `TicketItem`, `AdminTicketDetail`, `SupportForm`, `FaqAccordion`
- **apps/platform/modules/support/constants** (11) — `log`, `CLOSEABLE_STATUSES`, `TICKET_CATEGORY_ICONS`, `TICKET_STATUS_SOLID_COLORS`, `TICKET_URGENCY_COLORS`, `SATISFACTION_OPTIONS`, `TICKET_CATEGORY_OPTIONS`, `TICKET_STATUS_COLORS`
- **apps/platform/modules/support/db** (10) — `getTicketByIdForAdmin`, `getTicketByIdForUser`, `getAllTickets`, `addTicketMessage`, `getTicketsByUserId`, `createSupportTicket`, `rateTicketSatisfaction`, `updateTicketStatus`
- **apps/platform/modules/support/hooks** (11) — `SUPPORT_KEYS`, `useAddMessage`, `useAdminReply`, `useAdminTicket`, `useAdminTickets`, `useCreateSupportTicket`, `useMyTickets`, `useRateTicket`
- **apps/platform/modules/support/services** (8) — `addMessageForUser`, `adminReplyForUser`, `adminUpdateStatusForUser`, `createSupportTicketForUser`, `emitAudit`, `rateTicketForUser`, `TicketNotFoundError`, `TicketClosedError`
- **apps/platform/modules/support/types** (5) — `AdminTicketDetail`, `AdminTicketSummary`, `TicketDetail`, `TicketSummary`, `TicketMessageItem`
- **apps/platform/modules/system-events** (1) — `notifySystemEvent`
- **apps/platform/modules/system-events/db** (1) — `getUserForSystemEvent`
- **apps/platform/modules/system-events/jobs** (8) — `SYSTEM_EVENTS_INNGEST_JOBS`, `sendTelegramUserRegisteredAlert`, `sendTelegramFeedbackSubmittedAlert`, `sendTelegramPaymentFailedAlert`, `sendTelegramReferralClaimedAlert`, `sendTelegramSubscriptionActivatedAlert`, `sendTelegramSubscriptionCanceledAlert`, `sendTelegramTicketCreatedAlert`
- **apps/platform/modules/system-events/services** (2) — `sendTelegramMessage`, `SendTelegramMessageInput`
- **apps/platform/modules/system-events/templates** (17) — `buildTelegramMessage`, `escapeHtml`, `formatFeedbackSubmittedMessage`, `formatPaymentFailedMessage`, `formatReferralClaimedMessage`, `formatSubscriptionActivatedMessage`, `formatSubscriptionCanceledMessage`, `formatTicketCreatedMessage`
- **apps/platform/modules/system-status/actions** (1) — `getSystemStatusAction`
- **apps/platform/modules/system-status/components** (1) — `SystemStatusBadge`
- **apps/platform/modules/system-status/constants** (1) — `log`
- **apps/platform/modules/system-status/hooks** (2) — `useSystemStatus`, `SYSTEM_STATUS_KEYS`
- **apps/platform/modules/system-status/services** (1) — `getCurrentSystemStatus`
- **apps/platform/modules/system-status/types** (1) — `SystemStatusResult`
- **apps/platform/scripts** (18) — `main`, `main`, `main`, `main`, `createPreapprovalPlan`, `loadEnvFiles`, `loadEnvFiles`, `getFrequencyConfig`
- **apps/public** (1) — `config`
- **apps/public/app** (9) — `OGImage`, `alternates`, `localeUrl`, `sitemap`, `manifest`, `size`, `RootNotFound`, `contentType`
- **apps/public/app/[locale]** (8) — `Error`, `RootLayout`, `NotFound`, `generateStaticParams`, `metadata`, `metadata`, `generateMetadata`, `HomePage`
- **apps/public/app/[locale]/[...rest]** (1) — `CatchAllPage`
- **apps/public/app/[locale]/ayuda** (2) — `generateMetadata`, `HelpPage`
- **apps/public/app/[locale]/blog** (2) — `BlogIndexPage`, `generateMetadata`
- **apps/public/app/[locale]/blog/[slug]** (3) — `BlogPostPage`, `generateMetadata`, `generateStaticParams`
- **apps/public/app/[locale]/calculadora-sueldo-domestico** (2) — `CalculadoraPage`, `generateMetadata`
- **apps/public/app/[locale]/caracteristicas** (2) — `FeaturesPage`, `generateMetadata`
- **apps/public/app/[locale]/como-funciona** (2) — `generateMetadata`, `HowItWorksPage`
- **apps/public/app/[locale]/contacto** (2) — `ContactPage`, `generateMetadata`
- **apps/public/app/[locale]/cookie-policy** (2) — `CookiePolicyPage`, `generateMetadata`
- **apps/public/app/[locale]/faq** (2) — `FAQPage`, `generateMetadata`
- **apps/public/app/[locale]/help** (2) — `generateMetadata`, `HelpPage`
- **apps/public/app/[locale]/nosotros** (2) — `AboutPage`, `generateMetadata`
- **apps/public/app/[locale]/precios** (2) — `PricingPage`, `generateMetadata`
- **apps/public/app/[locale]/privacy** (2) — `generateMetadata`, `PrivacyPage`
- **apps/public/app/[locale]/terms** (2) — `generateMetadata`, `TermsPage`
- **apps/public/app/llms.txt** (1) — `GET`
- **apps/public/components** (6) — `Breadcrumb`, `PageCTA`, `PageHero`, `SectionHeader`, `LanguageSelector`, `StatsBanner`
- **apps/public/i18n** (2) — `routing`, `{ Link, redirect, usePathname, useRouter, getPathname }`
- **apps/public/lib** (5) — `getBreadcrumbs`, `APP_ROUTES`, `BreadcrumbResult`, `Crumb`, `SITE_URL`
- **apps/public/modules/about/components** (1) — `AboutContent`
- **apps/public/modules/about/constants** (2) — `ABOUT_VALUES`, `AboutValue`
- **apps/public/modules/blog/components** (4) — `BlogCard`, `FeaturedPost`, `BlogCardProps`, `FeaturedPostProps`
- **apps/public/modules/blog/utils** (2) — `getAllPosts`, `getPostBySlug`
- **apps/public/modules/calculator/components** (5) — `Calculator`, `Row`, `CalculatorSection`, `fmt`, `CalculatorFeatures`
- **apps/public/modules/calculator/utils** (2) — `simulate`, `simulateFromLiquido`
- **apps/public/modules/consent/components** (1) — `CookieConsent`
- **apps/public/modules/consent/constants** (1) — `CONSENT_KEY`
- **apps/public/modules/consent/hooks** (1) — `useCookieConsent`
- **apps/public/modules/contact/actions** (1) — `submitContactForm`
- **apps/public/modules/contact/components** (1) — `ContactContent`
- **apps/public/modules/faq/components** (1) — `FAQList`
- **apps/public/modules/faq/constants** (1) — `FAQ_ITEMS`
- **apps/public/modules/features/components** (2) — `FeaturesGrid`, `FeatureCard`
- **apps/public/modules/features/constants** (2) — `PRO_FEATURES`, `SHARED_FEATURES`
- **apps/public/modules/help/components** (1) — `HelpCategories`
- **apps/public/modules/help/constants** (1) — `HELP_CATEGORIES`
- **apps/public/modules/home/components** (4) — `FeaturesPreview`, `Hero`, `CTA`, `PricingTeaser`
- **apps/public/modules/home/constants** (1) — `HOME_FEATURES`
- **apps/public/modules/how-it-works/components** (2) — `HowItWorksSteps`, `HowItWorksPreview`
- **apps/public/modules/how-it-works/constants** (1) — `HOW_IT_WORKS_STEPS`
- **apps/public/modules/layout/components** (6) — `MobileMenu`, `Footer`, `Header`, `Providers`, `Container`, `ContainerProps`
- **apps/public/modules/layout/constants** (5) — `PLATFORM_URL`, `FOOTER_COLUMNS`, `NAV_LINKS`, `ANNOUNCEMENT`, `SOCIAL_LINKS`
- **apps/public/modules/legal/components** (1) — `LegalLayout`
- **apps/public/modules/newsletter/actions** (1) — `subscribeNewsletter`
- **apps/public/modules/newsletter/components** (1) — `NewsletterForm`
- **apps/public/modules/pricing/components** (7) — `PricingGrid`, `PricingCard`, `PricingFeatures`, `PricingComparison`, `collectFeatureAvailability`, `getBestDiscount`, `PricingTrialBar`
- **apps/public/modules/pricing/constants** (3) — `GENERATED_PRICING_PLANS`, `PRICING_TIERS`, `GENERATED_PRICING_UPDATED_AT`
- **apps/public/modules/problem-solution/components** (1) — `ProblemSolution`
- **apps/public/modules/problem-solution/constants** (2) — `PROBLEM_KEYS`, `SOLUTION_KEYS`
- **apps/public/modules/seo/components** (2) — `PageSEO`, `StructuredData`
- **apps/public/modules/seo/constants** (5) — `BRAND`, `DEFAULT_OG_IMAGE`, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION`, `TWITTER_HANDLE`
- **apps/public/modules/seo/utils** (9) — `constructMetadata`, `constructBlogPostingSchema`, `pageUrl`, `constructOrganizationSchema`, `constructSoftwareSchema`, `constructWebPageSchema`, `constructWebSiteSchema`, `constructBreadcrumbSchema`
- **apps/public/modules/testimonials/components** (1) — `TestimonialsGrid`
- **apps/public/modules/testimonials/constants** (3) — `TESTIMONIALS`, `TESTIMONIALS_HEADLINE`, `TESTIMONIALS_SUBHEADLINE`
- **packages/auth/src** (11) — `auth`, `getAuthUser`, `requireSession`, `getSession`, `requireAuthUser`, `handler`, `onUserCreated`, `getUserRole`
- **packages/db/scripts** (10) — `isLocalExecution`, `resolveCloudDatabaseUrl`, `resolveDatabaseUrl`, `getSql`, `main`, `printTable`, `applyTriggers`, `dropSchema`
- **packages/db/src** (129) — `db`, `users`, `organizations`, `subscriptions`, `usersRelations`, `commerceProviders`, `organizationMembers`, `commerceSubscriptions`
- **packages/email/scripts** (1) — `loadEnv`
- **packages/email/src** (13) — `emailT`, `resolveLocale`, `sendChangeEmailConfirmation`, `sendPasswordResetEmail`, `sendVerificationEmail`, `getEmailFrom`, `main`, `getResendClient`
- **packages/email/src/templates** (14) — `ChangeEmailTemplate`, `NotificationEmailTemplate`, `ResetPasswordTemplate`, `VerifyEmailTemplate`, `BaseLayout`, `ChangeEmailPreview`, `NotificationPreview`, `ResetPasswordPreview`
- **packages/eslint-config** (3) — `config`, `nextJsConfig`, `config`
- **packages/lib/api** (14) — `internalErrorResponse`, `unauthorizedResponse`, `badRequestResponse`, `successResponse`, `noContentResponse`, `notFoundResponse`, `validationErrorResponse`, `createdResponse`
- **packages/lib/formatters** (11) — `createFormatter`, `fmtUY`, `formatRelativeTime`, `formatDuration`, `fmtBRL`, `fmtUSD`, `formatCompactCurrencyFallback`, `formatLocaleDate`
- **packages/lib/settings** (8) — `siteConfig`, `ENABLED_SETTINGS_SECTIONS`, `DEFAULT_APP_RUNTIME_CONFIG`, `DEFAULT_FEATURE_FLAGS`, `isFeatureEnabled`, `isVercelAnalyticsEnabled`, `SETTINGS_SECTIONS`, `deriveAbbreviation`
- **packages/lib/utils** (5) — `handleFormInvalidLogs`, `getFieldError`, `isValidUUID`, `parseUserAgent`, `toNumber`
- **packages/storage/src/adapters** (14) — `R2Adapter`, `VercelBlobAdapter`, `getClient`, `prepareUpload`, `delete`, `getSignedDownloadUrl`, `publicUrl`, `put`
- **packages/storage/src/client** (1) — `uploadFile`
- **packages/storage/src/ports** (7) — `StorageProvider`, `delete`, `getSignedDownloadUrl`, `prepareUpload`, `publicUrl`, `put`, `UploadOptions`
- **packages/storage/src/server** (6) — `createProvider`, `StorageRouter`, `createStorageRouter`, `resolveProvider`, `for`, `FactoryOptions`
- **packages/ui/src/components** (234) — `Button`, `Badge`, `Skeleton`, `UserAvatar`, `DropdownMenuContent`, `DropdownMenu`, `DropdownMenuItem`, `DropdownMenuTrigger`
- **packages/ui/src/components/brand** (4) — `Logo`, `LogoIcon`, `LogoIconProps`, `LogoProps`
- **packages/ui/src/hooks** (1) — `useIsMobile`
- **packages/ui/src/lib** (1) — `cn`
- **scripts** (8) — `askIfMissing`, `extractOwnerFromRemote`, `main`, `parseArgs`, `run`, `sanitizeName`, `tryRun`, `usage`
