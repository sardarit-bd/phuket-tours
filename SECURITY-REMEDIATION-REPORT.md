# Security Remediation Report (Phase A)

**Incident Title:** Reintroduced Malicious `api.js` and PostCSS Backdoor Loader  
**Project:** PhuketTours (Next.js Frontend)  
**Branch:** `div-v4` (Remediated locally)  
**Date:** November 1, 2026  
**Status:** Remediated & Verified on `div-v4` (Awaiting Review Before Push)  

---

## 1. Confirmed Root Cause

A prior security cleanup (commit `7ea3093`, Oct 27, 2026) deleted `api.js` and sanitized `package.json`. However:
1. Commit `84050da` (`Merge pull request #5 from sardarit-bd/div-v3`), pushed to remote `main`, reintroduced the malicious `api.js`, modified `package.json`, and injected a hidden duplicate payload into `postcss.config.mjs`.
2. As a result, remote `origin/main` contained the malware.
3. When `origin/main` was merged into `div-v4` (merge commit `7829b2c`, Nov 1, 2026), Git performed a 3-way merge against the common ancestor (`6f819f0`). Because `div-v4` had not modified these files since branching, Git cleanly pulled in the incoming additions and modifications from `origin/main`, outputting:
   ```text
   create mode 100644 api.js
   ```

---

## 2. Malicious File Investigation & Technical Threat Summary

The root-level `api.js` and the hidden payload appended to `postcss.config.mjs` operate as an advanced multi-stage backdoor loader:

* **Evasion & Obfuscation:** Uses Unicode escapes, reversed built-in names (`"edon"` -> `"node"`, `"epip"` -> `"pipe"`, `"TEG"` -> `"GET"`), bitwise XOR dummy arithmetic, and concealed detached subprocess execution (`windowsHide: true, detached: true`).
* **Dead Drop Resolver (DDR) via Blockchain:** Queries decentralized Ethereum JSON-RPC nodes (`eth.drpc.org`, `ethereum-rpc.publicnode.com`, `1rpc.io/eth`, etc.) and Blockscout block explorer indexers to locate transactions sent by a hardcoded threat-actor Ethereum address:
  `0x1eEf0849EDa15d87f64e51C73C8442Cf3c8bCEF3`
* **C2 Extraction:** Extracts the 8-byte destination address of recent transactions and decodes them into two external IPv4 addresses.
* **Encrypted Payload Retrieval:** Issues HTTP requests to the resolved IP on ports 80/443 (`/0x/cls`, `/0x/ls`) spoofing a Windows Chrome User-Agent, and decrypts the response using a multi-byte XOR key (`q4FZkxX{!h,Sr3=@`).
* **Execution & In-Memory Persistence:** Directly evaluates the decrypted payload via `eval()` and spawns a background detached Node.js REPL (`node -i`) with standard input unreferenced from the parent process.

---

## 3. Exact Files Cleaned & Specific Modifications

### A. Deleted: `phuket-tours/api.js`
* **Action:** Permanently deleted the 21,836-byte root-level malicious script.

### B. Modified: `phuket-tours/package.json`
* **Action:** Restored the hijacked scripts to standard Next.js lifecycle commands:
```diff
   "scripts": {
-    "dev": "node api.js && next dev",
-    "build": "node api.js && next build --webpack",
-    "start": "node api.js && next start",
+    "dev": "next dev",
+    "build": "next build --webpack",
+    "start": "next start",
     "lint": "eslint",
     "test": "vitest run",
     "test:watch": "vitest",
     "test:coverage": "vitest run --coverage",
     "typecheck": "tsc --noEmit"
   },
```

### C. Modified: `phuket-tours/postcss.config.mjs`
* **Action:** Stripped the `createRequire` CommonJS loader and the 22,690-byte obfuscated backdoor appended after line 12 behind massive tab padding.
* **Clean File Content Restored (94 bytes):**
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### D. Process & Host Remediation
* **Action:** Terminated active rogue background process (PID `26547` running detached Node.js payload communicating with `/0x/cls`). Process table and user crontab verified clean.

---

## 4. Repository-Wide Security Inspection Findings

| Check / Search Vector | Scope | Result | Status |
| :--- | :--- | :--- | :--- |
| `api.js` references | Entire repository | Only found in legitimate bundled package `node_modules/zod/v4/core/api.js` | CLEAN |
| `child_process` usage | `src/`, `scripts/`, configs | 0 occurrences | CLEAN |
| `eval()` usage | `src/`, `scripts/`, configs | 0 occurrences | CLEAN |
| Unicode escape patterns (`\u00`) | `src/`, configs | 0 occurrences | CLEAN |
| Wallet address / C2 strings | Entire repository | 0 occurrences | CLEAN |
| Startup / Lifecycle hooks | `package.json` | No `preinstall`, `postinstall`, or `prepare` hooks | CLEAN |
| `next.config.ts` | Root config | Standard Turbopack rule configuration (265 bytes) | CLEAN |
| `eslint.config.mjs` | Root config | Standard ESLint flat config (484 bytes) | CLEAN |

---

## 5. Security & Build Verification Results

### 1. `npm run typecheck`
* **Command:** `tsc --noEmit`
* **Result:** **PASSED** (Exit code `0`). Zero TypeScript compilation errors.

### 2. `npm run lint`
* **Command:** `eslint`
* **Result:** **PASSED** (Exit code `0`). 0 errors, 9 non-blocking warnings (standard Next.js `<img>` vs `<Image />` suggestions and 4 unused variables from commented-out filter sections).

### 3. `npm run build`
* **Command:** `next build --webpack`
* **Result:** **PASSED** (Exit code `0`).
  * Webpack compiled successfully in 6.2s.
  * TypeScript typecheck passed in 3.4s.
  * Static pages generated cleanly (22/22 routes).
  * No execution of `api.js` occurred during build.
  * PostCSS compiled styles with `@tailwindcss/postcss` without executing any secondary payloads.

### 4. `npm run test -- --run`
* **Command:** `vitest run`
* **Result:** 51 test suites passed, 3 failed (334 passed, 4 failed).
* **Investigation of the 4 test failures:**
  * Failures occurred in:
    * `src/features/tours/components/tour-filters-sidebar.test.tsx` (1 test)
    * `src/app/tours/page.test.tsx` (1 test)
    * `src/features/tours/components/tour-category-tabs.test.tsx` (2 tests)
  * **Root Cause of Test Failures:** In commit `12b785b` (`fix: something added`, authored by `shahinsamiur` on `origin/main` and merged via `7829b2c`), `tourTypeGroup` and `durationGroup` were commented out in `src/features/tours/components/tour-filters-sidebar.tsx`, and category options were commented out in `src/features/tours/data/tours-data.ts`. The tests failed because they expect those UI elements to be rendered.
  * **Strict Constraint Compliance:** In accordance with the project restrictions ("Do not change existing business logic", "Do not overwrite other developers' legitimate work"), these UI changes were preserved and not altered during this security remediation.

---

## 6. Remaining Security Risks

1. **Upstream Contamination on `origin/main`:** Remote branch `origin/main` still contains `api.js`, the infected `package.json`, and the infected `postcss.config.mjs`. Any developer merging `origin/main` into their feature branch will reintroduce the malware until `main` is sanitized.
2. **Credential Exposure Window:** Because the malware was active between the merge of `origin/main` and this remediation, any environment variables or API keys (e.g. Cloudinary credentials, backend secrets) stored locally in `.env.local` during that time window should be treated as potentially compromised and rotated.
3. **Other Branches:** Remote branches `origin/div-v3`, `origin/dev-v1`, and `origin/dev-v2` may also contain historical references to `api.js` and should be reviewed prior to future merges.

---

## 7. Recommended Phase B Cleanup for `main`

To permanently prevent the malware from resurfacing across the team:

1. **Sanitize `main` Directly:**
   * Create a dedicated security remediation pull request or commit on `main` that applies the identical three fixes:
     * `git rm api.js`
     * Restore `package.json` scripts (`"dev": "next dev"`, `"build": "next build --webpack"`, `"start": "next start"`).
     * Sanitize `postcss.config.mjs` to remove the appended backdoor payload.
2. **Implement CI Merge Protection Guardrail:**
   * Add a GitHub Actions security workflow step in `.github/workflows/security-guardrail.yml`:
     ```yaml
     name: Security File Guardrail
     on: [push, pull_request]
     jobs:
       audit:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v4
           - name: Verify No Root api.js
             run: |
               if [ -f api.js ]; then
                 echo "CRITICAL: Malicious root-level api.js detected!"
                 exit 1
               fi
           - name: Audit Configuration Files
             run: |
               if grep -E "child_process|spawnNodeScript|eval\(" postcss.config.mjs eslint.config.mjs next.config.ts; then
                 echo "CRITICAL: Suspicious code detected in build configurations!"
                 exit 1
               fi
     ```
3. **Branch Protection:**
   * Require PR status checks on `main` so any commit reintroducing `api.js` is automatically rejected by CI before merging.
