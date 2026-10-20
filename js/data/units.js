// Unit definitions: plain data, no logic.
//
// Linear units have a `factor`: 1 of this unit equals `factor` base units.
//   Example: kilometer.factor = 1000 means 1 km = 1000 m (the base unit).
// Affine units (temperature) have `toBase` and `fromBase` functions instead,
// because they have an offset, not just a scale.
//
// Factors are written as arithmetic from exact definitions (e.g. 1000 / 3600)
// so they are easy to check against the source, not as rounded decimals.
//
// Sources:
//   [SI]   BIPM, The International System of Units (SI Brochure), 9th ed.
//   [1959] International Yard and Pound Agreement: 1 yd = 0.9144 m, 1 lb = 0.45359237 kg
//   [H44]  NIST Handbook 44, Appendix C (US customary volume: 1 gal = 231 in³)
//   [UK]   UK Weights and Measures Act 1985: 1 imperial gallon = 4.54609 L
//   [IEC]  IEC 80000-13: binary prefixes (1 KiB = 1024 B)
// Every factor below is exact by definition unless a comment says otherwise.

// Shared building blocks, so related units can't drift apart.
const INCH = 0.0254;            // m, exact [1959]
const FOOT = 12 * INCH;         // 0.3048 m
const YARD = 3 * FOOT;          // 0.9144 m
const MILE = 5280 * FOOT;       // 1609.344 m
const NAUTICAL_MILE = 1852;     // m, exact by international agreement
const POUND = 0.45359237;       // kg, exact [1959]
const US_GALLON = 231 * (INCH * 10) ** 3; // 231 in³ in liters (1 dm³ = 1 L) [H44]
const US_FLUID_OUNCE = US_GALLON / 128;
const IMPERIAL_GALLON = 4.54609; // L, exact [UK]
const HOUR = 3600;              // s
const JULIAN_YEAR = 365.25 * 86400; // s (decision in DESIGN.md §3)

const ABSOLUTE_ZERO_C = -273.15;

export const categories = {
  length: {
    label: 'Length',
    baseUnit: 'meter',
    defaultFrom: 'kilometer',
    defaultTo: 'mile',
    allowNegative: false,
    units: {
      millimeter:   { label: 'Millimeter',    symbol: 'mm',  factor: 0.001 },
      centimeter:   { label: 'Centimeter',    symbol: 'cm',  factor: 0.01 },
      meter:        { label: 'Meter',         symbol: 'm',   factor: 1 },
      kilometer:    { label: 'Kilometer',     symbol: 'km',  factor: 1000 },
      inch:         { label: 'Inch',          symbol: 'in',  factor: INCH },
      foot:         { label: 'Foot',          symbol: 'ft',  factor: FOOT },
      yard:         { label: 'Yard',          symbol: 'yd',  factor: YARD },
      mile:         { label: 'Mile',          symbol: 'mi',  factor: MILE },
      nauticalMile: { label: 'Nautical mile', symbol: 'nmi', factor: NAUTICAL_MILE },
    },
  },

  mass: {
    label: 'Weight / Mass',
    baseUnit: 'kilogram',
    defaultFrom: 'kilogram',
    defaultTo: 'pound',
    allowNegative: false,
    units: {
      milligram: { label: 'Milligram',    symbol: 'mg', factor: 1e-6 },
      gram:      { label: 'Gram',         symbol: 'g',  factor: 0.001 },
      kilogram:  { label: 'Kilogram',     symbol: 'kg', factor: 1 },
      tonne:     { label: 'Metric tonne', symbol: 't',  factor: 1000 },
      ounce:     { label: 'Ounce',        symbol: 'oz', factor: POUND / 16 },
      pound:     { label: 'Pound',        symbol: 'lb', factor: POUND },
      stone:     { label: 'Stone',        symbol: 'st', factor: POUND * 14 },
    },
  },

  temperature: {
    label: 'Temperature',
    baseUnit: 'kelvin',
    defaultFrom: 'celsius',
    defaultTo: 'fahrenheit',
    allowNegative: true,
    minBaseValue: 0, // absolute zero, in kelvin
    units: {
      celsius: {
        label: 'Celsius', symbol: '°C',
        toBase: (c) => c - ABSOLUTE_ZERO_C,
        fromBase: (k) => k + ABSOLUTE_ZERO_C,
      },
      fahrenheit: {
        label: 'Fahrenheit', symbol: '°F',
        toBase: (f) => (f - 32) * 5 / 9 - ABSOLUTE_ZERO_C,
        fromBase: (k) => (k + ABSOLUTE_ZERO_C) * 9 / 5 + 32,
      },
      kelvin: {
        label: 'Kelvin', symbol: 'K',
        toBase: (k) => k,
        fromBase: (k) => k,
      },
    },
  },

  area: {
    label: 'Area',
    baseUnit: 'squareMeter',
    defaultFrom: 'squareMeter',
    defaultTo: 'squareFoot',
    allowNegative: false,
    units: {
      squareMillimeter: { label: 'Square millimeter', symbol: 'mm²', factor: 1e-6 },
      squareCentimeter: { label: 'Square centimeter', symbol: 'cm²', factor: 1e-4 },
      squareMeter:      { label: 'Square meter',      symbol: 'm²',  factor: 1 },
      hectare:          { label: 'Hectare',           symbol: 'ha',  factor: 1e4 },
      squareKilometer:  { label: 'Square kilometer',  symbol: 'km²', factor: 1e6 },
      squareInch:       { label: 'Square inch',       symbol: 'in²', factor: INCH ** 2 },
      squareFoot:       { label: 'Square foot',       symbol: 'ft²', factor: FOOT ** 2 },
      squareYard:       { label: 'Square yard',       symbol: 'yd²', factor: YARD ** 2 },
      // International acre (43,560 ft² using the international foot).
      // The old US survey acre (4046.8726 m²) was retired with the survey foot in 2023.
      acre:             { label: 'Acre',              symbol: 'ac',  factor: 43560 * FOOT ** 2 },
      squareMile:       { label: 'Square mile',       symbol: 'mi²', factor: MILE ** 2 },
    },
  },

  volume: {
    label: 'Volume',
    baseUnit: 'liter',
    defaultFrom: 'liter',
    defaultTo: 'usGallon',
    allowNegative: false,
    units: {
      milliliter:    { label: 'Milliliter',          symbol: 'mL',      factor: 0.001 },
      liter:         { label: 'Liter',               symbol: 'L',       factor: 1 },
      cubicMeter:    { label: 'Cubic meter',         symbol: 'm³',      factor: 1000 },
      usTeaspoon:    { label: 'Teaspoon (US)',       symbol: 'tsp',     factor: US_FLUID_OUNCE / 6 },
      usTablespoon:  { label: 'Tablespoon (US)',     symbol: 'tbsp',    factor: US_FLUID_OUNCE / 2 },
      usFluidOunce:  { label: 'Fluid ounce (US)',    symbol: 'fl oz',   factor: US_FLUID_OUNCE },
      // US customary cup (8 fl oz ≈ 236.6 mL), not the 240 mL "legal" nutrition-label cup.
      usCup:         { label: 'Cup (US)',            symbol: 'cup',     factor: US_FLUID_OUNCE * 8 },
      usPint:        { label: 'Pint (US)',           symbol: 'pt',      factor: US_GALLON / 8 },
      usQuart:       { label: 'Quart (US)',          symbol: 'qt',      factor: US_GALLON / 4 },
      usGallon:      { label: 'Gallon (US)',         symbol: 'gal',     factor: US_GALLON },
      imperialPint:  { label: 'Pint (Imperial)',     symbol: 'imp pt',  factor: IMPERIAL_GALLON / 8 },
      imperialGallon:{ label: 'Gallon (Imperial)',   symbol: 'imp gal', factor: IMPERIAL_GALLON },
    },
  },

  time: {
    label: 'Time',
    baseUnit: 'second',
    defaultFrom: 'hour',
    defaultTo: 'minute',
    allowNegative: false,
    units: {
      millisecond: { label: 'Millisecond', symbol: 'ms',  factor: 0.001 },
      second:      { label: 'Second',      symbol: 's',   factor: 1 },
      minute:      { label: 'Minute',      symbol: 'min', factor: 60 },
      hour:        { label: 'Hour',        symbol: 'h',   factor: HOUR },
      day:         { label: 'Day',         symbol: 'd',   factor: 24 * HOUR },
      week:        { label: 'Week',        symbol: 'wk',  factor: 7 * 24 * HOUR },
      // Averages, not calendar months/years: see DESIGN.md §3.
      month:       { label: 'Month (avg.)', symbol: 'mo', factor: JULIAN_YEAR / 12, note: '1 month = 30.4375 days (average)' },
      year:        { label: 'Year (avg.)',  symbol: 'yr', factor: JULIAN_YEAR,      note: '1 year = 365.25 days (Julian year)' },
    },
  },

  speed: {
    label: 'Speed',
    baseUnit: 'meterPerSecond',
    defaultFrom: 'kilometerPerHour',
    defaultTo: 'milePerHour',
    allowNegative: false,
    units: {
      meterPerSecond:   { label: 'Meter per second',   symbol: 'm/s',  factor: 1 },
      kilometerPerHour: { label: 'Kilometer per hour', symbol: 'km/h', factor: 1000 / HOUR },
      milePerHour:      { label: 'Mile per hour',      symbol: 'mph',  factor: MILE / HOUR },
      footPerSecond:    { label: 'Foot per second',    symbol: 'ft/s', factor: FOOT },
      knot:             { label: 'Knot',               symbol: 'kn',   factor: NAUTICAL_MILE / HOUR },
    },
  },

  data: {
    label: 'Data Storage',
    baseUnit: 'byte',
    defaultFrom: 'gibibyte',
    defaultTo: 'mebibyte',
    allowNegative: false,
    // Binary (IEC) units only: decision in DESIGN.md §3.
    units: {
      bit:      { label: 'Bit',      symbol: 'bit', factor: 1 / 8 },
      byte:     { label: 'Byte',     symbol: 'B',   factor: 1 },
      kibibyte: { label: 'Kibibyte', symbol: 'KiB', factor: 2 ** 10 },
      mebibyte: { label: 'Mebibyte', symbol: 'MiB', factor: 2 ** 20 },
      gibibyte: { label: 'Gibibyte', symbol: 'GiB', factor: 2 ** 30 },
      tebibyte: { label: 'Tebibyte', symbol: 'TiB', factor: 2 ** 40 },
      pebibyte: { label: 'Pebibyte', symbol: 'PiB', factor: 2 ** 50 },
    },
  },
};

// Look up a category or a unit by id. Return undefined if it doesn't exist.
export function getCategory(categoryId) {
  return Object.hasOwn(categories, categoryId) ? categories[categoryId] : undefined;
}

export function getUnit(categoryId, unitId) {
  const category = getCategory(categoryId);
  if (!category || !Object.hasOwn(category.units, unitId)) return undefined;
  return category.units[unitId];
}
