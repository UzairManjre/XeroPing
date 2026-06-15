export type UnitCategoryGroup = 
  | 'Common Converters'
  | 'Engineering Converters'
  | 'Heat Converters'
  | 'Fluids Converters'
  | 'Light Converters'
  | 'Electricity Converters'
  | 'Magnetism Converters'
  | 'Radiology Converters'
  | 'Mechanics Converters'
  | 'Misc Converters'
  | 'Computing Converters'
  | 'Typography Converters'
  | 'Science Converters';

export type UnitDefinition = {
  id: string;
  name: string;
  symbol: string;
  ratioToBase: number; // For temperatures or custom formulas, this is ignored if `toBase` and `fromBase` are provided.
  toBase?: (val: number) => number;
  fromBase?: (val: number) => number;
};

export type ConverterCategory = {
  id: string;
  name: string;
  group: UnitCategoryGroup;
  baseUnit: string; // the ID of the base unit all others are relative to
  units: UnitDefinition[];
};

export const UNIT_DATA: ConverterCategory[] = [
  // ================= COMMON CONVERTERS =================
  {
    id: 'length', name: 'Length & Distance', group: 'Common Converters', baseUnit: 'meter',
    units: [
      { id: 'meter', name: 'Meter', symbol: 'm', ratioToBase: 1 },
      { id: 'kilometer', name: 'Kilometer', symbol: 'km', ratioToBase: 1000 },
      { id: 'centimeter', name: 'Centimeter', symbol: 'cm', ratioToBase: 0.01 },
      { id: 'millimeter', name: 'Millimeter', symbol: 'mm', ratioToBase: 0.001 },
      { id: 'micrometer', name: 'Micrometer', symbol: 'µm', ratioToBase: 0.000001 },
      { id: 'nanometer', name: 'Nanometer', symbol: 'nm', ratioToBase: 0.000000001 },
      { id: 'picometer', name: 'Picometer', symbol: 'pm', ratioToBase: 0.000000000001 },
      { id: 'mile', name: 'Mile', symbol: 'mi', ratioToBase: 1609.344 },
      { id: 'yard', name: 'Yard', symbol: 'yd', ratioToBase: 0.9144 },
      { id: 'foot', name: 'Foot', symbol: 'ft', ratioToBase: 0.3048 },
      { id: 'inch', name: 'Inch', symbol: 'in', ratioToBase: 0.0254 },
      { id: 'nautical_mile', name: 'Nautical Mile', symbol: 'nmi', ratioToBase: 1852 },
      { id: 'fathom', name: 'Fathom', symbol: 'fathom', ratioToBase: 1.8288 },
      { id: 'light_year', name: 'Light Year', symbol: 'ly', ratioToBase: 9460730472580800 },
      { id: 'parsec', name: 'Parsec', symbol: 'pc', ratioToBase: 30856775814913670 },
      { id: 'astronomical_unit', name: 'Astronomical Unit', symbol: 'AU', ratioToBase: 149597870700 },
    ]
  },
  {
    id: 'mass', name: 'Weight & Mass', group: 'Common Converters', baseUnit: 'kilogram',
    units: [
      { id: 'kilogram', name: 'Kilogram', symbol: 'kg', ratioToBase: 1 },
      { id: 'gram', name: 'Gram', symbol: 'g', ratioToBase: 0.001 },
      { id: 'milligram', name: 'Milligram', symbol: 'mg', ratioToBase: 0.000001 },
      { id: 'microgram', name: 'Microgram', symbol: 'µg', ratioToBase: 0.000000001 },
      { id: 'metric_ton', name: 'Metric Ton', symbol: 't', ratioToBase: 1000 },
      { id: 'ton_short', name: 'US Ton (Short)', symbol: 'ton', ratioToBase: 907.1847 },
      { id: 'ton_long', name: 'UK Ton (Long)', symbol: 'ton', ratioToBase: 1016.047 },
      { id: 'pound', name: 'Pound', symbol: 'lb', ratioToBase: 0.45359237 },
      { id: 'ounce', name: 'Ounce', symbol: 'oz', ratioToBase: 0.02834952 },
      { id: 'stone', name: 'Stone', symbol: 'st', ratioToBase: 6.35029318 },
      { id: 'carat', name: 'Carat', symbol: 'ct', ratioToBase: 0.0002 },
      { id: 'grain', name: 'Grain', symbol: 'gr', ratioToBase: 0.00006479891 },
      { id: 'troy_ounce', name: 'Troy Ounce', symbol: 'ozt', ratioToBase: 0.03110348 },
    ]
  },
  {
    id: 'temperature', name: 'Temperature', group: 'Common Converters', baseUnit: 'celsius',
    units: [
      { id: 'celsius', name: 'Celsius', symbol: '°C', ratioToBase: 1, toBase: v => v, fromBase: v => v },
      { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', ratioToBase: 1, toBase: v => (v - 32) * 5/9, fromBase: v => (v * 9/5) + 32 },
      { id: 'kelvin', name: 'Kelvin', symbol: 'K', ratioToBase: 1, toBase: v => v - 273.15, fromBase: v => v + 273.15 },
      { id: 'rankine', name: 'Rankine', symbol: '°R', ratioToBase: 1, toBase: v => (v - 491.67) * 5/9, fromBase: v => (v * 9/5) + 491.67 },
      { id: 'reaumur', name: 'Réaumur', symbol: '°Re', ratioToBase: 1, toBase: v => v * 1.25, fromBase: v => v * 0.8 },
    ]
  },
  {
    id: 'volume', name: 'Volume & Capacity', group: 'Common Converters', baseUnit: 'liter',
    units: [
      { id: 'liter', name: 'Liter', symbol: 'L', ratioToBase: 1 },
      { id: 'milliliter', name: 'Milliliter', symbol: 'mL', ratioToBase: 0.001 },
      { id: 'cubic_meter', name: 'Cubic Meter', symbol: 'm³', ratioToBase: 1000 },
      { id: 'cubic_centimeter', name: 'Cubic Centimeter', symbol: 'cm³', ratioToBase: 0.001 },
      { id: 'cubic_inch', name: 'Cubic Inch', symbol: 'in³', ratioToBase: 0.0163871 },
      { id: 'cubic_foot', name: 'Cubic Foot', symbol: 'ft³', ratioToBase: 28.3168 },
      { id: 'gallon_us', name: 'US Gallon', symbol: 'gal', ratioToBase: 3.78541 },
      { id: 'gallon_uk', name: 'UK Gallon (Imperial)', symbol: 'gal(UK)', ratioToBase: 4.54609 },
      { id: 'quart_us', name: 'US Quart', symbol: 'qt', ratioToBase: 0.946353 },
      { id: 'pint_us', name: 'US Pint', symbol: 'pt', ratioToBase: 0.473176 },
      { id: 'cup_us', name: 'US Cup', symbol: 'cup', ratioToBase: 0.236588 },
      { id: 'fluid_ounce_us', name: 'US Fluid Ounce', symbol: 'fl oz', ratioToBase: 0.0295735 },
      { id: 'tablespoon_us', name: 'US Tablespoon', symbol: 'tbsp', ratioToBase: 0.0147868 },
      { id: 'teaspoon_us', name: 'US Teaspoon', symbol: 'tsp', ratioToBase: 0.00492892 },
      { id: 'dash', name: 'Dash (Cooking)', symbol: 'dash', ratioToBase: 0.000616115 },
      { id: 'pinch', name: 'Pinch (Cooking)', symbol: 'pinch', ratioToBase: 0.000308057 },
      { id: 'drop', name: 'Drop (Cooking)', symbol: 'drop', ratioToBase: 0.0000513429 },
    ]
  },
  {
    id: 'area', name: 'Area', group: 'Common Converters', baseUnit: 'square_meter',
    units: [
      { id: 'square_meter', name: 'Square Meter', symbol: 'm²', ratioToBase: 1 },
      { id: 'square_kilometer', name: 'Square Kilometer', symbol: 'km²', ratioToBase: 1000000 },
      { id: 'hectare', name: 'Hectare', symbol: 'ha', ratioToBase: 10000 },
      { id: 'acre', name: 'Acre', symbol: 'ac', ratioToBase: 4046.856 },
      { id: 'square_mile', name: 'Square Mile', symbol: 'sq mi', ratioToBase: 2589988 },
      { id: 'square_yard', name: 'Square Yard', symbol: 'sq yd', ratioToBase: 0.836127 },
      { id: 'square_foot', name: 'Square Foot', symbol: 'sq ft', ratioToBase: 0.092903 },
      { id: 'square_inch', name: 'Square Inch', symbol: 'sq in', ratioToBase: 0.00064516 },
    ]
  },
  {
    id: 'speed', name: 'Speed', group: 'Common Converters', baseUnit: 'meter_per_second',
    units: [
      { id: 'meter_per_second', name: 'Meter per second', symbol: 'm/s', ratioToBase: 1 },
      { id: 'kilometer_per_hour', name: 'Kilometer per hour', symbol: 'km/h', ratioToBase: 0.277778 },
      { id: 'mile_per_hour', name: 'Mile per hour', symbol: 'mph', ratioToBase: 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', ratioToBase: 0.514444 },
      { id: 'mach', name: 'Mach (Standard)', symbol: 'M', ratioToBase: 340.3 },
      { id: 'light_speed', name: 'Speed of Light', symbol: 'c', ratioToBase: 299792458 },
    ]
  },
  {
    id: 'time', name: 'Time', group: 'Common Converters', baseUnit: 'second',
    units: [
      { id: 'second', name: 'Second', symbol: 's', ratioToBase: 1 },
      { id: 'millisecond', name: 'Millisecond', symbol: 'ms', ratioToBase: 0.001 },
      { id: 'microsecond', name: 'Microsecond', symbol: 'µs', ratioToBase: 0.000001 },
      { id: 'nanosecond', name: 'Nanosecond', symbol: 'ns', ratioToBase: 0.000000001 },
      { id: 'minute', name: 'Minute', symbol: 'min', ratioToBase: 60 },
      { id: 'hour', name: 'Hour', symbol: 'h', ratioToBase: 3600 },
      { id: 'day', name: 'Day', symbol: 'd', ratioToBase: 86400 },
      { id: 'week', name: 'Week', symbol: 'wk', ratioToBase: 604800 },
      { id: 'month', name: 'Month (30 days)', symbol: 'mo', ratioToBase: 2592000 },
      { id: 'year', name: 'Year (365 days)', symbol: 'yr', ratioToBase: 31536000 },
      { id: 'decade', name: 'Decade', symbol: 'dec', ratioToBase: 315360000 },
      { id: 'century', name: 'Century', symbol: 'cen', ratioToBase: 3153600000 },
    ]
  },
  {
    id: 'pressure', name: 'Pressure', group: 'Common Converters', baseUnit: 'pascal',
    units: [
      { id: 'pascal', name: 'Pascal', symbol: 'Pa', ratioToBase: 1 },
      { id: 'kilopascal', name: 'Kilopascal', symbol: 'kPa', ratioToBase: 1000 },
      { id: 'megapascal', name: 'Megapascal', symbol: 'MPa', ratioToBase: 1000000 },
      { id: 'bar', name: 'Bar', symbol: 'bar', ratioToBase: 100000 },
      { id: 'millibar', name: 'Millibar', symbol: 'mbar', ratioToBase: 100 },
      { id: 'psi', name: 'PSI', symbol: 'psi', ratioToBase: 6894.76 },
      { id: 'atmosphere', name: 'Standard Atmosphere', symbol: 'atm', ratioToBase: 101325 },
      { id: 'torr', name: 'Torr', symbol: 'Torr', ratioToBase: 133.322 },
      { id: 'mmhg', name: 'Millimeter of mercury', symbol: 'mmHg', ratioToBase: 133.322 },
    ]
  },
  {
    id: 'energy', name: 'Energy', group: 'Common Converters', baseUnit: 'joule',
    units: [
      { id: 'joule', name: 'Joule', symbol: 'J', ratioToBase: 1 },
      { id: 'kilojoule', name: 'Kilojoule', symbol: 'kJ', ratioToBase: 1000 },
      { id: 'calorie', name: 'Gram calorie', symbol: 'cal', ratioToBase: 4.184 },
      { id: 'kilocalorie', name: 'Kilocalorie (Food)', symbol: 'kcal', ratioToBase: 4184 },
      { id: 'watt_hour', name: 'Watt hour', symbol: 'Wh', ratioToBase: 3600 },
      { id: 'kilowatt_hour', name: 'Kilowatt hour', symbol: 'kWh', ratioToBase: 3600000 },
      { id: 'electronvolt', name: 'Electronvolt', symbol: 'eV', ratioToBase: 0.0000000000000000001602176634 },
      { id: 'btu', name: 'BTU', symbol: 'BTU', ratioToBase: 1055.06 },
    ]
  },

  // ================= DATA & COMPUTING CONVERTERS =================
  {
    id: 'data', name: 'Data Storage', group: 'Computing Converters', baseUnit: 'byte',
    units: [
      { id: 'bit', name: 'Bit', symbol: 'b', ratioToBase: 0.125 },
      { id: 'byte', name: 'Byte', symbol: 'B', ratioToBase: 1 },
      { id: 'kilobyte', name: 'Kilobyte', symbol: 'KB', ratioToBase: 1024 },
      { id: 'megabyte', name: 'Megabyte', symbol: 'MB', ratioToBase: 1048576 },
      { id: 'gigabyte', name: 'Gigabyte', symbol: 'GB', ratioToBase: 1073741824 },
      { id: 'terabyte', name: 'Terabyte', symbol: 'TB', ratioToBase: 1099511627776 },
      { id: 'petabyte', name: 'Petabyte', symbol: 'PB', ratioToBase: 1125899906842624 },
    ]
  },
  {
    id: 'data_transfer', name: 'Data Transfer Rate', group: 'Computing Converters', baseUnit: 'bit_per_sec',
    units: [
      { id: 'bit_per_sec', name: 'Bit per second', symbol: 'bps', ratioToBase: 1 },
      { id: 'byte_per_sec', name: 'Byte per second', symbol: 'B/s', ratioToBase: 8 },
      { id: 'kilobit_per_sec', name: 'Kilobit per second', symbol: 'kbps', ratioToBase: 1000 },
      { id: 'kilobyte_per_sec', name: 'Kilobyte per second', symbol: 'KB/s', ratioToBase: 8000 },
      { id: 'megabit_per_sec', name: 'Megabit per second', symbol: 'Mbps', ratioToBase: 1000000 },
      { id: 'megabyte_per_sec', name: 'Megabyte per second', symbol: 'MB/s', ratioToBase: 8000000 },
      { id: 'gigabit_per_sec', name: 'Gigabit per second', symbol: 'Gbps', ratioToBase: 1000000000 },
      { id: 'gigabyte_per_sec', name: 'Gigabyte per second', symbol: 'GB/s', ratioToBase: 8000000000 },
    ]
  },

  // ================= MECHANICS CONVERTERS =================
  {
    id: 'force', name: 'Force', group: 'Mechanics Converters', baseUnit: 'newton',
    units: [
      { id: 'newton', name: 'Newton', symbol: 'N', ratioToBase: 1 },
      { id: 'kilonewton', name: 'Kilonewton', symbol: 'kN', ratioToBase: 1000 },
      { id: 'pound_force', name: 'Pound-force', symbol: 'lbf', ratioToBase: 4.44822 },
      { id: 'dyne', name: 'Dyne', symbol: 'dyn', ratioToBase: 0.00001 },
    ]
  },
  {
    id: 'power', name: 'Power', group: 'Mechanics Converters', baseUnit: 'watt',
    units: [
      { id: 'watt', name: 'Watt', symbol: 'W', ratioToBase: 1 },
      { id: 'kilowatt', name: 'Kilowatt', symbol: 'kW', ratioToBase: 1000 },
      { id: 'megawatt', name: 'Megawatt', symbol: 'MW', ratioToBase: 1000000 },
      { id: 'horsepower_metric', name: 'Horsepower (Metric)', symbol: 'hp', ratioToBase: 735.499 },
      { id: 'horsepower_imperial', name: 'Horsepower (Imperial)', symbol: 'hp(I)', ratioToBase: 745.7 },
      { id: 'btu_per_hour', name: 'BTU per hour', symbol: 'BTU/h', ratioToBase: 0.293071 },
    ]
  },
  {
    id: 'density', name: 'Density', group: 'Mechanics Converters', baseUnit: 'kg_m3',
    units: [
      { id: 'kg_m3', name: 'Kilogram/cubic meter', symbol: 'kg/m³', ratioToBase: 1 },
      { id: 'g_cm3', name: 'Gram/cubic centimeter', symbol: 'g/cm³', ratioToBase: 1000 },
      { id: 'lb_ft3', name: 'Pound/cubic foot', symbol: 'lb/ft³', ratioToBase: 16.01846 },
      { id: 'lb_in3', name: 'Pound/cubic inch', symbol: 'lb/in³', ratioToBase: 27679.9 },
    ]
  },

  // ================= MISC CONVERTERS =================
  {
    id: 'angle', name: 'Angle', group: 'Misc Converters', baseUnit: 'degree',
    units: [
      { id: 'degree', name: 'Degree', symbol: '°', ratioToBase: 1 },
      { id: 'radian', name: 'Radian', symbol: 'rad', ratioToBase: 57.29578 },
      { id: 'gradian', name: 'Gradian', symbol: 'grad', ratioToBase: 0.9 },
      { id: 'arcminute', name: 'Arcminute', symbol: "'", ratioToBase: 0.0166667 },
      { id: 'arcsecond', name: 'Arcsecond', symbol: '"', ratioToBase: 0.000277778 },
    ]
  },
  {
    id: 'fuel', name: 'Fuel Consumption', group: 'Misc Converters', baseUnit: 'km_per_liter',
    units: [
      { id: 'km_per_liter', name: 'Kilometer/Liter', symbol: 'km/L', ratioToBase: 1, toBase: v => v, fromBase: v => v },
      { id: 'miles_per_gallon', name: 'Miles/US Gallon', symbol: 'mpg', ratioToBase: 1, toBase: v => v * 0.425144, fromBase: v => v * 2.35215 },
      { id: 'liters_per_100km', name: 'Liters/100km', symbol: 'L/100km', ratioToBase: 1, toBase: v => 100 / v, fromBase: v => 100 / v },
    ]
  },
  {
    id: 'concentration', name: 'Concentration (Parts)', group: 'Science Converters', baseUnit: 'ppm',
    units: [
      { id: 'percent', name: 'Percentage', symbol: '%', ratioToBase: 10000 },
      { id: 'permille', name: 'Per mille', symbol: '‰', ratioToBase: 1000 },
      { id: 'ppm', name: 'Parts per million', symbol: 'ppm', ratioToBase: 1 },
      { id: 'ppb', name: 'Parts per billion', symbol: 'ppb', ratioToBase: 0.001 },
      { id: 'ppt', name: 'Parts per trillion', symbol: 'ppt', ratioToBase: 0.000001 },
    ]
  },

  // ================= TYPOGRAPHY CONVERTERS =================
  {
    id: 'typography', name: 'Typography Lengths', group: 'Typography Converters', baseUnit: 'pixel',
    units: [
      { id: 'pixel', name: 'Pixel (CSS)', symbol: 'px', ratioToBase: 1 },
      { id: 'point', name: 'Point', symbol: 'pt', ratioToBase: 1.333333 },
      { id: 'pica', name: 'Pica', symbol: 'pc', ratioToBase: 16 },
      { id: 'em', name: 'Em (assuming 16px base)', symbol: 'em', ratioToBase: 16 },
      { id: 'inch_typo', name: 'Inch', symbol: 'in', ratioToBase: 96 },
      { id: 'cm_typo', name: 'Centimeter', symbol: 'cm', ratioToBase: 37.795275 },
    ]
  },

  // ================= ENGINEERING CONVERTERS =================
  {
    id: 'velocity_angular', name: 'Velocity - Angular', group: 'Engineering Converters', baseUnit: 'rad_per_sec',
    units: [
      { id: 'rad_per_sec', name: 'Radian per second', symbol: 'rad/s', ratioToBase: 1 },
      { id: 'rpm', name: 'Revolutions per minute', symbol: 'RPM', ratioToBase: 0.104719755 },
      { id: 'deg_per_sec', name: 'Degrees per second', symbol: '°/s', ratioToBase: 0.0174532925 },
    ]
  },
  {
    id: 'torque', name: 'Torque', group: 'Engineering Converters', baseUnit: 'newton_meter',
    units: [
      { id: 'newton_meter', name: 'Newton Meter', symbol: 'N·m', ratioToBase: 1 },
      { id: 'pound_foot', name: 'Pound-foot', symbol: 'lb·ft', ratioToBase: 1.355818 },
      { id: 'pound_inch', name: 'Pound-inch', symbol: 'lb·in', ratioToBase: 0.1129848 },
    ]
  },
  {
    id: 'moment_of_inertia', name: 'Moment of Inertia', group: 'Engineering Converters', baseUnit: 'kg_m2',
    units: [
      { id: 'kg_m2', name: 'Kilogram square meter', symbol: 'kg·m²', ratioToBase: 1 },
      { id: 'lb_ft2', name: 'Pound square foot', symbol: 'lb·ft²', ratioToBase: 0.0421401 },
      { id: 'g_cm2', name: 'Gram square centimeter', symbol: 'g·cm²', ratioToBase: 0.0000001 },
      { id: 'slug_ft2', name: 'Slug square foot', symbol: 'slug·ft²', ratioToBase: 1.355818 },
    ]
  },
  {
    id: 'acceleration', name: 'Acceleration', group: 'Engineering Converters', baseUnit: 'm_s2',
    units: [
      { id: 'm_s2', name: 'Meter per square second', symbol: 'm/s²', ratioToBase: 1 },
      { id: 'cm_s2', name: 'Centimeter per square second', symbol: 'cm/s²', ratioToBase: 0.01 },
      { id: 'g_force', name: 'Standard gravity', symbol: 'g', ratioToBase: 9.80665 },
      { id: 'ft_s2', name: 'Foot per square second', symbol: 'ft/s²', ratioToBase: 0.3048 },
    ]
  },

  // ================= HEAT CONVERTERS =================
  {
    id: 'thermal_conductivity', name: 'Thermal Conductivity', group: 'Heat Converters', baseUnit: 'w_mk',
    units: [
      { id: 'w_mk', name: 'Watt/meter/Kelvin', symbol: 'W/(m·K)', ratioToBase: 1 },
      { id: 'btu_hr_ft_f', name: 'BTU (IT)/hour/foot/°F', symbol: 'BTU/(h·ft·°F)', ratioToBase: 1.730735 },
      { id: 'kcal_h_m_c', name: 'Kilocalorie/hour/meter/°C', symbol: 'kcal/(h·m·°C)', ratioToBase: 1.163 },
    ]
  },
  {
    id: 'specific_heat', name: 'Specific Heat Capacity', group: 'Heat Converters', baseUnit: 'j_kg_k',
    units: [
      { id: 'j_kg_k', name: 'Joule/kilogram/Kelvin', symbol: 'J/(kg·K)', ratioToBase: 1 },
      { id: 'kj_kg_k', name: 'Kilojoule/kilogram/Kelvin', symbol: 'kJ/(kg·K)', ratioToBase: 1000 },
      { id: 'btu_lb_f', name: 'BTU (IT)/pound/°F', symbol: 'BTU/(lb·°F)', ratioToBase: 4186.8 },
      { id: 'kcal_kg_c', name: 'Kilocalorie/kilogram/°C', symbol: 'kcal/(kg·°C)', ratioToBase: 4186.8 },
    ]
  },

  // ================= FLUIDS CONVERTERS =================
  {
    id: 'flow', name: 'Volumetric Flow Rate', group: 'Fluids Converters', baseUnit: 'm3_s',
    units: [
      { id: 'm3_s', name: 'Cubic meter/second', symbol: 'm³/s', ratioToBase: 1 },
      { id: 'm3_h', name: 'Cubic meter/hour', symbol: 'm³/h', ratioToBase: 0.000277778 },
      { id: 'l_min', name: 'Liter/minute', symbol: 'L/min', ratioToBase: 0.0000166667 },
      { id: 'l_s', name: 'Liter/second', symbol: 'L/s', ratioToBase: 0.001 },
      { id: 'gal_min', name: 'US Gallon/minute', symbol: 'gpm', ratioToBase: 0.0000630902 },
      { id: 'ft3_min', name: 'Cubic foot/minute', symbol: 'cfm', ratioToBase: 0.000471947 },
    ]
  },
  {
    id: 'viscosity_dynamic', name: 'Dynamic Viscosity', group: 'Fluids Converters', baseUnit: 'pa_s',
    units: [
      { id: 'pa_s', name: 'Pascal-second', symbol: 'Pa·s', ratioToBase: 1 },
      { id: 'poise', name: 'Poise', symbol: 'P', ratioToBase: 0.1 },
      { id: 'centipoise', name: 'Centipoise', symbol: 'cP', ratioToBase: 0.001 },
      { id: 'lb_s_ft2', name: 'Pound-second/square foot', symbol: 'lb·s/ft²', ratioToBase: 47.88026 },
    ]
  },

  // ================= LIGHT CONVERTERS =================
  {
    id: 'luminance', name: 'Luminance', group: 'Light Converters', baseUnit: 'cd_m2',
    units: [
      { id: 'cd_m2', name: 'Candela/square meter', symbol: 'cd/m²', ratioToBase: 1 },
      { id: 'nit', name: 'Nit', symbol: 'nt', ratioToBase: 1 },
      { id: 'footlambert', name: 'Footlambert', symbol: 'fL', ratioToBase: 3.426259 },
      { id: 'lambert', name: 'Lambert', symbol: 'L', ratioToBase: 3183.099 },
    ]
  },
  {
    id: 'illuminance', name: 'Illuminance', group: 'Light Converters', baseUnit: 'lux',
    units: [
      { id: 'lux', name: 'Lux', symbol: 'lx', ratioToBase: 1 },
      { id: 'footcandle', name: 'Foot-candle', symbol: 'fc', ratioToBase: 10.76391 },
      { id: 'phot', name: 'Phot', symbol: 'ph', ratioToBase: 10000 },
    ]
  },

  // ================= ELECTRICITY CONVERTERS =================
  {
    id: 'charge', name: 'Electric Charge', group: 'Electricity Converters', baseUnit: 'coulomb',
    units: [
      { id: 'coulomb', name: 'Coulomb', symbol: 'C', ratioToBase: 1 },
      { id: 'ampere_hour', name: 'Ampere-hour', symbol: 'Ah', ratioToBase: 3600 },
      { id: 'milliampere_hour', name: 'Milliampere-hour', symbol: 'mAh', ratioToBase: 3.6 },
      { id: 'faraday', name: 'Faraday (C12)', symbol: 'F', ratioToBase: 96485.3365 },
    ]
  },
  {
    id: 'current', name: 'Electric Current', group: 'Electricity Converters', baseUnit: 'ampere',
    units: [
      { id: 'ampere', name: 'Ampere', symbol: 'A', ratioToBase: 1 },
      { id: 'milliampere', name: 'Milliampere', symbol: 'mA', ratioToBase: 0.001 },
      { id: 'kiloampere', name: 'Kiloampere', symbol: 'kA', ratioToBase: 1000 },
      { id: 'biot', name: 'Biot', symbol: 'Bi', ratioToBase: 10 },
    ]
  },

  // ================= MAGNETISM CONVERTERS =================
  {
    id: 'magnetic_field', name: 'Magnetic Field Strength', group: 'Magnetism Converters', baseUnit: 'a_m',
    units: [
      { id: 'a_m', name: 'Ampere/meter', symbol: 'A/m', ratioToBase: 1 },
      { id: 'oersted', name: 'Oersted', symbol: 'Oe', ratioToBase: 79.57747 },
      { id: 'kiloampere_m', name: 'Kiloampere/meter', symbol: 'kA/m', ratioToBase: 1000 },
    ]
  },
  {
    id: 'magnetic_flux', name: 'Magnetic Flux', group: 'Magnetism Converters', baseUnit: 'weber',
    units: [
      { id: 'weber', name: 'Weber', symbol: 'Wb', ratioToBase: 1 },
      { id: 'maxwell', name: 'Maxwell', symbol: 'Mx', ratioToBase: 0.00000001 },
      { id: 'tesla_m2', name: 'Tesla square meter', symbol: 'T·m²', ratioToBase: 1 },
    ]
  },

  // ================= RADIOLOGY CONVERTERS =================
  {
    id: 'radiation', name: 'Radiation (Absorbed Dose)', group: 'Radiology Converters', baseUnit: 'gray',
    units: [
      { id: 'gray', name: 'Gray', symbol: 'Gy', ratioToBase: 1 },
      { id: 'rad', name: 'Rad', symbol: 'rad', ratioToBase: 0.01 },
      { id: 'milligray', name: 'Milligray', symbol: 'mGy', ratioToBase: 0.001 },
      { id: 'microgray', name: 'Microgray', symbol: 'µGy', ratioToBase: 0.000001 },
    ]
  },
  {
    id: 'radiation_exposure', name: 'Radiation Exposure', group: 'Radiology Converters', baseUnit: 'c_kg',
    units: [
      { id: 'c_kg', name: 'Coulomb/kilogram', symbol: 'C/kg', ratioToBase: 1 },
      { id: 'roentgen', name: 'Roentgen', symbol: 'R', ratioToBase: 0.000258 },
      { id: 'milliroentgen', name: 'Milliroentgen', symbol: 'mR', ratioToBase: 0.000000258 },
    ]
  },
  {
    id: 'radioactivity', name: 'Radioactivity', group: 'Radiology Converters', baseUnit: 'becquerel',
    units: [
      { id: 'becquerel', name: 'Becquerel', symbol: 'Bq', ratioToBase: 1 },
      { id: 'curie', name: 'Curie', symbol: 'Ci', ratioToBase: 37000000000 },
      { id: 'rutherford', name: 'Rutherford', symbol: 'Rd', ratioToBase: 1000000 },
    ]
  }
];

export const CATEGORY_GROUPS = Array.from(new Set(UNIT_DATA.map(c => c.group)));
