"use client";

import * as React from "react";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadQueueItem, MediaItem } from "../../types/admin-media";
import {
  validateMediaFile,
  formatBytes,
  uploadToCloudinaryWithProgress,
  MAX_BATCH_SIZE,
} from "../../utils/cloudinary-upload";
import {
  useCreateUploadSignatureMutation,
  useConfirmUploadedMediaMutation,
} from "../../api/admin-media-api";

export interface MediaUploaderProps {
  onUploadSuccess?: (item: MediaItem) => void;
  folder?: string;
}

export function MediaUploader({
  onUploadSuccess,
  folder,
}: MediaUploaderProps) {
  const [createSignature] = useCreateUploadSignatureMutation();
  const [confirmMedia] = useConfirmUploadedMediaMutation();

  const [queue, setQueue] = React.useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [backendConfigWarning, setBackendConfigWarning] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Active in-flight upload trackers to prevent duplicate concurrent runs
  const activeUploadsRef = React.useRef<Set<string>>(new Set());

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [queue]);

  const addFilesToQueue = (files: FileList | File[]) => {
    setBackendConfigWarning(null);
    const newItems: UploadQueueItem[] = [];
    const remainingSlots = MAX_BATCH_SIZE - queue.length;

    if (remainingSlots <= 0) {
      alert(`Maximum batch size is ${MAX_BATCH_SIZE} images. Please upload or clear existing items.`);
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingSlots);

    for (const file of filesArray) {
      const validation = validateMediaFile(file);
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let previewUrl = "";
      try {
        previewUrl = URL.createObjectURL(file);
      } catch {
        previewUrl = "";
      }

      newItems.push({
        id,
        file,
        previewUrl,
        status: validation.valid ? "queued" : "error",
        progress: 0,
        error: validation.valid ? undefined : validation.error,
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
      // Reset input value so same files can be re-selected if removed
      e.target.value = "";
    }
  };

  const removeQueueItem = (id: string) => {
    // If upload is in flight, ignore remove
    if (activeUploadsRef.current.has(id)) return;

    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const processUploadItem = async (item: UploadQueueItem) => {
    if (activeUploadsRef.current.has(item.id)) return;
    activeUploadsRef.current.add(item.id);

    // Update status to requesting signature
    setQueue((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: "requesting_signature", progress: 5, error: undefined }
          : i
      )
    );

    try {
      // 1. Request signature from backend
      // Folder is server-controlled ('phukettours/tours'); client does not need to duplicate it unless explicitly overridden
      const sigResponse = await createSignature(folder ? { folder } : {}).unwrap();

      if (!sigResponse.success || !sigResponse.data) {
        throw new Error(sigResponse.message || "Failed to generate upload signature.");
      }

      const sigData = sigResponse.data;

      // 2. Upload directly to Cloudinary with progress tracking
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "uploading", progress: 15 } : i
        )
      );

      const cldResponse = await uploadToCloudinaryWithProgress(
        item.file,
        sigData,
        (progressPercent) => {
          setQueue((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    progress: Math.min(Math.round(15 + (progressPercent * 0.7)), 85),
                  }
                : i
            )
          );
        }
      );

      // 3. Confirm with backend
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "confirming", progress: 90 } : i
        )
      );

      const confirmResponse = await confirmMedia({
        publicId: cldResponse.public_id || sigData.publicId,
        uploadToken: sigData.uploadToken,
        assetId: cldResponse.asset_id,
      }).unwrap();

      if (!confirmResponse.success || !confirmResponse.data) {
        throw new Error(confirmResponse.message || "Failed to confirm media asset.");
      }

      // Mark success
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "success",
                progress: 100,
                result: confirmResponse.data,
              }
            : i
        )
      );

      if (onUploadSuccess) {
        onUploadSuccess(confirmResponse.data);
      }
    } catch (err: unknown) {
      const errorObj = err as {
        status?: number;
        data?: { message?: string };
        message?: string;
      };

      let errorMsg =
        errorObj?.data?.message ||
        errorObj?.message ||
        "Upload failed. Please check network connection.";

      // Check for HTTP 503 Cloudinary not configured
      if (
        errorObj?.status === 503 ||
        errorMsg.toLowerCase().includes("cloudinary is not configured")
      ) {
        errorMsg = "Cloudinary is not configured on backend. Uploads will be enabled once live credentials are set.";
        setBackendConfigWarning(
          "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured in backend .env. Media uploads are currently running in unconfigured mode."
        );
      }

      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "error", error: errorMsg, progress: 0 }
            : i
        )
      );
    } finally {
      activeUploadsRef.current.delete(item.id);
    }
  };

  const uploadAllQueued = async () => {
    const queuedItems = queue.filter(
      (item) => item.status === "queued" || item.status === "error"
    );
    for (const item of queuedItems) {
      await processUploadItem(item);
    }
  };

  const queuedCount = queue.filter((i) => i.status === "queued").length;
  const inProgressCount = queue.filter(
    (i) =>
      i.status === "requesting_signature" ||
      i.status === "uploading" ||
      i.status === "confirming"
  ).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Backend credentials warning banner if triggered */}
      {backendConfigWarning && (
        <div
          data-testid="backend-config-warning"
          className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900">Backend Cloudinary Configuration Notice</p>
            <p className="leading-relaxed text-amber-800">{backendConfigWarning}</p>
          </div>
        </div>
      )}

      {/* Drag & Drop Surface */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="media-dropzone"
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-[#176779] bg-[#E8F6F8]/60"
            : "border-[#E5EAED] bg-[#F8FAFB] hover:border-[#176779]/60 hover:bg-[#F0F7F8]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileInputChange}
          data-testid="media-file-input"
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#176779] shadow-xs border border-[#E5EAED]">
          <UploadCloud className="h-6 w-6 stroke-[2.2]" />
        </div>

        <h3 className="mt-3 text-sm font-semibold text-[#18282A]">
          Click to upload or drag and drop images
        </h3>
        <p className="mt-1 text-xs text-[#74818A]">
          JPEG, PNG, WebP, AVIF up to 10MB each. Max {MAX_BATCH_SIZE} images per batch.
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-[#176779] border border-[#E5EAED]">
          <Info className="h-3 w-3" />
          <span>Server signs uploads directly to Cloudinary CDN</span>
        </div>
      </div>

      {/* Upload Queue List */}
      {queue.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EAED] bg-white p-4">
          <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-outfit text-sm font-bold text-[#18282A]">
                Upload Queue
              </h4>
              <span className="rounded-full bg-[#E8F6F8] px-2 py-0.5 text-xs font-semibold text-[#176779]">
                {queue.length} {queue.length === 1 ? "file" : "files"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {queuedCount > 0 && (
                <Button
                  type="button"
                  size="sm"
                  disabled={inProgressCount > 0}
                  onClick={uploadAllQueued}
                  data-testid="upload-all-queued-btn"
                  className="rounded-xl bg-[#176779] px-3 text-xs font-semibold text-white hover:bg-[#125261] cursor-pointer"
                >
                  {inProgressCount > 0 ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload All ({queuedCount})</span>
                  )}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={inProgressCount > 0}
                onClick={() => setQueue([])}
                data-testid="clear-queue-btn"
                className="rounded-xl border-[#E5EAED] text-xs text-[#74818A] hover:bg-[#F8FAFB] cursor-pointer"
              >
                Clear Queue
              </Button>
            </div>
          </div>

          {/* Queue items */}
          <div className="max-h-72 divide-y divide-[#E5EAED] overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                data-testid={`queue-item-${item.id}`}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                {/* Thumbnail & File Name */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#E5EAED] bg-[#F0F4F6]">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#74818A]">
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#18282A]">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-[#74818A]">
                      {formatBytes(item.file.size)}
                    </p>

                    {/* Progress bar for in-flight items */}
                    {(item.status === "uploading" ||
                      item.status === "requesting_signature" ||
                      item.status === "confirming") && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E5EAED]">
                          <div
                            className="h-full bg-[#176779] transition-all duration-200"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-[#176779]">
                          {item.progress}%
                        </span>
                      </div>
                    )}

                    {/* Error display */}
                    {item.status === "error" && item.error && (
                      <p
                        data-testid={`queue-error-${item.id}`}
                        className="mt-0.5 text-[11px] text-[#C0392B]"
                      >
                        {item.error}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  {item.status === "queued" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => processUploadItem(item)}
                      data-testid={`upload-single-btn-${item.id}`}
                      className="h-7 rounded-lg border-[#E5EAED] px-2 text-[11px] font-medium text-[#176779] hover:bg-[#E8F6F8] cursor-pointer"
                    >
                      Upload
                    </Button>
                  )}

                  {item.status === "requesting_signature" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#74818A]">
                      <Loader2 className="h-3 w-3 animate-spin text-[#176779]" />
                      <span>Signing...</span>
                    </span>
                  )}

                  {item.status === "uploading" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#176779]">
                      <Loader2 className="h-3 w-3 animate-spin text-[#176779]" />
                      <span>Uploading...</span>
                    </span>
                  )}

                  {item.status === "confirming" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#74818A]">
                      <Loader2 className="h-3 w-3 animate-spin text-[#176779]" />
                      <span>Confirming...</span>
                    </span>
                  )}

                  {item.status === "success" && (
                    <span
                      data-testid={`queue-success-${item.id}`}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Uploaded</span>
                    </span>
                  )}

                  {item.status === "error" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => processUploadItem(item)}
                      data-testid={`retry-upload-btn-${item.id}`}
                      title="Retry upload"
                      className="h-7 rounded-lg border-amber-200 px-2 text-[11px] font-medium text-amber-700 hover:bg-amber-50 cursor-pointer"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      <span>Retry</span>
                    </Button>
                  )}

                  {/* Remove button (disabled during active upload) */}
                  <button
                    type="button"
                    disabled={
                      item.status === "requesting_signature" ||
                      item.status === "uploading" ||
                      item.status === "confirming"
                    }
                    onClick={() => removeQueueItem(item.id)}
                    data-testid={`remove-queue-item-btn-${item.id}`}
                    className="p-1 text-[#74818A] hover:text-[#C0392B] disabled:opacity-30 cursor-pointer"
                    aria-label="Remove item from queue"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
