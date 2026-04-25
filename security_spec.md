# Security Specification - Pintor PRO Calc

## 1. Data Invariants
- An estimate or appointment must always be linked to a valid `uid`.
- CPFs must be unique per user and are immutable once registered.
- User roles (admin) cannot be self-assigned.
- Timestamps (`createdAt`, `updatedAt`) must use server time.

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing**: An authenticated user `USER_A` tries to create an estimate with `uid: "USER_B"`.
   - Result: `PERMISSION_DENIED`
2. **Privilege Escalation**: A user tries to set `role: "admin"` during registration or update.
   - Result: `PERMISSION_DENIED`
3. **Resource Poisoning**: A user tries to create a document with a 1MB string as an ID.
   - Result: `PERMISSION_DENIED` (handled by `isValidId`)
4. **CPF Hijacking**: User A tries to register a CPF already used by User B.
   - Result: `PERMISSION_DENIED` (path already exists or logic mismatch)
5. **PII Leak**: A guest user tries to list the `users` collection to find emails.
   - Result: `PERMISSION_DENIED` (no list on users for guests)
6. **State Shortcutting**: A user tries to update an estimate's `createdAt` timestamp.
   - Result: `PERMISSION_DENIED` (immutable field)
7. **Orphaned Writes**: Creating an estimate for a non-existent professional (in client mode).
   - Result: `PERMISSION_DENIED` (via `exists()` check)
8. **Shadow Fields**: Adding `isVerified: true` to a user document update.
   - Result: `PERMISSION_DENIED` (via `affectedKeys().hasOnly()`)
9. **Denial of Wallet**: A script tries to write 1000 estimates per second.
   - Result: Handled by Firebase Quotas + Rule complexity (evaluation order).
10. **Query Scoping Check**: A user tries to query `collection('estimates')` without a `where('uid', '==', user.uid)` filter.
    - Result: `PERMISSION_DENIED` (Query Enforcer pillar)
11. **Negative Price Injection**: Setting `totalCost: -100` on an estimate.
    - Result: `PERMISSION_DENIED` (isValidEstimate)
12. **Future Timestamping**: Sending a `createdAt` 1 year in the future.
    - Result: `PERMISSION_DENIED` (server timestamp enforcement)

## 3. Implementation Checklist
- [ ] `isValidId` for all document IDs.
- [ ] `isValidEntity` for all writes.
- [ ] `isAdmin` hardened with `exists()` check.
- [ ] `affectedKeys().hasOnly()` on all updates.
- [ ] Relational owner checks on all documents.
