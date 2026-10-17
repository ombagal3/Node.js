# Bulletproof Brands CRM — 3 Touch Follow-up Workflow

## New Lead
When a lead is created, the CRM automatically creates four workflow queue entries:

1. **Call Center:** `FU1` call with status `PENDING`.
2. **Meetings:** a pending meeting queue entry waiting for the call outcome.
3. **Follow-ups:** `FU1 Pending`, due immediately until the first call is completed.
4. **Proposals:** an automatic placeholder marked `Pending Queue`.

## Call Outcome Rules

### No Answer / Call Not Received
- Current call becomes `CALLED` with outcome `No Answer`.
- Current follow-up is completed in history.
- CRM automatically creates **FU2 Pending**.
- Default next date: **+1 day**.

### Busy / Call Later
- Current call is saved.
- CRM creates the next follow-up.
- Default next date: **+1 day**.

### Customer Asked for 2–3 Days / Connected — Follow-up Needed
- Current call is saved.
- CRM creates the next follow-up.
- Default next date: **+3 days**.

### Interested — Move to Next Step
- Lead moves to **Qualified**.
- Current follow-up is completed.
- Meeting queue becomes **Ready to Schedule**.
- Proposal placeholder becomes **Ready to Create**.
- No additional follow-up call is created at that moment.

### Not Interested — Close Deal
- Lead moves to **Lost / Closed** with reason `Not Interested`.
- Open follow-ups stop.
- Meeting queue closes.
- Proposal queue closes.
- Full call/follow-up history remains available.

## Three Touchpoints

`FU1 → FU2 → FU3`

After `FU3` is attempted without interest, the CRM stops creating additional automatic calls and asks the employee for a final decision:

`Nurture / Lost / Custom Follow-up`

The CRM never decides customer interest by itself; employees select the actual outcome.
