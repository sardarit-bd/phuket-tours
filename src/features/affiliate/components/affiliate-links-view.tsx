"use client";

import * as React from "react";
import Image from "next/image";
import {
  useCreateMyAffiliateLinkMutation,
  useGetMyAffiliateLinksQuery,
  useUpdateMyAffiliateLinkMutation,
  useDeleteMyAffiliateLinkMutation,
} from "../api/affiliate-api";
import { useGetToursQuery } from "@/features/tours/api/tours-api";
import type { Tour } from "@/features/tours/types/tour";
import type { AffiliateLinkItem } from "../types/affiliate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import {
  Copy,
  Check,
  Share2,
  Globe,
  Compass,
  Search,
  Archive,
  RefreshCw,
  Trash2,
  Sparkles,
  Link2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { env } from "@/config/env";

export function AffiliateLinksView() {
  const { data, isLoading, isError } = useGetMyAffiliateLinksQuery();
  const [createLink, { isLoading: isCreating }] = useCreateMyAffiliateLinkMutation();
  const [updateLink, { isLoading: isUpdating }] = useUpdateMyAffiliateLinkMutation();
  const [deleteLink, { isLoading: isDeleting }] = useDeleteMyAffiliateLinkMutation();

  // Generator form state
  const [promotionType, setPromotionType] = React.useState<"website" | "tour">("website");
  const [selectedTour, setSelectedTour] = React.useState<Tour | null>(null);
  const [campaignName, setCampaignName] = React.useState("");

  // Search & Pagination state for Tour Picker
  const [tourSearchInput, setTourSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [tourPage, setTourPage] = React.useState(1);
  const pageSize = 10;

  // Debounce search query by 300ms
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(tourSearchInput.trim());
      setTourPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [tourSearchInput]);

  // Scalable Tours API query
  const {
    data: toursData,
    isLoading: isLoadingTours,
    isFetching: isFetchingTours,
    isError: isToursError,
  } = useGetToursQuery(
    {
      page: tourPage,
      limit: pageSize,
      search: debouncedSearch || undefined,
    },
    { skip: promotionType !== "tour" || Boolean(selectedTour) }
  );

  // Feedback & Copy state
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; isError?: boolean } | null>(null);
  const [justGeneratedLink, setJustGeneratedLink] = React.useState<{ url: string; label: string } | null>(null);

  // Modals state
  const [linkToArchive, setLinkToArchive] = React.useState<AffiliateLinkItem | null>(null);
  const [linkToDelete, setLinkToDelete] = React.useState<AffiliateLinkItem | null>(null);
  const [filterTab, setFilterTab] = React.useState<"all" | "active" | "archived">("all");

  // Collapsible Help Section
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  const code = data?.data?.code ?? "";
  const rawLinks = data?.data?.links ?? [];

  // Filter out soft-deleted links from normal view
  const links = React.useMemo(() => {
    return rawLinks.filter((l) => !l.label?.startsWith("[Deleted]"));
  }, [rawLinks]);

  // Determine base URL dynamically (current origin in browser, or configured APP_URL)
  const baseUrl = React.useMemo(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      return window.location.origin.replace(/\/+$/, "");
    }
    return (env.NEXT_PUBLIC_APP_URL || "https://phukettours.com").replace(/\/+$/, "");
  }, []);

  const buildReferralUrl = React.useCallback(
    (targetPath: string) => {
      const cleanPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;
      const sep = cleanPath.includes("?") ? "&" : "?";
      return `${baseUrl}${cleanPath}${sep}ref=${code}`;
    },
    [baseUrl, code]
  );

  const handleCopy = async (id: string, url: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsAppShare = (url: string, title?: string) => {
    const text = encodeURIComponent(
      title
        ? `Check out ${title} on PhuketTours: ${url}`
        : `Explore unforgettable travel experiences on PhuketTours: ${url}`
    );
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setJustGeneratedLink(null);

    if (promotionType === "tour" && !selectedTour) {
      setStatusMessage({ text: "Please select a tour to promote.", isError: true });
      return;
    }

    try {
      const payload = {
        label: campaignName.trim() || undefined,
        tourId: promotionType === "tour" ? selectedTour?.id : undefined,
      };

      const res = await createLink(payload).unwrap();
      const generatedUrl = buildReferralUrl(res.data.targetPath);
      setJustGeneratedLink({
        url: generatedUrl,
        label: res.data.label || (promotionType === "tour" ? selectedTour?.title || "Tour" : "PhuketTours Website"),
      });

      setStatusMessage({ text: "Your new referral link has been created and is ready to share!" });
      setCampaignName("");
      if (promotionType === "tour") {
        setSelectedTour(null);
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.data?.message || "Failed to generate referral link. Please try again.",
        isError: true,
      });
    }
  };

  const handleToggleArchive = async (link: AffiliateLinkItem) => {
    try {
      await updateLink({ id: link.id, isActive: !link.isActive }).unwrap();
      setLinkToArchive(null);
      setStatusMessage({
        text: link.isActive ? `"${link.label}" has been archived.` : `"${link.label}" has been restored to active.`,
      });
    } catch (err: any) {
      setStatusMessage({
        text: err?.data?.message || "Failed to update link status.",
        isError: true,
      });
    }
  };

  const handleDelete = async (link: AffiliateLinkItem) => {
    try {
      await deleteLink(link.id).unwrap();
      setLinkToDelete(null);
      setStatusMessage({
        text: `"${link.label || "Referral link"}" has been deleted. Historical data remains securely recorded.`,
      });
    } catch (err: any) {
      setStatusMessage({
        text: err?.data?.message || "Failed to delete link.",
        isError: true,
      });
    }
  };

  // Helper to format friendly campaign name
  const formatCampaignName = (rawLabel: string | null | undefined, targetPath: string) => {
    if (!rawLabel) return targetPath.startsWith("/tours/") && targetPath !== "/tours" ? "Specific Tour" : "PhuketTours Website";
    if (rawLabel.startsWith("http://") || rawLabel.startsWith("https://") || rawLabel.startsWith("/")) {
      return targetPath.startsWith("/tours/") && targetPath !== "/tours" ? "Specific Tour Campaign" : "Website Campaign";
    }
    return rawLabel;
  };

  // Helper to format friendly destination name
  const formatDestinationName = (targetPath: string) => {
    if (targetPath.startsWith("/tours/") && targetPath !== "/tours") {
      return "Specific Tour";
    }
    return "Entire Website";
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 animate-pulse space-y-2">
        <div className="h-4 w-48 bg-slate-200 rounded mx-auto" />
        <p>Loading affiliate dashboard...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
        Unable to load your affiliate links. Please confirm that your affiliate account is approved and try again.
      </div>
    );
  }

  const generalWebsiteUrl = buildReferralUrl("/");
  const publishedTours = toursData?.data ?? [];
  const totalTourResults = toursData?.total ?? 0;
  const totalTourPages = toursData?.totalPages ?? 1;

  const filteredLinks = links.filter((link) => {
    if (filterTab === "active") return link.isActive;
    if (filterTab === "archived") return !link.isActive;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Page Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Affiliate Referral Links</h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate unique links to share PhuketTours with your audience and earn commission on completed bookings.
        </p>
      </div>

      {/* Global Status Notification */}
      {statusMessage && (
        <div
          role="status"
          className={`flex items-center gap-2 px-4 py-3 text-sm rounded-xl border ${
            statusMessage.isError
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-teal-50 border-teal-200 text-teal-800"
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          ) : (
            <Check className="h-4 w-4 shrink-0 text-teal-600" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold underline hover:no-underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Compact General Referral Link Card */}
      <Card className="border border-slate-200 shadow-xs bg-slate-50/50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#2B9BA8]" />
                <h2 className="text-sm font-semibold text-slate-900">Your Website Referral Link</h2>
              </div>
              <p className="text-xs text-slate-500">
                Sends visitors to the homepage. Earn credit for any eligible booking they make within 30 days.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 lg:max-w-xl">
              <div className="relative flex-1">
                <Input
                  readOnly
                  aria-label="Your Website Referral Link"
                  value={generalWebsiteUrl}
                  className="font-mono text-xs bg-white text-slate-700 pr-9 border-slate-200 selection:bg-teal-100"
                />
                <Link2 className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#2B9BA8] hover:bg-[#23808b] text-white gap-1.5 shadow-none"
                  onClick={() => handleCopy("general-link", generalWebsiteUrl)}
                >
                  {copiedId === "general-link" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === "general-link" ? "Copied" : "Copy"}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-slate-200 hover:bg-white text-slate-700 gap-1.5 shadow-none"
                  onClick={() => handleWhatsAppShare(generalWebsiteUrl, "PhuketTours")}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Create Affiliate Link — Simplified Guided Form */}
      <Card className="border border-slate-200 shadow-xs" id="create-link-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Create Affiliate Link</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Choose what to promote, name your campaign, and get an instant tracked referral link.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleGenerateLink} className="space-y-5">
            {/* Step 1: Promotion Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Step 1: What would you like to promote?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPromotionType("website");
                    setSelectedTour(null);
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    promotionType === "website"
                      ? "border-[#2B9BA8] bg-teal-50/30 ring-1 ring-[#2B9BA8]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      promotionType === "website" ? "bg-[#2B9BA8] text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">Entire PhuketTours Website</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      Share our website and let visitors explore all available tours.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPromotionType("tour")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    promotionType === "tour"
                      ? "border-[#2B9BA8] bg-teal-50/30 ring-1 ring-[#2B9BA8]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      promotionType === "tour" ? "bg-[#2B9BA8] text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">Specific Tour</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      Promote a particular tour with its own referral link.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Tour Picker (Only when Specific Tour selected) */}
            {promotionType === "tour" && (
              <div className="space-y-3 p-4 bg-slate-50/75 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Step 2: Select a Tour
                  </label>
                  {selectedTour && (
                    <button
                      type="button"
                      onClick={() => setSelectedTour(null)}
                      className="text-xs text-teal-700 hover:underline font-medium"
                    >
                      Change tour
                    </button>
                  )}
                </div>

                {selectedTour ? (
                  /* Selected Tour Compact Summary */
                  <div className="flex items-center justify-between gap-3 p-3 bg-white border border-teal-200 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        {selectedTour.images?.[0] ? (
                          <Image
                            src={selectedTour.images[0]}
                            alt={selectedTour.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Compass className="h-5 w-5 m-auto text-slate-400 mt-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">{selectedTour.title}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {selectedTour.destination || selectedTour.categoryName || "Phuket, Thailand"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="teal" className="text-[10px] px-2 py-0.5">
                        Selected
                      </Badge>
                      <button
                        type="button"
                        onClick={() => setSelectedTour(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium ml-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Scalable Search & Pagination List */
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search tours by name or destination..."
                        value={tourSearchInput}
                        onChange={(e) => setTourSearchInput(e.target.value)}
                        className="pl-8 text-xs bg-white h-9 border-slate-200"
                      />
                    </div>

                    <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100 overflow-hidden">
                      {isLoadingTours || isFetchingTours ? (
                        <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                          <div className="inline-block h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-1" />
                          <p>Loading tours catalog...</p>
                        </div>
                      ) : isToursError ? (
                        <div className="p-4 text-center text-xs text-red-600">
                          Unable to load tours. Please check your connection and try again.
                        </div>
                      ) : publishedTours.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No published tours found matching &quot;{debouncedSearch}&quot;.
                        </div>
                      ) : (
                        publishedTours.map((tour: Tour) => (
                          <div
                            key={tour.id}
                            className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-50/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
                                {tour.images?.[0] ? (
                                  <Image
                                    src={tour.images[0]}
                                    alt={tour.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <Compass className="h-4 w-4 m-auto text-slate-400 mt-3" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-xs text-slate-900 truncate">{tour.title}</div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {tour.destination || tour.categoryName || "Phuket, Thailand"}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs border-teal-200 text-teal-800 hover:bg-teal-50 shrink-0"
                              onClick={() => setSelectedTour(tour)}
                            >
                              Select
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination Controls */}
                    {totalTourPages > 1 && (
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
                        <span>
                          Showing page {tourPage} of {totalTourPages} ({totalTourResults} tours)
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={tourPage <= 1 || isFetchingTours}
                            onClick={() => setTourPage((p) => Math.max(1, p - 1))}
                            title="Previous page"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={tourPage >= totalTourPages || isFetchingTours}
                            onClick={() => setTourPage((p) => Math.min(totalTourPages, p + 1))}
                            title="Next page"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Campaign Name (Optional) */}
            <div className="space-y-1.5">
              <label htmlFor="campaign-name-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Give your link a name (optional)
              </label>
              <p className="text-xs text-slate-500">
                Use a name that helps you remember where you shared this link.
              </p>
              <Input
                id="campaign-name-input"
                placeholder={
                  promotionType === "tour" && selectedTour
                    ? `${selectedTour.title} Campaign`
                    : "e.g., Instagram Bio, Facebook Campaign, YouTube Video"
                }
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                maxLength={120}
                className="max-w-md bg-white text-xs h-9"
              />
            </div>

            {/* Primary CTA */}
            <div>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-[#2B9BA8] hover:bg-[#23808b] text-white px-5 h-9 text-xs font-semibold shadow-xs"
              >
                {isCreating ? "Generating Affiliate Link..." : "Generate Affiliate Link"}
              </Button>
            </div>
          </form>

          {/* Success Banner for Newly Generated Link */}
          {justGeneratedLink && (
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-teal-900 font-semibold text-xs">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>Link Ready: {justGeneratedLink.label}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  readOnly
                  aria-label="Generated Referral Link"
                  value={justGeneratedLink.url}
                  className="font-mono text-xs bg-white text-slate-700 flex-1 h-9 border-teal-200"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#2B9BA8] hover:bg-[#23808b] text-white h-9 px-3 text-xs gap-1"
                    onClick={() => handleCopy("new-gen", justGeneratedLink.url)}
                  >
                    {copiedId === "new-gen" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedId === "new-gen" ? "Copied" : "Copy"}</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-slate-200 hover:bg-white text-slate-700 h-9 px-3 text-xs gap-1"
                    onClick={() => handleWhatsAppShare(justGeneratedLink.url, justGeneratedLink.label)}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Saved Referral Links Management */}
      <Card className="border border-slate-200 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Saved Referral Links ({links.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Manage your active referral links, track click performance, and archive inactive campaigns.
            </CardDescription>
          </div>
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterTab === "all" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "hover:text-slate-900"
              }`}
            >
              All ({links.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterTab === "active" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "hover:text-slate-900"
              }`}
            >
              Active ({links.filter((l) => l.isActive).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("archived")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterTab === "archived" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "hover:text-slate-900"
              }`}
            >
              Archived ({links.filter((l) => !l.isActive).length})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            /* Friendly Empty State */
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Link2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Your affiliate links will appear here.</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first link above and start sharing PhuketTours to earn commission on bookings.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-[#2B9BA8] hover:bg-[#23808b] text-white"
                onClick={() => {
                  const element = document.getElementById("create-link-card");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Create My First Link
              </Button>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No {filterTab} referral links found.
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 pr-4">Campaign Name</th>
                      <th className="py-2.5 pr-4">Destination</th>
                      <th className="py-2.5 pr-4">Referral Link</th>
                      <th className="py-2.5 pr-4 text-center">Clicks</th>
                      <th className="py-2.5 pr-4">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLinks.map((link) => {
                      const referralUrl = buildReferralUrl(link.targetPath);
                      const campaignDisplayName = formatCampaignName(link.label, link.targetPath);
                      const destinationName = formatDestinationName(link.targetPath);
                      const isTour = link.targetPath.startsWith("/tours/") && link.targetPath !== "/tours";

                      return (
                        <tr key={link.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Campaign Name */}
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-900">{campaignDisplayName}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(link.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Destination */}
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              {isTour ? (
                                <Compass className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              ) : (
                                <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              )}
                              <span>{destinationName}</span>
                            </div>
                          </td>

                          {/* Referral Link with tooltip/copy */}
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5 max-w-[220px]">
                              <span className="font-mono text-[11px] text-slate-600 truncate" title={referralUrl}>
                                {referralUrl}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(link.id, referralUrl)}
                                className="text-slate-400 hover:text-teal-600 p-0.5"
                                title="Copy referral link"
                              >
                                {copiedId === link.id ? (
                                  <Check className="h-3.5 w-3.5 text-teal-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Clicks */}
                          <td className="py-3 pr-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-[11px]">
                              {link.clickCount}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 pr-4">
                            {link.isActive ? (
                              <Badge variant="teal" className="text-[10px] px-2 py-0.5">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="muted" className="text-[10px] px-2 py-0.5">
                                Archived
                              </Badge>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                                onClick={() => handleCopy(link.id, referralUrl)}
                                title="Copy Link"
                              >
                                {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                                onClick={() => handleWhatsAppShare(referralUrl, link.label || undefined)}
                                title="Share Link"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`h-7 w-7 p-0 ${
                                  link.isActive
                                    ? "text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                                    : "text-teal-700 hover:bg-teal-50"
                                }`}
                                onClick={() => setLinkToArchive(link)}
                                title={link.isActive ? "Archive Link" : "Restore Link"}
                              >
                                {link.isActive ? <Archive className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setLinkToDelete(link)}
                                title="Delete Link"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards View */}
              <div className="md:hidden space-y-3">
                {filteredLinks.map((link) => {
                  const referralUrl = buildReferralUrl(link.targetPath);
                  const campaignDisplayName = formatCampaignName(link.label, link.targetPath);
                  const destinationName = formatDestinationName(link.targetPath);
                  const isTour = link.targetPath.startsWith("/tours/") && link.targetPath !== "/tours";

                  return (
                    <div
                      key={link.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">{campaignDisplayName}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            {isTour ? <Compass className="h-3 w-3 text-teal-600" /> : <Globe className="h-3 w-3 text-blue-600" />}
                            <span>{destinationName}</span>
                            <span>•</span>
                            <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {link.isActive ? (
                            <Badge variant="teal" className="text-[10px] px-1.5 py-0.5">Active</Badge>
                          ) : (
                            <Badge variant="muted" className="text-[10px] px-1.5 py-0.5">Archived</Badge>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {link.clickCount} clicks
                          </span>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-50 font-mono text-[11px] text-slate-600 break-all select-all">
                        {referralUrl}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5 gap-1 border-slate-200"
                            onClick={() => handleCopy(link.id, referralUrl)}
                          >
                            {copiedId === link.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedId === link.id ? "Copied" : "Copy"}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5 gap-1 border-slate-200"
                            onClick={() => handleWhatsAppShare(referralUrl, link.label || undefined)}
                          >
                            <Share2 className="h-3 w-3" />
                            <span>Share</span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-slate-500"
                            onClick={() => setLinkToArchive(link)}
                          >
                            {link.isActive ? "Archive" : "Restore"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => setLinkToDelete(link)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 5. Compact Collapsible Help Section */}
      <Card className="border border-slate-200 bg-slate-50/40">
        <CardContent className="p-4">
          <button
            type="button"
            onClick={() => setIsHelpOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left text-slate-800 font-semibold text-xs"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#2B9BA8]" />
              <span>How do PhuketTours affiliate referral links work?</span>
            </div>
            {isHelpOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {isHelpOpen && (
            <div className="mt-3 pt-3 border-t border-slate-200/70 text-xs text-slate-600 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="font-medium text-slate-900">1. Generate & Share</div>
                  <p>Choose the entire website or a specific tour. Share the generated link on your website, social media, or via chat.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-slate-900">2. 30-Day Attribution Window</div>
                  <p>When someone clicks your link, a 30-day attribution window begins. Any booking they make during this window awards credit to you.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-slate-900">3. Verified Bookings & Earnings</div>
                  <p>Once the customer completes payment, your commission is recorded and visible in your Commissions tab.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-slate-900">4. Archiving & Deleting</div>
                  <p>Archiving turns off future tracking. Deleting removes the link from your active list while preserving all past clicks, bookings, and earnings safely.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive / Restore Confirmation Modal */}
      <Dialog
        isOpen={Boolean(linkToArchive)}
        onClose={() => setLinkToArchive(null)}
        title={linkToArchive?.isActive ? "Archive Referral Link?" : "Restore Referral Link?"}
        description={
          linkToArchive?.isActive
            ? `Archiving "${formatCampaignName(linkToArchive.label, linkToArchive.targetPath)}" deactivates it for future visitor tracking. All past clicks, bookings, and earned commissions remain 100% preserved.`
            : `Restoring "${formatCampaignName(linkToArchive?.label, linkToArchive?.targetPath || "")}" will reactivate it to track new referral visitors.`
        }
      >
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLinkToArchive(null)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className={
              linkToArchive?.isActive
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-[#2B9BA8] hover:bg-[#23808b] text-white"
            }
            onClick={() => linkToArchive && handleToggleArchive(linkToArchive)}
            disabled={isUpdating}
          >
            {isUpdating
              ? "Saving..."
              : linkToArchive?.isActive
              ? "Yes, Archive Link"
              : "Yes, Restore Link"}
          </Button>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={Boolean(linkToDelete)}
        onClose={() => setLinkToDelete(null)}
        title="Delete Referral Link?"
        description={
          linkToDelete
            ? `Are you sure you want to delete "${formatCampaignName(linkToDelete.label, linkToDelete.targetPath)}"? It will be removed from your saved links list. All historical clicks, referred bookings, and commission records will remain safely saved in your dashboard.`
            : ""
        }
      >
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLinkToDelete(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => linkToDelete && handleDelete(linkToDelete)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete Link"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
