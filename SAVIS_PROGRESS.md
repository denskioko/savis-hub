# SAVIS — Project Progress Snapshot

Last updated: 2026-10-03

## Product
SAVIS is a Kenya-focused marketplace connecting consumers with trusted local helpers, providers, professionals, sellers and agents.

## Current production
- Vercel production: https://savis-alpha.vercel.app/
- GitHub repo: https://github.com/yungfillyke/savis
- Main branch contains the merged Home, Settings, Account Menu, location foundation and map foundation.

## Roles
- Consumer
- Provider
- Professional
- Seller
- Agent

## Completed
### Consumer Home UX
- Account/welcome information at the top
- Search
- Location section
- Sponsored ad placeholder
- Categories
- Nearby provider cards
- Recommendations
- Bottom navigation
- Account menu with Profile, Settings, Bookings, Messages and role-related links
- Agent promotion removed from Home

### Account / Settings
- Profile page
- Settings page
- Dark mode preference prototype
- English/Swahili preference
- Notifications preference
- Location preference
- Account menu
- Messages placeholder
- Bookings flow exists

### Location foundation
- Browser geolocation opt-in
- Location saved in localStorage
- User coordinates can be written to Supabase profile
- Great-circle distance calculation
- Booking requests can carry consumer latitude/longitude/accuracy
- Existing booking flow has fallback behavior if the location migration is not yet applied

### Maps
- OpenStreetMap embedded map on Consumer Home
- Current location can center the map
- Open-map link available
- This is still a foundation: it is not yet the final interactive multi-marker map.

## Important current limitation
The Supabase SQL migration has been prepared in `supabase/schema.sql`, but it has NOT been confirmed as executed in the Supabase project.

The migration has been run successfully in the Supabase project. The latest migration also adds persistent provider availability and scheduled job dates.

The migration adds:
- profiles.latitude
- profiles.longitude
- profiles.location_name
- profiles.service_category
- profiles.hourly_rate
- profiles.rating
- profiles.review_count
- profiles.availability
- profiles.verified
- profiles.bio
- jobs.latitude
- jobs.longitude
- jobs.location_accuracy
- jobs.scheduled_for
- indexes for discovery
- `search_nearby_providers(...)` RPC using a Haversine-style distance calculation
- `provider_availability` with weekday, working hours and travel-radius persistence

## Latest merged development
Branch: `main`

Latest merged feature: Provider Management Hub calendar + persistent availability

This branch:
- Restored the full Consumer Home after the previous location PR accidentally removed most of the page content.
- Added a real-provider discovery path from Supabase profiles.
- Added the nearby-provider RPC integration with fallback to profile querying.
- Kept sample providers as an Alpha fallback until real provider profiles exist.
- Updated provider detail pages so real Supabase provider IDs can open a provider profile and booking flow.
- Preserved the existing booking/location behavior.

Latest commits:
- Provider calendar/availability merge: `581a8d16b165a440969265b79edb14679c42441a`
- Provider calendar UI: `95399855d2273081f27503de25f050d2a5af98c5`
- Scheduled job support: `a04b0b57f480e6d25fdce0daab2bb9354a41498e`
- Persistent availability schema: `13f3239acd983bbf517dadb8876100da0506463f`
- Consumer Home restoration + discovery foundation: `7bde13abb5d3b3cbc775faffd39c156e9d9d0e0a`
- Supabase provider metadata + nearby RPC: `4c6873f009c164a548b5a575f1f59a2688915c3b`
- Provider detail connection: `b73f3c0051cb509cd1c55ee33b162de209729e9e`

## Next steps — do these in order
1. Open the Provider Hub and test month navigation, date selection, working/off-day toggles, hours and travel radius.
2. Re-run the current `supabase/schema.sql` in Supabase if the new `provider_availability` table or `jobs.scheduled_for` column are not yet present.
3. Create/publish at least one real Provider profile with:
   - role = provider
   - service_category
   - latitude
   - longitude
   - location_name
   - hourly_rate
   - availability
   - verified
   - bio
4. Test Consumer Home:
   - login
   - enable location
   - confirm live provider discovery
   - change category
   - search
   - open provider profile
   - send booking request
   - verify booking contains consumer coordinates
5. After that, build the proper interactive map layer with multiple provider markers.
6. Then improve provider onboarding/verification so providers can enter and maintain their own service/location data.
7. Later: M-Pesa, real wallet/escrow, messaging backend, notifications and agent commissions.

## What is NOT finished yet
- Real scheduled-date selection in the consumer booking form is still the next booking-flow step; the backend now supports `jobs.scheduled_for`.
- Real provider data is not populated yet.
- Multi-provider interactive map markers are not finished.
- Real routing/navigation is not finished.
- Provider verification backend is not finished.
- M-Pesa integration is not finished.
- Messaging backend is not finished.
- Wallet/escrow is still prototype/local.
- Ads and recommendations are still prototype/static.
- Search is still partly client-side.
- No full local TypeScript/test run has been performed; the production deployment for merge `581a8d16b165a440969265b79edb14679c42441a` reached READY in Vercel.

## Continuation instruction
When continuing this project, do NOT rebuild SAVIS from the old uploaded `index.html`. Use the current GitHub main/active branch and the live Alpha as the source of truth. The old HTML is only a historical design/feature reference.


## Provider Hub — current
- Moonlit galaxy provider-only theme.
- Jobs & Schedule now has a real month calendar with previous/next month navigation.
- Calendar marks working days, off days and scheduled jobs.
- Job IDs and scheduled job value are shown when jobs have scheduled dates.
- Selecting a date opens recurring weekday schedule controls.
- Provider availability (working day, start/end time, travel radius) persists to Supabase.
- Provider Online/Offline status persists to the provider profile.
- Products & Shop remains conditional for sellers/physical-goods providers.
- Social & Portfolio, Messages, and Analytics & Earnings tabs remain part of the hub.
