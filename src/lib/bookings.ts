// Simple local storage for prototype bookings (no backend table yet)

export type Booking = {
  id: string;
  providerId: string;
  providerName: string;
  skill: string;
  description: string;
  location: string;
  urgency: string;
  rate: number;
  status: "requested" | "accepted" | "declined" | "completed";
  createdAt: string;
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
  return newBooking;
}

export function updateBookingStatus(
  id: string,
  status: Booking["status"]
): void {
  const list = getBookings().map((b) =>
    b.id === id ? { ...b, status } : b
  );
  localStorage.setItem(KEY, JSON.stringify(list));
}
