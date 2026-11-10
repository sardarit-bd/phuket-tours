import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DUMMY_DATA_PATH = path.resolve(
  __dirname,
  "../src/features/tours/data/dummydata.txt"
);
const OUTPUT_DATA_PATH = path.resolve(
  __dirname,
  "../src/features/tours/data/client-tours-data.ts"
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Curated metadata for tours matching existing project tours and assets
const CURATED_PROJECT_TOURS = {
  "802": {
    price: 120,
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Similan Islands",
    destinationCategory: "similan-islands",
    categoryId: "island-tours",
    categoryName: "Island Tours",
    tourType: "island-tours",
    badge: "Bestseller",
    badgeVariant: "bestseller",
    isFeatured: true,
    reviews: { rating: 4.9, reviewCount: 892 },
    images: ["/images/featured-tours/similan-islands-one-day-snorkelling.jpg"],
    subtitle: "Pristine white sand beaches and premier marine snorkeling adventure",
    description:
      "Visit Thailand’s crown jewel national park with powdery beaches, giant granite boulders, and sea turtles.",
    location: {
      city: "Khao Lak / Phuket",
      country: "Thailand",
      departurePoint: "Thap Lamu Pier",
    },
  },
  "2661": {
    price: 65,
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    categoryId: "island-tours",
    categoryName: "Island Tours",
    tourType: "island-tours",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: true,
    reviews: { rating: 4.8, reviewCount: 620 },
    images: ["/images/featured-tours/khai-islands-tour-premium.jpg"],
    subtitle: "Speedboat hopping to Khai Nok, Khai Nai, and Khai Nui islands",
    description:
      "Enjoy swimming, snorkeling, and relaxing on shallow turquoise shores ideal for families and first-time snorkelers.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Rassada Pier",
    },
  },
  "1187": {
    price: 89,
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Phi Phi Islands",
    destinationCategory: "phi-phi-islands",
    categoryId: "island-tours",
    categoryName: "Island Tours",
    tourType: "island-tours",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: true,
    reviews: { rating: 4.8, reviewCount: 1245 },
    images: ["/images/experiences/islands-tours.png"],
    subtitle: "Full-day speedboat excursion to Maya Bay, Monkey Beach, and Pileh Lagoon",
    description:
      "Cruise through emerald Andaman waters, swim in crystal lagoons, and explore the famous limestone cliffs of Koh Phi Phi.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Rassada Pier",
    },
  },
  "1469": {
    price: 95,
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "James Bond Island",
    destinationCategory: "james-bond-island",
    categoryId: "island-tours",
    categoryName: "Island Tours",
    tourType: "island-tours",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: true,
    reviews: { rating: 4.7, reviewCount: 980 },
    images: ["/images/experiences/islands-tours.png"],
    subtitle: "Phang Nga Bay sightseeing, sea canoeing, and floating Muslim village",
    description:
      "Paddle through hidden sea caves, see towering limestone pillars, and visit Koh Panyee floating village.",
    location: {
      city: "Phang Nga",
      country: "Thailand",
      departurePoint: "Ao Po Grand Marina",
    },
  },
  "854": {
    price: 68,
    duration: "Half Day",
    durationCategory: "half-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    categoryId: "cultural",
    categoryName: "Cultural",
    tourType: "cultural-sightseeing",
    badge: "New",
    badgeVariant: "new",
    isFeatured: true,
    reviews: { rating: 4.9, reviewCount: 530 },
    images: ["/images/tour-details/know-before-you-go.jpg"],
    subtitle: "Ethical seaside elephant interaction, washing, and feeding",
    description:
      "Connect with rescued gentle giants on the beach in an ethical, no-riding sanctuary environment.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Kamala Beach Sanctuary",
    },
  },
  "3717": {
    price: 75,
    duration: "Half Day",
    durationCategory: "half-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    categoryId: "shows-entertainment",
    categoryName: "Shows & Entertainment",
    tourType: "shows-entertainment",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: true,
    reviews: { rating: 4.7, reviewCount: 450 },
    images: ["/images/tour-details/know-before-you-go.jpg"],
    subtitle: "Award-winning cultural theme park and theatrical spectacle",
    description:
      "Experience the ultimate Thai cultural show featuring trapeze artists, state-of-the-art illusions, and vibrant traditions.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Kamala Beach",
    },
  },
  "4485": {
    price: 115,
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    categoryId: "snorkeling-diving",
    categoryName: "Snorkeling & Diving",
    tourType: "water-activities",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: true,
    reviews: { rating: 4.8, reviewCount: 380 },
    images: ["/images/experiences/snorkelling-adventures.jpg"],
    subtitle: "Two-dive guided underwater adventure for certified and beginner divers",
    description:
      "Discover vibrant coral gardens, schools of tropical fish, and warm Andaman waters under expert PADI supervision.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Chalong Pier",
    },
  },
  "3849": {
    price: 45,
    duration: "Half Day",
    durationCategory: "half-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    categoryId: "adventure",
    categoryName: "Adventure",
    tourType: "adventure",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: false,
    reviews: { rating: 4.6, reviewCount: 290 },
    images: ["/images/experiences/atv-land-adventures.jpg"],
    subtitle: "Off-road all-terrain vehicle jungle exploration",
    description:
      "Navigate dirt trails, rubber plantations, and lush hills on high-powered quad bikes.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Kathu Jungle Base",
    },
  },
  "4586": {
    price: 55,
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Coral Island",
    destinationCategory: "coral-island",
    categoryId: "island-tours",
    categoryName: "Island Tours",
    tourType: "island-tours",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: false,
    reviews: { rating: 4.7, reviewCount: 410 },
    images: ["/images/experiences/islands-tours.png"],
    subtitle: "Speedboat getaway to Banana Beach and snorkeling reefs",
    description:
      "Just 15 minutes from Chalong Pier, enjoy pure relaxation, beachside dining, and crystal-clear swimming.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Chalong Pier",
    },
  },
  "813": {
    price: 70,
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Racha Island",
    destinationCategory: "racha-island",
    categoryId: "island-tours",
    categoryName: "Island Tours",
    tourType: "island-tours",
    badge: "Popular",
    badgeVariant: "popular",
    isFeatured: false,
    reviews: { rating: 4.8, reviewCount: 340 },
    images: ["/images/experiences/islands-tours.png"],
    subtitle: "Racha Yai turquoise bay swimming and reef snorkeling",
    description:
      "Cruise to breathtaking Racha Island known for powdery white sands and stunning snorkeling bays.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Chalong Pier",
    },
  },
  "4667": {
    price: 35,
    duration: "Half Day",
    durationCategory: "half-day",
    destination: "Phi Phi Islands",
    destinationCategory: "phi-phi-islands",
    categoryId: "transfers",
    categoryName: "Transfers",
    tourType: "transfers",
    isFeatured: false,
    reviews: { rating: 4.6, reviewCount: 310 },
    images: ["/images/experiences/jet-ski-tours.jpg"],
    subtitle: "Fast, comfortable pier-to-pier express speedboat transfer",
    description:
      "Direct connection between Phuket Rassada Pier and Koh Phi Phi Tonsai Pier.",
    location: {
      city: "Phuket",
      country: "Thailand",
      departurePoint: "Rassada Pier",
    },
  },
};

export function parseDummyData() {
  const rawText = fs.readFileSync(DUMMY_DATA_PATH, "utf-8");
  const lines = rawText.split(/\r?\n/).filter((line) => line.trim().length > 0);

  const seenIds = new Set();
  const duplicateIds = [];
  const malformedLines = [];
  const tours = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const match = line.match(/^(\d+)\s+(.+)$/);

    if (!match) {
      malformedLines.push({ lineNumber: index + 1, content: line });
      continue;
    }

    const id = match[1];
    const title = match[2].trim();

    if (seenIds.has(id)) {
      duplicateIds.push({ lineNumber: index + 1, id, title });
    } else {
      seenIds.add(id);
    }

    // Check if this tour has curated existing project metadata
    const curated = CURATED_PROJECT_TOURS[id];

    if (curated) {
      tours.push({
        id,
        slug: `${slugify(title)}-${id}`,
        title,
        subtitle: curated.subtitle,
        description: curated.description,
        categoryId: curated.categoryId,
        categoryName: curated.categoryName,
        images: curated.images,
        featuredImage: curated.images[0],
        duration: curated.duration,
        durationCategory: curated.durationCategory,
        destination: curated.destination,
        destinationCategory: curated.destinationCategory,
        tourType: curated.tourType,
        ...(curated.badge ? { badge: curated.badge } : {}),
        ...(curated.badgeVariant ? { badgeVariant: curated.badgeVariant } : {}),
        ...(curated.isFeatured ? { isFeatured: curated.isFeatured } : {}),
        price: {
          amount: curated.price,
          currency: "$",
          perPersonLabel: "per person",
        },
        reviews: curated.reviews,
        location: curated.location,
      });
      continue;
    }

    // Determine Destination
    let destination = "Phuket";
    let destinationCategory = "phuket";

    if (/\b(phi[\s-]?phi|phiphi|maya)\b/i.test(title)) {
      destination = "Phi Phi Islands";
      destinationCategory = "phi-phi-islands";
    } else if (/\bsimilan\b/i.test(title)) {
      destination = "Similan Islands";
      destinationCategory = "similan-islands";
    } else if (
      /\b(bond|james\s+bond|phang\s+nga|phangnga|panyee)\b/i.test(title)
    ) {
      destination = "James Bond Island";
      destinationCategory = "james-bond-island";
    } else if (/\b(krabi|hong|ao[\s-]?nang|lanta)\b/i.test(title)) {
      destination = "Krabi";
      destinationCategory = "krabi";
    } else if (/\b(racha|raya)\b/i.test(title)) {
      destination = "Racha Island";
      destinationCategory = "racha-island";
    } else if (/\b(coral|banana\s+beach|koh\s+hey)\b/i.test(title)) {
      destination = "Coral Island";
      destinationCategory = "coral-island";
    } else if (/\b(khao\s+lak|khao\s+sok|cheow[\s-]?lan)\b/i.test(title)) {
      destination = "Phang Nga Bay";
      destinationCategory = "phang-nga-bay";
    }

    // Determine Duration
    let duration = "Full Day";
    let durationCategory = "full-day";

    if (
      /\b(2\s*days|3\s*days|7d6n|3d2n|2d1n|overnight|camp|package\s*–\s*[25]\s*days)\b/i.test(
        title
      )
    ) {
      duration = "Multi-day";
      durationCategory = "multi-day";
    } else if (
      /\b(half\s+day|morning|afternoon|sunset|min|mins|minute|minutes|1\s*hour|2\s*hour|3\s*hour|1\.5\s*hour|1hr|2\s*hrs|transfer|taxi|pass|ticket|ferry|one\s+way|bus)\b/i.test(
        title
      )
    ) {
      duration = "Half Day";
      durationCategory = "half-day";
    }

    // Determine Category & Tour Type
    let categoryId = "island-tours";
    let categoryName = "Island Tours";
    let tourType = "island-tours";

    if (
      /\b(transfer|taxi|bus|ferry|minibus|mini\s+van|one\s+way|driver|honda)\b/i.test(
        title
      )
    ) {
      categoryId = "transfers";
      categoryName = "Transfers";
      tourType = "transfers";
    } else if (
      /\b(show|cabaret|niramit|fantasea|boxing|waterpark|beach\s+club|yona|pass|ticket|rhapsody|sofa|cabana|bed)\b/i.test(
        title
      )
    ) {
      categoryId = "shows-entertainment";
      categoryName = "Shows & Entertainment";
      tourType = "shows-entertainment";
    } else if (
      /\b(scuba|diving|dive|padi|snorkeling|snorkelling|dolphin|dolphins|seal|surf|surfing|sup|jet\s+ski|canoe|canoes|canoeing)\b/i.test(
        title
      )
    ) {
      categoryId = "snorkeling-diving";
      categoryName = "Snorkeling & Diving";
      tourType = "water-activities";
    } else if (
      /\b(zipline|zip\s+line|hanuman|atv|buggy|go\s*kart|go-kart|bungy|zorbing|rollerball|tubing|rafting|biking|bike|paintballing)\b/i.test(
        title
      )
    ) {
      categoryId = "adventure";
      categoryName = "Adventure";
      tourType = "adventure";
    } else if (
      /\b(elephant|tiger|horse|city\s+tour|animal|safari|discovery|nature|volunteer)\b/i.test(
        title
      )
    ) {
      categoryId = "cultural";
      categoryName = "Cultural";
      tourType = "cultural-sightseeing";
    } else if (
      /\b(dinner|sunset\s+cruise|melody|starlight|bioluminescent)\b/i.test(title)
    ) {
      categoryId = "island-tours";
      categoryName = "Island Tours";
      tourType = "cruises";
    }

    // Determine Image mapping based on category/keywords
    let image = "/images/experiences/islands-tours.png";
    if (/\b(jet\s*ski)\b/i.test(title)) {
      image = "/images/experiences/jet-ski-tours.jpg";
    } else if (/\b(scuba|diving|dive|padi|snorkeling|snorkelling|dolphin|surf)\b/i.test(title)) {
      image = "/images/experiences/snorkelling-adventures.jpg";
    } else if (/\b(atv|buggy|zipline|zip\s+line|hanuman|bungy|kart|biking|zorbing|tubing|rafting)\b/i.test(title)) {
      image = "/images/experiences/atv-land-adventures.jpg";
    } else if (/\b(yacht|catamaran|cruising|cruise|boat\s+club|champagne|speed\s*boat|power\s*boat)\b/i.test(title)) {
      image = "/images/experiences/yacht-boat-tours.jpg";
    } else if (/\b(show|cabaret|niramit|fantasea|boxing|elephant|tiger|horse|safari|city\s+tour)\b/i.test(title)) {
      image = "/images/tour-details/know-before-you-go.jpg";
    } else if (/\b(similan)\b/i.test(title)) {
      image = durationCategory === "multi-day"
        ? "/images/featured-tours/similan-islands-2-days-1-night-tent.jpg"
        : "/images/featured-tours/similan-islands-one-day-snorkelling.jpg";
    } else if (/\b(khai)\b/i.test(title)) {
      image = "/images/featured-tours/khai-islands-tour-premium.jpg";
    } else if (categoryId === "transfers") {
      image = "/images/hero/hero-img.jpg";
    }

    // Tiered deterministic placeholder price within the 0-500 filter range
    let placeholderPrice = 85;
    const numId = parseInt(id, 10) || 1000;
    const priceVariance = (numId % 5) * 5; // $0, $5, $10, $15, $20

    if (durationCategory === "multi-day" || /\b(yacht|catamaran|private|charter)\b/i.test(title)) {
      placeholderPrice = 190 + priceVariance * 4; // $190 - $270
    } else if (categoryId === "transfers" || /\b(taxi|pass|ticket)\b/i.test(title)) {
      placeholderPrice = 25 + priceVariance; // $25 - $45
    } else if (durationCategory === "half-day") {
      placeholderPrice = 45 + priceVariance; // $45 - $65
    } else {
      placeholderPrice = 75 + priceVariance; // $75 - $95
    }

    tours.push({
      id,
      slug: `${slugify(title)}-${id}`,
      title,
      subtitle: `Client Tour #${id} · Placeholder schedule & pricing`,
      description: `Temporary dummy data for "${title}" (Client ID: ${id}). Official departure times, verified pricing, and inclusions are pending backend integration.`,
      categoryId,
      categoryName,
      images: [image],
      featuredImage: image,
      duration,
      durationCategory,
      destination,
      destinationCategory,
      tourType,
      price: {
        amount: placeholderPrice,
        currency: "$",
        perPersonLabel: "est. placeholder",
      },
      location: {
        city: destinationCategory === "phang-nga-bay" ? "Phang Nga" : "Phuket",
        country: "Thailand",
      },
      // reviews is undefined: no false reviews or fake ratings
    });
  }

  return {
    tours,
    duplicateIds,
    malformedLines,
    totalParsed: tours.length,
    rawLineCount: lines.length,
  };
}

// Generate the TypeScript data module
const { tours, duplicateIds, malformedLines, totalParsed, rawLineCount } =
  parseDummyData();

console.log(`Parsed ${totalParsed} tours from ${rawLineCount} lines.`);
console.log(`Duplicate IDs: ${duplicateIds.length}`);
console.log(`Malformed lines: ${malformedLines.length}`);

if (duplicateIds.length > 0) {
  console.warn("Warning: Duplicate IDs found:", duplicateIds);
}
if (malformedLines.length > 0) {
  console.warn("Warning: Malformed lines found:", malformedLines);
}

const fileHeader = `// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Sourced from: src/features/tours/data/dummydata.txt
// Generated by: scripts/parse-dummy-data.mjs
// Total tours: ${totalParsed}

import { Tour } from "../types/tour";

export const clientDummyTours: Tour[] = ${JSON.stringify(tours, null, 2)};
`;

fs.writeFileSync(OUTPUT_DATA_PATH, fileHeader, "utf-8");
console.log(`Successfully wrote ${totalParsed} tours to ${OUTPUT_DATA_PATH}`);
