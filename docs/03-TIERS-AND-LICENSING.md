# TaskCycle Tiers & Licensing

> **Three tiers, one codebase.** Tiers are a licensing concern enforced by a single gate — never a fork of
> the architecture and never `if (isPro)` scattered through features. Everything is local-first; only the
> Online tier touches a network, and it's deferred.

---

## 1. The tiers

| Tier | Price model | Routines | Saving | Pro features | Network |
|------|-------------|----------|--------|--------------|---------|
| **Free** | Free | **≤ 3** | Locked beyond 3 routines | ❌ | None |
| **Pro** | **One-time purchase** | Unlimited | Unlimited | ✅ all, **local** | None |
| **Online** *(deferred)* | **Subscription**, Pro-only add-on | Unlimited | Unlimited + cloud | ✅ + sync + teams | Required |

### Free — exact behavior
- Can **create and use** routines freely up to **3**.
- A 4th+ routine can be *created and used in-session*, but **saving is locked** — the gate blocks persistence
  of routines beyond the free limit (and blocks saving edits to them). This is the "try it, buy to keep it"
  funnel.
- All core engine features (cycles, recurring, themes, basic stats, milestones) are available within the limit.
- Reading/importing `.mcyc` and `.tcyc` works; native save is subject to the routine limit.

### Pro — exact behavior
- **One-time purchase.** Everything unlocked, **fully local, fully offline.** No account, no telemetry.
- Unlimited routines + saving, all Pro modules (tools, task types, subtasks, full stats, PDF export).

### Online — deferred (designed-for, not built)
- **Subscription**, available **only to Pro users**, layered on top of the Pro entitlement.
- Adds cloud sync + team/collaboration features.
- Lands as a **sync adapter behind the `AppState` storage boundary** — no rewrite of Pro. See §6.

---

## 2. Architecture: one source of truth, declarative gates

```
licensing/
├── licenseState.js     # resolves and holds the active tier (the single source of truth)
├── licenseVerify.js    # offline verification of a Pro license key
├── tierGate.js         # declarative capability map + can()/promptUpgrade()
└── upgradeUI.js        # upgrade/unlock modal, license entry, restore
```

### 2.1 `licenseState` — the source of truth
Resolves tier at boot (Phase 1, before features wire) and exposes it via DI. Built on miniCycle's existing
`FeatureFlags` concept in `core/appGlobalState.js`, but **license-derived** rather than milestone-derived:

```javascript
// resolved once, injected everywhere
licenseState = {
  tier: "free" | "pro" | "online",
  proLicenseValid: boolean,
  source: "none" | "localKey" | "subscription",
}
```

### 2.2 `tierGate` — declarative capability map
Features never check the tier directly. They ask the gate about a **capability**:

```javascript
const CAPABILITIES = Object.freeze({
  "routine.createBeyondFreeLimit": ["pro", "online"],
  "routine.saveBeyondFreeLimit":   ["pro", "online"],
  "task.subtasks":                 ["pro", "online"],
  "task.types.extended":           ["pro", "online"],
  "tools.timer":                   ["pro", "online"],
  "tools.stopwatch":               ["pro", "online"],
  "tools.counter":                 ["pro", "online"],
  "tools.notes":                   ["pro", "online"],
  "stats.fullDashboard":           ["pro", "online"],
  "export.pdf":                    ["pro", "online"],
  "sync.cloud":                    ["online"],
  "team.collaboration":            ["online"],
});

tierGate.can("tools.timer")            // → boolean, based on licenseState.tier
tierGate.promptUpgrade("tools.timer")  // → opens upgradeUI with the right context
```

The free routine cap itself is a `LIMITS` constant (miniCycle convention): `LIMITS.FREE_ROUTINE_MAX = 3`.

### 2.3 Usage pattern (everywhere gating is needed)
```javascript
// e.g. in routine creation / save path
if (routineCount >= LIMITS.FREE_ROUTINE_MAX && !this.deps.tierGate.can("routine.saveBeyondFreeLimit")) {
    return this.deps.tierGate.promptUpgrade("routine.saveBeyondFreeLimit");
}
```

One gate, one capability map, zero scattered tier checks. Adding a Pro feature = add one capability key.

---

## 3. Offline Pro license verification

**Reality:** any fully-offline license is crackable. We optimize for **honest users + privacy**, not
unbreakable DRM. The goal is a license that works forever offline, with no phone-home.

### Recommended approach — signed offline key
1. You hold a private key (kept server-side / in your release tooling).
2. On purchase, you issue a **license key** = a signed token binding minimal info
   (e.g. license id + product `taskcycle-pro` + issue date). No personal data required.
3. The app ships the corresponding **public key** and verifies the signature **locally** in `licenseVerify.js`.
   Valid signature → `tier = "pro"`, persisted to local storage (and IndexedDB backup via `backupManager`).
4. Verification is **fully offline** and runs at every boot. No network, ever, for Pro.

**Deliberately NOT doing:**
- No hardware fingerprinting / activation servers (privacy-hostile, breaks offline-first).
- No aggressive anti-piracy (punishes honest users; out of step with the brand).
- No telemetry on license state.

**Edge cases to handle:** corrupted/edited key → fall back to Free gracefully with a clear message; key
restore (re-entry) flow in `upgradeUI`; keep a key backup so a localStorage clear doesn't strand a paying user.

---

## 4. Where gates are applied (inventory)

| Gate point | Capability | Free behavior |
|------------|------------|---------------|
| Create routine #4+ | `routine.createBeyondFreeLimit` | allowed in-session, save blocked |
| Save routine beyond limit / edits to it | `routine.saveBeyondFreeLimit` | blocked → upgrade prompt |
| Add subtask | `task.subtasks` | control hidden/disabled → upgrade prompt |
| Choose non-standard task type | `task.types.extended` | only "standard" offered |
| Open any tool (timer/stopwatch/counter/notes) | `tools.*` | tool entry shows upgrade prompt |
| Open full stats dashboard | `stats.fullDashboard` | basic `statsPanel` only |
| Export PDF | `export.pdf` | option shows upgrade prompt |
| (Online) sync / teams | `sync.cloud`, `team.collaboration` | not present until Online ships |

All prompts route through `upgradeUI` and use `getLabel()` strings (`tier.*`, `upgrade.*`).

---

## 5. Boot integration

- `licenseState` resolves in **Phase 1** (coreBoot) so it's available before features wire in Phase 2.
- `tierGate` is wired in `featureBoot.js` and injected into every gated module via manifests
  (`requires: ['tierGate']`).
- `upgradeUI` follows miniCycle's modal patterns (registered in `modalRegistry`, full listener cleanup).

---

## 6. Online tier — deferred but designed-for

The reason we do the storage boundary cleanly now: **Online must not require rebuilding Pro.**

- All persistence already flows through `AppState.update` → storage. Online adds a **sync adapter** behind
  that boundary (local writes mirror to cloud; remote changes merge into `AppState`). Feature code is unchanged.
- Entitlement: `licenseState` gains `source: "subscription"` and `tier: "online"`, gated to users who already
  hold a valid Pro license. Subscription validation is the *only* networked check in the product.
- Team/collaboration UI is net-new surface, additive — not a refactor of Pro.

**Not in scope now.** Listed so today's decisions (gate map keys `sync.cloud`/`team.collaboration` reserved,
storage boundary respected) keep the door open without building it.

---

## 7. Test coverage (Phase 3 exit criteria)

- [ ] Fresh install resolves to **Free**.
- [ ] Free enforces `FREE_ROUTINE_MAX`: 4th routine usable in-session, save blocked, upgrade prompt shown.
- [ ] Valid Pro key → `tier = "pro"`, all `tierGate.can(...)` Pro capabilities true.
- [ ] Pro persists across reload and verifies **with no network**.
- [ ] Corrupted/tampered key → graceful fallback to Free with clear messaging.
- [ ] Key restore/re-entry flow works; key survives a localStorage clear via backup.
- [ ] `tierGate.can()` returns correct booleans for every capability across all three tiers (table-driven).
- [ ] No Pro feature is reachable in Free except through the upgrade prompt.
