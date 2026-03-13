# 🚀 QUICK START: Autonomous PR Merge

**Status:** ✅ Setup complete. Ready to merge 13+ PRs.

---

## 30-Second Launch

### In VS Code:
1. Open **Chat panel** (Cmd+I on Mac)
2. Switch to **Agent** mode (toggle at top)
3. **Paste this:**

```
Execute: chmod +x ./scripts/copilot/automerge_prs.sh && ./scripts/copilot/automerge_prs.sh

Rebase and auto-merge all open PRs to strict-no-console. 
If conflict/failure, fix in code and rerun. 
Log: ./docs/planning/merge/PR_MERGE_AUTOPILOT_LOG.md
```

4. **Hit Enter** → Copilot runs autonomously (no confirmations)

---

## Or: Manual Terminal

```bash
cd /Users/frisowempehomefolder/Documents/isa_web_clean
./scripts/copilot/automerge_prs.sh
```

---

## Expected Output

✅ **Success state:**
```
Using default branch: strict-no-console
----
Processing PR #217...
- status: AUTO_MERGE_ENABLED
...
DONE: processed all open PRs (auto-merge enabled).
```

✅ **Log created at:** `./docs/planning/merge/PR_MERGE_AUTOPILOT_LOG.md`

---

## If It Stops (Exit Code 1)

| Error | Action |
|-------|--------|
| Conflict | Fix file, `git add . && git commit`, rerun |
| Lint fail | `pnpm lint --fix && git add . && git commit`, rerun |
| Test fail | Fix code, `pnpm test`, `git commit`, rerun |

**Then rerun:** `./scripts/copilot/automerge_prs.sh`

---

## Full Documentation

- **Overview:** `00_AUTONOMY_SETUP_INDEX.md`
- **Full guide:** `docs/planning/merge/COPILOT_AUTONOMY_GUIDE.md`
- **Setup details:** `SETUP_COMPLETE.md`

---

**GitHub Auth:** ✅ Ready  
**Open PRs:** 13+  
**Default Branch:** strict-no-console  
**Go:** 🚀
