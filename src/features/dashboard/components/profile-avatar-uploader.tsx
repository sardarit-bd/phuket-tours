"use client";

import * as React from "react";
import { Camera, Trash2, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/alert";
import { getInitials } from "@/features/auth/utils/avatar";
import {
  useGetAvatarSignatureMutation,
  useConfirmAvatarMutation,
  useRemoveAvatarMutation,
} from "@/features/auth/api/auth-api";
import { uploadToCloudinaryWithProgress } from "@/features/admin/utils/cloudinary-upload";

export interface ProfileAvatarUploaderProps {
  currentAvatarUrl?: string | null;
  userName: string;
  onAvatarUpdated?: (newAvatarUrl: string | null) => void;
  testIdPrefix?: string;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

export function ProfileAvatarUploader({
  currentAvatarUrl,
  userName,
  onAvatarUpdated,
  testIdPrefix = "profile-avatar",
}: ProfileAvatarUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const [getSignature] = useGetAvatarSignatureMutation();
  const [confirmAvatar] = useConfirmAvatarMutation();
  const [removeAvatar, { isLoading: isRemoving }] = useRemoveAvatarMutation();

  const avatarInitials = getInitials(userName);

  // Clean up object URLs on unmount or file change
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME type check
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setUploadError("Invalid image type. Please select a JPEG, PNG, or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Size limit check (5MB)
    if (file.size > MAX_AVATAR_BYTES) {
      setUploadError("Image size exceeds 5MB limit. Please select a smaller photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) return;

    setUploadError(null);
    setIsProcessing(true);

    try {
      // 1. Request signed upload parameters for avatar folder
      const sigRes = await getSignature().unwrap();
      const sigData = sigRes.data;

      // 2. Upload file directly to Cloudinary
      const cldRes = await uploadToCloudinaryWithProgress(selectedFile, {
        uploadUrl: sigData.uploadUrl,
        signature: sigData.signature,
        timestamp: sigData.timestamp,
        apiKey: sigData.apiKey,
        folder: sigData.folder,
        publicId: sigData.publicId,
        uploadToken: sigData.uploadToken,
        cloudName: "",
        maxFileSize: MAX_AVATAR_BYTES,
        allowedFormats: ["jpg", "jpeg", "png", "webp"],
      });

      // 3. Confirm with backend to update User record and safely clean up prior asset
      const confirmRes = await confirmAvatar({
        uploadToken: sigData.uploadToken,
        publicId: cldRes.public_id,
        secureUrl: cldRes.secure_url,
        format: cldRes.format,
        bytes: cldRes.bytes,
      }).unwrap();

      const newUrl = confirmRes.data?.avatarUrl || cldRes.secure_url;
      onAvatarUpdated?.(newUrl);

      // Clean up local preview
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const errObj = err as { message?: string; data?: { message?: string } };
      setUploadError(
        errObj?.data?.message || errObj?.message || "Failed to upload profile photo."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSelection = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setUploadError(null);
    try {
      await removeAvatar().unwrap();
      onAvatarUpdated?.(null);
    } catch (err: unknown) {
      const errObj = err as { message?: string; data?: { message?: string } };
      setUploadError(
        errObj?.data?.message || errObj?.message || "Failed to remove profile photo."
      );
    }
  };

  const displayedImage = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center" data-testid={`${testIdPrefix}-container`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        data-testid={`${testIdPrefix}-input`}
      />

      {/* Avatar Image / Initials */}
      <div className="relative group shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#E5EAED] bg-[#F8FAFB] shadow-2xs">
          {displayedImage ? (
            <img
              src={displayedImage}
              alt={userName}
              className="h-full w-full object-cover"
              data-testid={`${testIdPrefix}-img`}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-[#3297A3]/10 text-[#3297A3] font-outfit text-xl font-bold"
              data-testid={`${testIdPrefix}-fallback`}
            >
              {avatarInitials}
            </div>
          )}
        </div>

        {/* Quick change overlay icon */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || isRemoving}
          className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#176779] text-white shadow-md hover:bg-[#135664] transition-transform hover:scale-105 disabled:opacity-50"
          aria-label="Upload photo"
          data-testid={`${testIdPrefix}-quick-upload-btn`}
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Details & Actions */}
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {selectedFile ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveUpload}
                disabled={isProcessing}
                className="h-8 bg-[#176779] text-white text-xs font-semibold hover:bg-[#135664]"
                data-testid={`${testIdPrefix}-save-upload-btn`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                    Save Photo
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelSelection}
                disabled={isProcessing}
                className="h-8 text-xs text-[#74818A] hover:bg-slate-50"
                data-testid={`${testIdPrefix}-cancel-selection-btn`}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isRemoving}
                className="h-8 border-[#E5EAED] bg-white text-xs font-medium text-[#18282A] hover:bg-[#F5F8F9]"
                data-testid={`${testIdPrefix}-change-btn`}
              >
                {currentAvatarUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              {currentAvatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isProcessing || isRemoving}
                  className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                  data-testid={`${testIdPrefix}-remove-btn`}
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        <p className="text-[11px] text-[#74818A]">
          JPEG, PNG, or WebP up to 5MB. A square photo works best.
        </p>

        {uploadError && (
          <div className="pt-1">
            <ErrorAlert
              data-testid={`${testIdPrefix}-error`}
              description={uploadError}
            />
          </div>
        )}
      </div>
    </div>
  );
}

