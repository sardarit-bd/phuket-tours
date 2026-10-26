"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Star, Heart, ArrowRight } from "lucide-react";
import { Tour } from "../types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  tour: Tour;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export function TourCard({
  tour,
  isFavorite = false,
  onToggleFavorite,
  className = "",
}: TourCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case "Popular":
        return "bg-[#FF574D] text-white";
      case "Bestseller":
        return "bg-[#FBA81A] text-white";
      case "New":
        return "bg-[#22C55E] text-white";
      default:
        return "bg-primary text-white";
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(tour.id);
    }
  };

  const tourHref = `/tours?slug=${tour.slug}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5EAEB] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEF4F5]">
        {!imgError ? (
          <Image
            src={tour.featuredImage || tour.images[0] || "/images/hero/hero-img.jpg"}
            alt={tour.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#EEF4F5] text-[#8A9A9C]">
            <MapPin className="h-8 w-8 opacity-40" />
          </div>
        )}

        {/* Top-Left Badge */}
        {tour.badge && (
          <div className="absolute left-3 top-3 z-10">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold shadow-xs",
                getBadgeStyle(tour.badge)
              )}
            >
              {tour.badge}
            </span>
          </div>
        )}

        {/* Top-Right Favorite Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={
            isFavorite
              ? `Remove ${tour.title} from favorites`
              : `Add ${tour.title} to favorites`
          }
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 backdrop-blur-xs text-white hover:bg-black/45 transition-colors cursor-pointer"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-200 stroke-[2.2]",
              isFavorite
                ? "fill-[#FF4D6D] text-[#FF4D6D] scale-110"
                : "text-white"
            )}
          />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Metadata Row: Duration & Destination */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs text-[#74818A] font-medium">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#8A9A9C] shrink-0" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-[#8A9A9C] shrink-0" />
              <span className="truncate">{tour.destination}</span>
            </div>
          </div>

          {/* Tour Title */}
          <h3 className="mt-2 font-outfit text-[15px] sm:text-[16px] font-bold leading-snug text-[#18282A] line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={tourHref} className="focus:outline-none">
              {tour.title}
            </Link>
          </h3>

          {/* Rating Summary */}
          {tour.reviews && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <Star className="h-3.5 w-3.5 fill-[#FBA81A] text-[#FBA81A] shrink-0" />
              <span className="font-bold text-[#18282A]">
                {tour.reviews.rating.toFixed(1)}
              </span>
              <span className="text-[#8A9A9C]">
                ({tour.reviews.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Card Footer: Price & CTA Button */}
        <div className="mt-4 flex items-center justify-between border-t border-[#EEF2F3] pt-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A9A9C] leading-none">From</span>
            <span className="text-lg sm:text-[21px] font-bold text-primary leading-tight">
              {tour.price.currency}
              {tour.price.amount}
            </span>
          </div>

          <Link
            href={tourHref}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-primary-dark group-hover:bg-primary-dark"
            aria-label={`View tour details for ${tour.title}`}
          >
            <span>View Tour</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
