const CURRENCY_SYMBOLS: Record<string, string> = {
  THB: "฿",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function formatAgentCurrency(
  amount: number | string | null | undefined,
  currency?: string | null,
  fractionDigits = 2
): string {
  const num = Number(amount);
  const code = (currency || "THB").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || `${code} `;

  if (Number.isNaN(num)) {
    return fractionDigits === 0 ? `${symbol}0` : `${symbol}0.00`;
  }

  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function extractTravelDateRaw(
  availabilityOrBooking?: { availability?: { date?: string } | null; notes?: string | null } | string | null,
  fallbackNotes?: string | null
): string | null {
  if (typeof availabilityOrBooking === "string") {
    return availabilityOrBooking;
  }
  if (availabilityOrBooking && typeof availabilityOrBooking === "object") {
    if (availabilityOrBooking.availability?.date) {
      return availabilityOrBooking.availability.date;
    }
    const notesStr = fallbackNotes || availabilityOrBooking.notes;
    if (notesStr && typeof notesStr === "string") {
      const match = notesStr.match(/Travel Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  if (fallbackNotes && typeof fallbackNotes === "string") {
    const match = fallbackNotes.match(/Travel Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export interface ParsedGuests {
  adults: number;
  children: number;
  infants: number;
}

export function extractGuestsFromNotes(notes?: string | null): ParsedGuests | null {
  if (!notes || typeof notes !== "string") return null;

  // Patterns like "Guests: 2 Adults, 1 Child" or "Guests: 2 Adults" or "2 Adults / 1 Children"
  const adultsMatch = notes.match(/(\d+)\s*Adult/i);
  const childrenMatch = notes.match(/(\d+)\s*Child/i);
  const infantsMatch = notes.match(/(\d+)\s*Infant/i);

  if (adultsMatch || childrenMatch || infantsMatch) {
    return {
      adults: adultsMatch ? parseInt(adultsMatch[1], 10) : 0,
      children: childrenMatch ? parseInt(childrenMatch[1], 10) : 0,
      infants: infantsMatch ? parseInt(infantsMatch[1], 10) : 0,
    };
  }

  // Also check shorthand like "2A / 1C"
  const shortMatch = notes.match(/(\d+)A(?:\s*\/\s*(\d+)C)?(?:\s*\/\s*(\d+)I)?/i);
  if (shortMatch) {
    return {
      adults: parseInt(shortMatch[1], 10),
      children: shortMatch[2] ? parseInt(shortMatch[2], 10) : 0,
      infants: shortMatch[3] ? parseInt(shortMatch[3], 10) : 0,
    };
  }

  return null;
}

export function formatAgentDate(dateStr?: string | null, fallback = "N/A"): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

