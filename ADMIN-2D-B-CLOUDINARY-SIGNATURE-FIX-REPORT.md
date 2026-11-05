# Admin-2D-B — Cloudinary Signature API 400 Error Investigation & Fix Report

## 1. Executive Summary

During testing of the Admin Media Manager, uploads were failing immediately prior to direct Cloudinary transmission with the UI displaying:
`Folder must be phukettours/tours`
and backend logs recording:
`POST /api/v1/admin/media/signature → HTTP 400`.

An investigation was conducted across frontend and backend contract implementations. The root cause was identified as a string mismatch where the frontend `MediaUploader` defaulted to sending `{ folder: "phuket/tours" }`, whereas the backend contract and validation strictly enforce the approved folder `phukettours/tours` (no slash between `phuket` and `tours`). Furthermore, the backend schema defines `folder` as optional so that the server remains the sole authority for upload destinations.

The frontend was corrected to omit client folder duplication by default (`{}`), use the server-controlled `phukettours/tours` when referencing constants, and all unit, integration, and build validations have verified 100% test pass rates across both repositories.

---

## 2. Root Cause Analysis

### Backend Configuration & Validation Contract
1. In `src/config/cloudinary.ts` (Backend):
   ```typescript
   export const CLOUDINARY_FOLDER = "phukettours/tours";
   ```
2. In `src/modules/media/mediaValidators.ts` (Backend):
   ```typescript
   export const createSignatureSchema = yup.object().shape({
     folder: yup
       .string()
       .optional()
       .test(
         "approved-folder",
         `Folder must be ${CLOUDINARY_FOLDER}`,
         (value) => !value || value === CLOUDINARY_FOLDER,
       ),
     publicId: yup
       .string()
       .optional()
       .test(
         "no-client-public-id",
         "Custom publicId is not permitted. Public IDs are strictly server-controlled.",
         (value) => value === undefined || value === null || value === "",
       ),
     batchSize: yup
       .number()
       .optional()
       .integer("batchSize must be an integer")
       .min(1, "batchSize must be at least 1")
       .max(MAX_BATCH_FILES, `batchSize cannot exceed ${MAX_BATCH_FILES}`),
   });
   ```
3. In `src/modules/media/mediaService.ts` (Backend):
   - The backend service strictly signs with `folder: CLOUDINARY_FOLDER` ("phukettours/tours").
   - The single-use JWT authorization token `uploadToken` is cryptographically bound to `folder: CLOUDINARY_FOLDER`.
   - The response payload returns `folder: CLOUDINARY_FOLDER`.

### Frontend Mismatch
In `src/features/admin/components/media/media-uploader.tsx` (Frontend):
- The component originally defined a default prop: `folder = "phuket/tours"`.
- When requesting an upload signature, it sent:
  ```typescript
  const sigResponse = await createSignature({ folder }).unwrap();
  ```
- Because `"phuket/tours"` has a slash between `phuket` and `tours` rather than `"phukettours/tours"`, the backend Yup validator evaluated `value === CLOUDINARY_FOLDER` as `false`.
- This triggered an immediate HTTP 400 response with message `"Folder must be phukettours/tours"`.

---

## 3. Contract Verification Checklist

| Question | Finding | Resolution |
| :--- | :--- | :--- |
| **1. Request Body Sent** | Frontend was sending `{ folder: "phuket/tours" }`. | Removed hardcoded default prop. Frontend now sends `{}` (or `{ folder }` only if explicitly provided). |
| **2. Folder Value Correctness** | Value was `"phuket/tours"`, which had an extraneous slash. | Aligned constant in `admin-media.ts` to `CLOUDINARY_APPROVED_FOLDER = "phukettours/tours"`. |
| **3. Validator Folder Requirement** | Backend validator has `folder: yup.string().optional()`. Client is NOT required to provide a folder. | Frontend now passes `{}` so backend can supply and dictate the approved server folder without redundant client duplication. |
| **4. Signature Generation Folder** | Backend `mediaService.ts` always signs with `CLOUDINARY_FOLDER` (`phukettours/tours`). | Backend signature matches the server-controlled folder regardless of client input. |
| **5. Response Contract Match** | Backend returns `{ signature, timestamp, apiKey, cloudName, folder, publicId, uploadUrl, maxFileSize, allowedFormats, uploadToken }`. | Fully matches `UploadSignatureResponseData` in frontend. Cloudinary direct upload receives this `folder` directly from the signature response. |

---

## 4. Security & Architectural Protections Preserved

1. **Server-Controlled Folder**:
   - `phukettours/tours` remains the sole approved server upload folder.
   - Client overrides to arbitrary folders continue to be rejected with HTTP 400.
2. **Server-Generated Unique Public IDs**:
   - Client is blocked from supplying a custom `publicId` (fails Yup validation).
   - Backend generates unique IDs using `tour_${Date.now()}_${randomUUID()}`.
3. **Overwrite Protection**:
   - `overwrite: false` is signed into the Cloudinary parameters and passed in the upload payload.
4. **Single-Use Cryptographic Upload Token**:
   - Confirmation endpoint requires `uploadToken` bound to the admin user ID, public ID, and folder.
   - Tokens are atomically consumed in a database transaction to prevent replay attacks.
5. **Role-Based Access Control**:
   - Non-admin roles (customer, agent, staff) and unauthenticated requests remain blocked (HTTP 401/403).

---

## 5. Files Changed

### Frontend (`/home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours`)

1. `src/features/admin/types/admin-media.ts`:
   - Added canonical export: `export const CLOUDINARY_APPROVED_FOLDER = "phukettours/tours";`.
2. `src/features/admin/components/media/media-uploader.tsx`:
   - Removed default prop `folder = "phuket/tours"`.
   - Updated signature generation call to send `createSignature(folder ? { folder } : {})`.
3. `src/features/admin/components/media/media-uploader.test.tsx`:
   - Updated test expectation to verify `mockCreateSignature` is invoked with `{}` by default.
4. `src/features/admin/components/media/admin-media-view.test.tsx`:
   - Updated mock media items and delete response fixtures to use `phukettours/tours`.
5. `src/features/admin/components/media/media-card.test.tsx`:
   - Updated mock fixture publicId and URLs from `phuket/tours` to `phukettours/tours`.
6. `src/features/admin/components/media/media-gallery-manager.test.tsx`:
   - Updated mock fixture publicId and URLs from `phuket/tours` to `phukettours/tours`.
7. `src/features/admin/utils/cloudinary-upload.test.ts`:
   - Aligned test mock signature data to `phukettours/tours`.
8. `src/features/admin/api/admin-media-api.test.ts`:
   - Aligned test mock response data to `phukettours/tours`.

### Backend (`/home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main`)
- Validated that backend code in `src/config/cloudinary.ts`, `src/modules/media/mediaValidators.ts`, `src/modules/media/mediaController.ts`, and `src/modules/media/mediaService.ts` is robust and correctly enforces all contracts. No backend changes were necessary as the backend was already behaving correctly according to spec.

---

## 6. Verification Results

### 1. Focused Media Tests
- **Frontend Media Tests**:
  - `src/features/admin/components/media/media-card.test.tsx` (5/5 passed)
  - `src/features/admin/components/media/media-gallery-manager.test.tsx` (6/6 passed)
  - `src/features/admin/components/media/media-uploader.test.tsx` (7/7 passed)
  - `src/features/admin/components/media/admin-media-view.test.tsx` (7/7 passed)
  - `src/features/admin/utils/cloudinary-upload.test.ts` (7/7 passed)
  - `src/features/admin/api/admin-media-api.test.ts` (4/4 passed)
  - **Result: 6 test suites passed, 36 tests passed (100%)**
- **Backend Media Tests**:
  - `src/modules/media/tests/integration/mediaRoutes.test.ts` (26/26 passed)
  - `src/modules/media/tests/unit/mediaService.test.ts` (26/26 passed)
  - **Result: 2 test suites passed, 52 tests passed (100%)**

### 2. Full Test Suites
- **Frontend Full Test Suite**:
  - **54 test suites passed (54/54)**
  - **338 tests passed (338/338)**
- **Backend Full Test Suite**:
  - **31 test suites passed (31/31)**
  - **603 tests passed (603/603)**

### 3. Type Checking & Code Quality
- **Frontend Typecheck (`npm run typecheck`)**: 0 errors
- **Frontend Linter (`npm run lint`)**: 0 errors
- **Backend TypeScript Build (`prisma generate && tsc`)**: 0 errors
- **Frontend Next.js Production Build (`npm run build`)**: 
  - Compiled successfully in 2.7s
  - 22/22 routes prerendered without errors

---

## 7. Status

Admin-2D-B Cloudinary Signature API 400 error investigation and fix is **COMPLETE**.
All security invariants and contracts are strictly preserved.
We do not proceed to Admin-2D-C until directed.
