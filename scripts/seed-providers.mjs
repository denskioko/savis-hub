import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SAVIS_SEED_PASSWORD;

if (!url || !serviceRoleKey || !password) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SAVIS_SEED_PASSWORD before running the seed.");
}

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

const sectors = [
  ["Plumbing", "provider", ["Leak repairs", "Water tank installation", "Bathroom plumbing"], 1500],
  ["Electrical", "provider", ["Fault finding", "Wiring", "Lighting installation"], 1800],
  ["Carpentry", "provider", ["Furniture repair", "Custom shelves", "Doors and cabinets"], 2200],
  ["Masonry", "provider", ["Wall repairs", "Tiling", "Small construction"], 2000],
  ["Welding", "provider", ["Gates", "Grills", "Metal fabrication"], 2500],
  ["Painting", "provider", ["Interior painting", "Exterior painting", "Touch-ups"], 1600],
  ["Cleaning", "provider", ["Home cleaning", "Move-out cleaning", "Office cleaning"], 1200],
  ["Mechanics", "provider", ["Diagnostics", "Brake service", "General repairs"], 2000],
  ["Tailoring", "provider", ["Alterations", "Custom clothing", "Uniforms"], 900],
  ["Hardware", "seller", ["Plumbing fittings", "Electrical supplies", "Building materials"], 500],
  ["Quantity Surveying", "professional", ["Bills of quantities", "Cost estimates", "Project valuation"], 5000],
  ["Architecture", "professional", ["Concept drawings", "Planning drawings", "3D visualization"], 7500],
  ["Legal", "professional", ["Contract review", "Property matters", "Business advisory"], 6000],
  ["Accounting", "professional", ["Bookkeeping", "Tax preparation", "Financial statements"], 4500],
  ["Engineering", "professional", ["Structural review", "Site inspection", "Technical consultancy"], 6500],
];

const names = [
  "James Otieno","Grace Wanjiku","Peter Kamau","Amina Hassan","Brian Mutua",
  "Lucy Njeri","Samuel Kiptoo","David Ochieng","Mercy Akinyi","Kevin Mwangi",
  "Faith Wambui","Dennis Kariuki","Mary Atieno","Victor Omondi","Sharon Chebet",
  "Joseph Maina","Esther Nyambura","Daniel Kiplagat","Anne Wairimu","Collins Okoth",
  "Janet Moraa","Eric Njuguna","Cynthia Wambui","Martin Odhiambo","Irene Wangari",
  "George Muriuki","Naomi Achieng","Allan Kibet","Ruth Muthoni","Felix Ouma",
  "Caroline Wanjiru","Moses Kipchumba","Diana Adhiambo","Mark Kamau","Beatrice Njeri",
  "Simon Karanja","Hilda Jepchirchir","Paul Were","Susan Mumbi","Dennis Otieno",
  "Rachel Wambui","Caleb Mutua","Joyce Auma","Brian Kariuki","Lydia Wanjiku",
  "Andrew Kibet","Purity Akinyi","Robert Mwangi","Nancy Chepkirui","Elvis Ochieng"
];

const areas = [
  ["Ruiru",-1.145,36.962],["Kasarani",-1.2218,36.897],["Westlands",-1.2676,36.8108],
  ["Kilimani",-1.2921,36.7876],["Parklands",-1.258,36.817],["Ruaka",-1.2046,36.776],
  ["Eastleigh",-1.276,36.85],["Embakasi",-1.31,36.9],["Karen",-1.319,36.707],
  ["Lavington",-1.276,36.767],["Thika Road",-1.215,36.885],["Roysambu",-1.223,36.884],
  ["Ngong Road",-1.306,36.775],["South B",-1.31,36.84],["Kileleshwa",-1.286,36.778]
];

async function findOrCreateUser(email, fullName) {
  const existing = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) return found;

  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "provider", savis_seed: true }
  });
  if (created.error || !created.data.user) throw created.error || new Error("Could not create " + email);
  return created.data.user;
}

for (let i = 0; i < 50; i++) {
  const [category, role, services, baseRate] = sectors[i % sectors.length];
  const name = names[i];
  const area = areas[i % areas.length];
  const rate = baseRate + ((i * 350) % 1800);
  const email = `seed.provider.${String(i + 1).padStart(2, "0")}@savis.test`;
  const user = await findOrCreateUser(email, name);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: name,
    email,
    role: role === "seller" ? "seller" : role,
    avatar_url: `https://i.pravatar.cc/400?img=${(i % 70) + 1}`,
    latitude: area[1] + (((i % 5) - 2) * 0.0012),
    longitude: area[2] + (((i % 7) - 3) * 0.0012),
    location_name: area[0],
    service_category: category,
    hourly_rate: rate,
    rating: Number((4.2 + ((i * 7) % 8) / 10).toFixed(2)),
    review_count: 8 + ((i * 13) % 120),
    availability: i % 5 === 0 ? "Available now" : i % 3 === 0 ? "Available today" : "This week",
    verified: i % 4 !== 0,
    verification_status: i % 4 === 0 ? "pending" : "verified",
    bio: `${name} is a simulated SAVIS ${category.toLowerCase()} professional serving ${area[0]}. This profile is test data for the marketplace experience.`,
    service_area_km: 5 + (i % 4) * 5,
  }, { onConflict: "id" });
  if (profileError) throw profileError;

  await supabase.from("provider_services").delete().eq("provider_id", user.id);
  const serviceRows = services.map((service, j) => ({
    provider_id: user.id,
    name: service,
    description: `${service} offered by ${name} in ${area[0]}.`,
    category,
    starting_price: rate + j * 250,
    unit: category === "Quantity Surveying" || category === "Architecture" || category === "Legal" || category === "Accounting" || category === "Engineering" ? "consultation" : "job",
    is_active: true,
  }));
  const { error: serviceError } = await supabase.from("provider_services").insert(serviceRows);
  if (serviceError) throw serviceError;

  console.log(`Seeded ${i + 1}/50: ${name} — ${category} — ${area[0]}`);
}
