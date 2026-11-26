# Program application payments: backend contract

Students pay a program fee **after** an admin sets their application to `Approved`.
The frontend expects the endpoints and fields below. They follow the existing
video-course Paystack flow (`/payments/paystack/initialize/course/:id` and
`/payments/paystack/verify`).

Payment status values: `unpaid`, `pending`, `successful`, `failed`, `waived`
(`paid` and `abandoned` are also accepted and treated as `successful` / `failed`).

## 1. Payment info on applications

Include `payment` on each application returned by:

- `GET /applications/me` (student)
- `GET /admin/applications` (admin list, also used for the payment badge)
- `GET /admin/applications/:id` (admin detail)

```json
"payment": {
  "status": "unpaid",
  "amount": 120000,
  "currency": "NGN",
  "reference": "PSK-123",
  "method": "paystack",
  "paidAt": "2026-11-06T09:00:00Z"
}
```

`amount` is the fee locked in when the student applied (use the price snapshot).
`method` is `paystack` or `manual`. If `payment` is missing, the frontend treats
the application as `unpaid` and uses its price fields for the amount.

`GET /admin/applications` should also accept `?paymentStatus=unpaid|pending|successful|failed|waived`.

## 2. Student starts checkout

`POST /payments/paystack/initialize/application/:applicationId` → `{ "authorizationUrl": "https://checkout.paystack.com/..." }`

The server must check all of these and refuse otherwise:

- the application belongs to the signed-in student,
- its status is `Approved`,
- it is not already `successful` or `waived`,
- the amount comes from the server, never from the request.

Use the same Paystack `callback_url` as courses (`/payments/return`); adding
`?type=application` is optional and helps the return page before verify finishes.

## 3. Verify after Paystack returns

The existing `GET /payments/paystack/verify?reference=...` should return, for program payments:

```json
{ "payment": { "status": "successful", "type": "application", "applicationId": "APP-002", "programTitle": "Product Design" } }
```

When it succeeds, set the application's payment to `successful` and notify the student.
The Paystack webhook should do the same, so a payment is recorded even if the student closes the tab.

## 4. Admin records a payment manually

`PATCH /admin/applications/:id/payment` with body
`{ "status": "successful" | "waived" | "unpaid", "reference": "", "note": "" }`

Use this for bank transfers, cash, scholarships or corrections. Store `method: "manual"`,
log it in the application history and activity log, and notify the student.
Refuse to change a payment that Paystack has already confirmed (refunds happen in Paystack).

## 5. Admin payments list

`GET /admin/payments?status=&type=application|course&q=&page=` →

```json
{
  "payments": [{ "id": "PAY-1", "type": "application", "applicationId": "APP-002", "courseId": null,
    "userId": 3, "studentName": "Bola Student", "email": "bola@example.com", "programTitle": "Product Design",
    "amount": 120000, "currency": "NGN", "status": "successful", "reference": "PSK-123",
    "method": "paystack", "recordedBy": null, "paidAt": "2026-11-06T09:00:00Z", "createdAt": "2026-11-06T08:58:00Z" }],
  "summary": { "collected": 120000, "paidApplications": 1, "awaitingPayment": 0, "failed": 0 },
  "statusCounts": { "successful": 1 },
  "pagination": { "page": 1, "totalPages": 1, "total": 1 }
}
```

`awaitingPayment` is the number of `Approved` applications with an `unpaid` payment.
