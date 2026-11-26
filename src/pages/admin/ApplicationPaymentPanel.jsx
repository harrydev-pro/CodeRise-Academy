import { useState } from "react";

import Button from "../../components/common/Button";
import { SelectField, StatusBadge, TextArea, TextField } from "../../components/ui";
import { api } from "../../services/api/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ADMIN_PAYMENT_STATUSES, getApplicationPayment } from "../../utils/applicationPayment";

// Payment section inside an application review. Shows what the student has paid
// (through Paystack or recorded by an admin) and lets an admin record a payment
// made another way, waive the fee, or reset it to unpaid.
export default function ApplicationPaymentPanel({ application, saving, act }) {
  const payment = getApplicationPayment(application);
  const [status, setStatus] = useState(payment.status === "waived" || payment.status === "successful" ? payment.status : "successful");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const rows = [
    ["Amount due", formatCurrency(payment.amount, payment.currency)],
    ["Reference", payment.reference],
    ["Method", payment.method === "manual" ? "Recorded by an admin" : payment.method ? payment.method.replace(/_/g, " ") : ""],
    ["Paid on", payment.paidAt ? formatDate(payment.paidAt) : ""],
  ].filter(([, value]) => value);

  const paystackPaid = payment.status === "successful" && payment.method !== "manual" && payment.reference;
  const studentCanPay = application.status === "Approved" && !payment.settled;

  function submit(event) {
    event.preventDefault();
    act(
      () => api.patch(`/admin/applications/${application.id}/payment`, { status, reference: reference.trim(), note: note.trim() }),
      status === "successful" ? "Payment recorded. The student was notified."
        : status === "waived" ? "Fee waived. The student was notified."
          : "Payment reset to unpaid.",
    ).then((saved) => { if (saved) { setReference(""); setNote(""); } });
  }

  return (
    <div className="ui-form">
      <div className="ui-card-header">
        <h3>Payment</h3>
        <StatusBadge status={payment.amount > 0 ? payment.label : "No fee"} />
      </div>
      <dl>{rows.map(([label, value]) => <div className="application-detail-row" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {payment.amount <= 0 ? (
        <p className="ui-hint">This program is free, so there is nothing to pay.</p>
      ) : (
        <>
          <p className="ui-hint">
            {studentCanPay
              ? "The student can pay now from My Applications using Paystack."
              : payment.settled
                ? "Nothing more is owed on this application."
                : "The student can pay once you set this application to “Approved”."}
          </p>
          {paystackPaid ? (
            <p className="ui-hint">Paid online through Paystack. Refunds are handled in the Paystack dashboard.</p>
          ) : (
            <form className="ui-form" onSubmit={submit}>
              <SelectField label="Record payment" value={status} onChange={setStatus} options={ADMIN_PAYMENT_STATUSES} />
              {status === "successful" && (
                <TextField label="Receipt or transfer reference (optional)" value={reference} onChange={setReference} placeholder="e.g. bank transfer ID" />
              )}
              <TextArea label="Note (admins only)" rows={2} value={note} onChange={setNote} hint="For example: paid by bank transfer on 12 May." />
              <div className="ui-form-actions"><Button type="submit" variant="outline" loading={saving}>Save payment</Button></div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
