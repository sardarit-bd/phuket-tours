"use client";

import * as React from "react";
import {
  Info,
  DollarSign,
  Compass,
  Calendar,
  Image as ImageIcon,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BasicInfoTab, type BasicInfoFormData, slugify } from "./basic-info-tab";
import { PricingTab, type PricingFormData } from "./pricing-tab";
import { ItineraryTab } from "./itinerary-tab";
import { AvailabilityTab, type AvailabilityFormData } from "./availability-tab";
import { MediaTab, type MediaFormData } from "./media-tab";
import {
  useCreateAdminServiceMutation,
  useUpdateAdminServiceMutation,
  useUpdateAdminServiceStatusMutation,
  useUpdateAdminServicePricingMutation,
  useUpdateAdminServiceAvailabilityMutation,
  useGetAdminServiceByIdQuery,
} from "../../../api/admin-api";
import type {
  AdminServiceRecord,
  AdminServiceDetail,
  AdminServiceStatus,
  TourMetadata,
  TourItineraryItem,
} from "../../../types/admin";

export interface TourEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  tour?: AdminServiceRecord | null;
  onSuccess?: (savedTour: AdminServiceRecord) => void;
}

type TabType = "basic" | "pricing" | "itinerary" | "availability" | "media";

const INITIAL_BASIC_INFO: BasicInfoFormData = {
  name: "",
  slug: "",
  subtitle: "",
  description: "",
  destination: "Phi Phi Islands",
  city: "Phuket",
  country: "Thailand",
  departurePoint: "Royal Phuket Marina",
  duration: "Full Day (8 Hours)",
  durationCategory: "full-day",
  tourType: "island-tours",
  groupSize: "Max 25 travelers",
  languages: ["English", "Thai"],
  providerName: "Phuket Island Travels",
  providerId: "",
  badge: "",
};

const INITIAL_PRICING: PricingFormData = {
  currency: "USD",
  basePrice: 120,
  discountedPrice: 99,
  taxRate: 7,
  pricingTiers: [
    { tierName: "Adult", price: 120 },
    { tierName: "Child (4–11)", price: 80, description: "Includes child snorkeling gear" },
    { tierName: "Infant (0–3)", price: 0, description: "Free of charge" },
  ],
  highlights: [
    "Explore iconic Maya Bay and Pileh Lagoon",
    "Snorkel in crystal-clear emerald waters with tropical marine life",
    "Enjoy a delicious beachside buffet lunch and fresh tropical fruits",
    "Relax on white sandy beaches at Bamboo Island",
  ],
  included: [
    "Hotel round-trip transfers (Air-conditioned minivan)",
    "Snorkeling equipment & life jackets",
    "Delicious buffet lunch & seasonal fresh fruits",
    "National Park admission fees included",
    "Licensed English-speaking professional guide",
    "Accident insurance coverage",
  ],
  excluded: [
    "Alcoholic beverages",
    "Personal souvenir shopping",
    "Gratuities and crew tips (Optional)",
  ],
};

const INITIAL_ITINERARY: TourItineraryItem[] = [
  {
    day: 1,
    time: "07:30 - 08:30",
    title: "Hotel Pickup & Transfer",
    description: "Air-conditioned minivan collects travelers from hotel lobby and transfers to marina pier.",
  },
  {
    day: 1,
    time: "09:00 - 09:30",
    title: "Pier Welcome & Safety Briefing",
    description: "Enjoy light morning refreshments, meet your certified guide, and receive safety & itinerary briefing.",
  },
  {
    day: 1,
    time: "10:30 - 12:00",
    title: "Maya Bay & Pileh Lagoon Snorkeling",
    description: "Sightseeing at famous Maya Bay, followed by cliff jumping and snorkeling in emerald lagoon waters.",
  },
  {
    day: 1,
    time: "12:30 - 13:30",
    title: "Beachside Buffet Lunch",
    description: "Relax on the beach and enjoy a delicious Thai & international buffet lunch with fresh tropical fruits.",
  },
  {
    day: 1,
    time: "14:00 - 15:30",
    title: "Bamboo Island Beach Relaxation",
    description: "Free time for sunbathing, swimming, and exploring white sand beaches and coral reefs.",
  },
  {
    day: 1,
    time: "16:30 - 17:30",
    title: "Return to Pier & Hotel Drop-off",
    description: "Speedboat returns to Phuket marina; transfer van safely drives guests back to their hotels.",
  },
];

const INITIAL_AVAILABILITY: AvailabilityFormData = {
  scheduleDetails: {
    isDaily: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    timeSlots: ["08:00 AM", "09:30 AM"],
    operatingHours: "08:00 AM - 05:30 PM",
  },
  capacity: 25,
  specificDates: [],
};

const INITIAL_MEDIA: MediaFormData = {
  featuredImage: undefined,
  images: [],
};

function computeInitialBasicInfo(detail?: AdminServiceDetail | null): BasicInfoFormData {
  if (!detail) return INITIAL_BASIC_INFO;
  const meta = (detail.metadata || {}) as TourMetadata;
  const rawDurationCategory = (meta.durationCategory as string) || "full-day";
  return {
    name: detail.name || "",
    slug: meta.slug || slugify(detail.name || ""),
    subtitle: meta.subtitle || "",
    description: detail.description || "",
    destination: meta.destination || "Phi Phi Islands",
    city: meta.location?.city || "Phuket",
    country: meta.location?.country || "Thailand",
    departurePoint: meta.location?.departurePoint || "",
    duration: meta.duration || "Full Day (8 Hours)",
    durationCategory: rawDurationCategory,
    tourType: meta.tourType || "island-tours",
    groupSize: meta.groupSize || "Max 25 travelers",
    languages: meta.languages || ["English", "Thai"],
    providerName: detail.providerName || "Phuket Island Travels",
    providerId: detail.providerId || "",
    badge: meta.badge || "",
  };
}

function computeInitialPricing(detail?: AdminServiceDetail | null): PricingFormData {
  if (!detail) return INITIAL_PRICING;
  const meta = (detail.metadata || {}) as TourMetadata;
  const pricingRec = detail.pricing?.[0];
  return {
    currency: pricingRec?.currency || "USD",
    basePrice: pricingRec?.basePrice ?? (meta.pricingTiers?.[0]?.price || 120),
    discountedPrice: pricingRec?.discountedPrice ?? null,
    taxRate: pricingRec?.taxRate ?? 0,
    pricingTiers: meta.pricingTiers || INITIAL_PRICING.pricingTiers,
    highlights: meta.highlights || INITIAL_PRICING.highlights,
    included: meta.included || INITIAL_PRICING.included,
    excluded: meta.excluded || INITIAL_PRICING.excluded,
  };
}

function computeInitialItinerary(detail?: AdminServiceDetail | null): TourItineraryItem[] {
  if (!detail) return INITIAL_ITINERARY;
  const meta = (detail.metadata || {}) as TourMetadata;
  return meta.itinerary || INITIAL_ITINERARY;
}

function computeInitialAvailability(detail?: AdminServiceDetail | null): AvailabilityFormData {
  if (!detail) return INITIAL_AVAILABILITY;
  const meta = (detail.metadata || {}) as TourMetadata;
  const avDates = (detail.availability || []).map((av) => ({
    date: typeof av.date === "string" ? av.date.slice(0, 10) : new Date(av.date).toISOString().slice(0, 10),
    isAvailable: av.isAvailable,
    capacity: av.capacity ?? undefined,
  }));
  return {
    scheduleDetails: meta.scheduleDetails || INITIAL_AVAILABILITY.scheduleDetails,
    capacity: avDates[0]?.capacity || INITIAL_AVAILABILITY.capacity,
    specificDates: avDates,
    removedDates: [],
  };
}

function computeInitialMedia(detail?: AdminServiceDetail | null): MediaFormData {
  if (!detail) return INITIAL_MEDIA;
  const meta = (detail.metadata || {}) as TourMetadata;
  return {
    featuredImage: meta.featuredImage || detail.media?.[0]?.secureUrl,
    images: meta.images || (detail.media?.map((m) => m.secureUrl) || []),
  };
}

interface TourEditorFormContentProps {
  mode: "create" | "edit";
  tour?: AdminServiceRecord | null;
  detail?: AdminServiceDetail | null;
  onClose: () => void;
  onSuccess?: (savedTour: AdminServiceRecord) => void;
}

function TourEditorFormContent({
  mode,
  tour,
  detail,
  onClose,
  onSuccess,
}: TourEditorFormContentProps) {
  const isEdit = mode === "edit";
  const [activeTab, setActiveTab] = React.useState<TabType>("basic");
  const tabListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!tabListRef.current) return;
    const activeEl = tabListRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTab]);

  // Form States initialized synchronously from detail or defaults
  const [basicInfo, setBasicInfo] = React.useState<BasicInfoFormData>(() =>
    computeInitialBasicInfo(detail)
  );
  const [pricing, setPricing] = React.useState<PricingFormData>(() =>
    computeInitialPricing(detail)
  );
  const [itinerary, setItinerary] = React.useState<TourItineraryItem[]>(() =>
    computeInitialItinerary(detail)
  );
  const [availability, setAvailability] = React.useState<AvailabilityFormData>(() =>
    computeInitialAvailability(detail)
  );
  const [media, setMedia] = React.useState<MediaFormData>(() =>
    computeInitialMedia(detail)
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [persistedTourId, setPersistedTourId] = React.useState<string | null>(
    isEdit && tour?.id ? tour.id : null
  );
  const [submitStep, setSubmitStep] = React.useState<
    "service" | "pricing" | "availability" | "status" | null
  >(null);

  // RTK Query hooks
  const [createService] = useCreateAdminServiceMutation();
  const [updateService] = useUpdateAdminServiceMutation();
  const [updateStatus] = useUpdateAdminServiceStatusMutation();
  const [updatePricing] = useUpdateAdminServicePricingMutation();
  const [updateAvailability] = useUpdateAdminServiceAvailabilityMutation();

  // Tab definitions with completion state
  const isBasicComplete = Boolean(
    basicInfo.name.trim().length >= 3 && basicInfo.destination && basicInfo.duration
  );
  const isPricingComplete = Boolean(pricing.basePrice > 0);
  const isItineraryComplete = Boolean(itinerary.length > 0);
  const isAvailabilityComplete = Boolean(
    availability.scheduleDetails.daysOfWeek && availability.scheduleDetails.daysOfWeek.length > 0
  );
  const isMediaComplete = Boolean(media.featuredImage || media.images.length > 0);

  const TABS: { id: TabType; label: string; icon: React.ReactNode; isComplete: boolean }[] = [
    { id: "basic", label: "1. Tour Information", icon: <Info className="h-4 w-4" />, isComplete: isBasicComplete },
    { id: "pricing", label: "2. Pricing & Options", icon: <DollarSign className="h-4 w-4" />, isComplete: isPricingComplete },
    { id: "itinerary", label: "3. Tour Itinerary", icon: <Compass className="h-4 w-4" />, isComplete: isItineraryComplete },
    { id: "availability", label: "4. Availability & Dates", icon: <Calendar className="h-4 w-4" />, isComplete: isAvailabilityComplete },
    { id: "media", label: "5. Tour Photos", icon: <ImageIcon className="h-4 w-4" />, isComplete: isMediaComplete },
  ];

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!basicInfo.name.trim() || basicInfo.name.trim().length < 3) {
      newErrors.name = "Tour name must be at least 3 characters.";
    }
    if (!basicInfo.destination.trim()) {
      newErrors.destination = "Destination is required.";
    }
    if (!basicInfo.duration.trim()) {
      newErrors.duration = "Tour duration is required.";
    }
    if (pricing.basePrice < 0 || isNaN(pricing.basePrice)) {
      newErrors.basePrice = "Adult price cannot be negative.";
    }
    if (
      pricing.discountedPrice !== null &&
      (pricing.discountedPrice < 0 || isNaN(pricing.discountedPrice))
    ) {
      newErrors.discountedPrice = "Discount price cannot be negative.";
    }
    if (pricing.taxRate < 0 || pricing.taxRate > 100 || isNaN(pricing.taxRate)) {
      newErrors.taxRate = "Tax rate must be between 0% and 100%.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // Auto-switch to tab containing first error
      if (
        newErrors.name ||
        newErrors.destination ||
        newErrors.duration
      ) {
        setActiveTab("basic");
      } else if (
        newErrors.basePrice ||
        newErrors.discountedPrice ||
        newErrors.taxRate
      ) {
        setActiveTab("pricing");
      }
      return false;
    }
    return true;
  };

  // Submit Handler
  const handleSave = async (targetStatus?: AdminServiceStatus) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitStep("service");

    let activeTourId = persistedTourId;
    let savedRecord: AdminServiceRecord | null = null;
    let currentPhase: "service" | "pricing" | "availability" | "status" = "service";

    try {
      // Preserve existing metadata when updating
      const existingMetadata = (detail?.metadata ||
        tour?.metadata ||
        {}) as Record<string, unknown>;

      const effectiveSlug = basicInfo.slug.trim() || slugify(basicInfo.name.trim());

      const metadata: TourMetadata = {
        ...existingMetadata,
        slug: effectiveSlug,
        subtitle: basicInfo.subtitle || undefined,
        destination: basicInfo.destination,
        destinationCategory: slugify(basicInfo.destination),
        location: {
          ...((existingMetadata.location as Record<string, unknown>) || {}),
          city: basicInfo.city,
          country: basicInfo.country,
          departurePoint: basicInfo.departurePoint || undefined,
        },
        duration: basicInfo.duration,
        durationCategory: basicInfo.durationCategory,
        tourType: basicInfo.tourType,
        groupSize: basicInfo.groupSize || undefined,
        languages: basicInfo.languages,
        badge: basicInfo.badge || undefined,
        featuredImage: media.featuredImage || undefined,
        images: media.images,
        highlights: pricing.highlights,
        itinerary: itinerary,
        included: pricing.included,
        excluded: pricing.excluded,
        pricingTiers: pricing.pricingTiers,
        scheduleDetails: availability.scheduleDetails,
      };

      // STEP 1: Persist Core Service Record
      currentPhase = "service";
      setSubmitStep("service");
      if (activeTourId) {
        // Record already exists in DB -> Update (prevents duplicates upon retry!)
        const res = await updateService({
          serviceId: activeTourId,
          name: basicInfo.name.trim(),
          description: basicInfo.description.trim() || undefined,
          providerName: basicInfo.providerName.trim() || undefined,
          providerId: basicInfo.providerId.trim() || undefined,
          metadata: metadata as Record<string, unknown>,
        }).unwrap();
        savedRecord = res.data;
      } else {
        // First-time service creation
        const res = await createService({
          name: basicInfo.name.trim(),
          description: basicInfo.description.trim() || undefined,
          type: "TOUR",
          providerName: basicInfo.providerName.trim() || undefined,
          providerId: basicInfo.providerId.trim() || undefined,
          metadata: metadata as Record<string, unknown>,
        }).unwrap();
        savedRecord = res.data;
        activeTourId = savedRecord.id;
        setPersistedTourId(activeTourId);
      }

      if (!activeTourId) {
        throw new Error("Unable to obtain service identifier from backend.");
      }

      // STEP 2: Persist Standard Pricing
      currentPhase = "pricing";
      setSubmitStep("pricing");
      await updatePricing({
        serviceId: activeTourId,
        currency: pricing.currency,
        basePrice: pricing.basePrice,
        discountedPrice: pricing.discountedPrice ?? undefined,
        taxRate: pricing.taxRate,
      }).unwrap();

      // STEP 3: Persist Availability Overrides
      currentPhase = "availability";
      setSubmitStep("availability");
      for (const item of availability.specificDates) {
        await updateAvailability({
          serviceId: activeTourId,
          date: item.date,
          isAvailable: item.isAvailable,
          capacity:
            item.capacity !== undefined ? item.capacity : availability.capacity,
        }).unwrap();
      }

      // Mark removed dates as unavailable (backend has no deletion endpoint)
      if (availability.removedDates && availability.removedDates.length > 0) {
        for (const date of availability.removedDates) {
          await updateAvailability({
            serviceId: activeTourId,
            date,
            isAvailable: false,
            capacity: 0,
          }).unwrap();
        }
      }

      // STEP 4: Publication Status
      currentPhase = "status";
      setSubmitStep("status");
      const currentStatus = savedRecord?.status || "DRAFT";
      if (targetStatus && targetStatus !== currentStatus) {
        const statusRes = await updateStatus({
          serviceId: activeTourId,
          status: targetStatus,
        }).unwrap();
        savedRecord = statusRes.data;
      }

      if (onSuccess && savedRecord) {
        onSuccess(savedRecord);
      }
      onClose();
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      const rawErrMsg =
        errObj?.data?.message || errObj?.message || "Operation failed.";

      let contextualMsg = rawErrMsg;
      if (currentPhase === "pricing") {
        contextualMsg = `Tour basic info was saved, but saving pricing failed: "${rawErrMsg}". Click Retry to complete setup without creating a duplicate tour.`;
      } else if (currentPhase === "availability") {
        contextualMsg = `Tour info and pricing were saved, but saving calendar availability failed: "${rawErrMsg}". Click Retry to re-sync dates.`;
      } else if (currentPhase === "status") {
        contextualMsg = `Tour saved as Draft, but publishing failed: "${rawErrMsg}". The tour is currently in Draft status.`;
      }

      setSubmitError(contextualMsg);
    } finally {
      setIsSubmitting(false);
      setSubmitStep(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Step progress indicator during submission */}
      {isSubmitting && submitStep && (
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-1">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#A3E5D9] bg-[#E8F8F5] p-3 text-xs text-[#176779] font-medium animate-pulse">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#176779]" />
            <span>
              {submitStep === "service" && "1/4: Saving tour information..."}
              {submitStep === "pricing" && "2/4: Saving pricing & options..."}
              {submitStep === "availability" && "3/4: Saving availability dates..."}
              {submitStep === "status" && "4/4: Updating tour publication status..."}
            </span>
          </div>
        </div>
      )}

      {/* Error notification banner */}
      {submitError && (
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-1">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span className="font-bold">Submission Notice</span>
            </div>
            <p className="pl-6">{submitError}</p>
            {persistedTourId && !isEdit && (
              <p className="pl-6 text-[11px] text-red-600/80">
                Note: Core tour record exists. Retrying will update this draft without creating duplicates.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step navigation: flex-shrink-0, always visible below header, scrollable if width is constrained */}
      <div className="shrink-0 border-b border-[#E5EAED] bg-[#FAFCFC] px-4 sm:px-6 py-2 sm:py-2.5">
        <div ref={tabListRef} className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto min-w-0 pr-4 pb-0.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                data-active={isActive}
                className={`shrink-0 flex items-center gap-2 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#176779] text-white shadow-2xs"
                    : "text-[#74818A] hover:bg-[#F1F5F7] hover:text-[#18282A]"
                }`}
                data-testid={`tour-editor-tab-${tab.id}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.isComplete && (
                  <span
                    className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                    }`}
                    title="Completed"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: flex-1, min-height: 0, overflow-y: auto - the ONLY primary vertical scroll container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5">
        {activeTab === "basic" && (
          <BasicInfoTab
            data={basicInfo}
            onChange={(updates) => setBasicInfo((prev) => ({ ...prev, ...updates }))}
            errors={errors}
            isEditMode={isEdit}
          />
        )}

        {activeTab === "pricing" && (
          <PricingTab
            data={pricing}
            onChange={(updates) => setPricing((prev) => ({ ...prev, ...updates }))}
            errors={errors}
          />
        )}

        {activeTab === "itinerary" && (
          <ItineraryTab
            itinerary={itinerary}
            onChange={(updated) => setItinerary(updated)}
          />
        )}

        {activeTab === "availability" && (
          <AvailabilityTab
            data={availability}
            onChange={(updates) => setAvailability((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {activeTab === "media" && (
          <MediaTab
            data={media}
            onChange={(updates) => setMedia((prev) => ({ ...prev, ...updates }))}
          />
        )}
      </div>

      {/* Modal Footer Controls: flex-shrink-0, always visible and pinned at bottom */}
      <div className="shrink-0 border-t border-[#E5EAED] bg-white px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold text-[#74818A]"
          >
            Cancel
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Save as Draft */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave("DRAFT")}
            disabled={isSubmitting}
            className="text-xs font-semibold text-[#18282A] border-[#E5EAED] hover:bg-[#F8FAFB] cursor-pointer"
            data-testid="save-tour-draft-btn"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : null}
            Save as Draft
          </Button>

          {/* Save & Publish */}
          <Button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={isSubmitting}
            className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#125261] transition-colors cursor-pointer"
            data-testid="publish-tour-btn"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Check className="h-3.5 w-3.5 mr-1.5" />
            )}
            {isEdit ? "Save & Publish" : "Create & Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TourEditorModal({
  isOpen,
  onClose,
  mode = "create",
  tour,
  onSuccess,
}: TourEditorModalProps) {
  const isEdit = mode === "edit";
  const tourId = tour?.id || "";

  // Query actual service details when in edit mode
  const { data: serviceDetailResponse, isLoading: isLoadingDetails } =
    useGetAdminServiceByIdQuery(tourId, {
      skip: !isOpen || !isEdit || !tourId,
    });

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Tour: ${tour?.name || "Package"}` : "Create New Tour Package"}
      description={
        isEdit
          ? "Update tour information, pricing, itinerary, dates, and photos."
          : "Fill out the details below to create and publish a new tour package."
      }
      size="2xl"
      noBodyWrapper={true}
      className="h-[calc(100dvh-32px)] max-h-[calc(100dvh-32px)] flex flex-col"
    >
      {isEdit && isLoadingDetails ? (
        <div className="flex-1 py-20 flex flex-col items-center justify-center text-xs text-[#74818A] gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#176779]" />
          <span>Loading tour details...</span>
        </div>
      ) : (
        <TourEditorFormContent
          key={isEdit ? `${tour?.id || "edit"}-${serviceDetailResponse?.data?.id || "loading"}` : "create"}
          mode={mode}
          tour={tour}
          detail={isEdit ? serviceDetailResponse?.data : null}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}
