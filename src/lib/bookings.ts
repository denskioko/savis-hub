// Shared booking store for the prototype (browser localStorage)

export type BookingStatus =
  | "requested"
  | "accepted"
  | "declined"
  | "completed";

export type Booking = {
  id: string;
  providerId: string;
  providerName: string;
  skill: string;
  description: string;
  location: string;
  urgency: string;
  rate: number;
  status: BookingStatus;
  createdAt: string;
  /** Optional display name of the consumer */
  consumerName?: string;
};

const KEY = "savis_bookings";

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addBooking(
  booking: Omit<Booking, "id" | "createdAt" | "status">
): Booking {
  const list = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    status: "requested",
    createdAt: new Date().toISOString(),
  };
  list.unshift(newBooking);
  localStorage.setItem(KEY, JSON.stringify(list));
  // Notify other tabs / pages in the same browser
  window.dispatchEvent(new Event("savis-bookings-updated"));
  return newBooking;
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus
): void {
  const list = getBookings().map((b) =>
    b.id === id ? { ...b, status } : b
  );
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("savis-bookings-updated"));
}

/** Bookings still waiting for a provider response */
export function getOpenRequests(): Booking[] {
  return getBookings().filter((b) => b.status === "requested");
}

/** Bookings a provider has accepted (active jobs) */
export function getAcceptedJobs(): Booking[] {
  return getBookings().filter((b) => b.status === "accepted");
}
