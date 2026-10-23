/**
 * WasteVision Geo & Directions Utilities
 */

/**
 * Evaluates whether a report has valid numeric latitude & longitude coordinates.
 */
export function hasValidCoordinates(report) {
  if (!report) return false;
  const lat = typeof report.latitude === 'number' ? report.latitude : parseFloat(report.latitude);
  const lng = typeof report.longitude === 'number' ? report.longitude : parseFloat(report.longitude);
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Checks if a report has a meaningful human-readable address.
 */
export function hasMeaningfulAddress(report) {
  if (!report || !report.location_address) return false;
  const clean = String(report.location_address).trim();
  const lower = clean.toLowerCase();
  if (!clean || clean.length < 3) return false;
  const invalidKeywords = [
    'n/a',
    'na',
    'none',
    'unknown',
    'location unavailable',
    'unavailable',
    'not available',
    'null',
    'undefined'
  ];
  if (invalidKeywords.includes(lower)) {
    return false;
  }
  return true;
}

/**
 * Dynamically generates a standard Google Maps directions URL.
 * - If valid latitude and longitude are available, uses coordinates.
 * - Otherwise, uses the saved address text.
 * - If neither is available, returns null.
 */
export function getGoogleMapsDirectionsUrl(report) {
  if (!report) return null;

  if (hasValidCoordinates(report)) {
    const lat = typeof report.latitude === 'number' ? report.latitude : parseFloat(report.latitude);
    const lng = typeof report.longitude === 'number' ? report.longitude : parseFloat(report.longitude);
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  if (hasMeaningfulAddress(report)) {
    const address = String(report.location_address).trim();
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }

  return null;
}
