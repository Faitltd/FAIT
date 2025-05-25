import {
  FoundationCalculationParams,
  WallCalculationParams,
  RoofCalculationParams,
  FloorCalculationParams,
  ConcreteCalculationParams,
  FramingCalculationParams,
  DrywallCalculationParams,
  PaintCalculationParams,
  CustomCalculationParams
} from '../types/estimate';

// Constants
const CUBIC_YARDS_TO_CUBIC_FEET = 27; // 1 cubic yard = 27 cubic feet
const SQUARE_FEET_PER_SHEET_DRYWALL = 32; // 4' x 8' sheet
const BOARD_FEET_PER_STUD = 8; // 8 board feet per 2x4x8 stud
const PAINT_COVERAGE_PER_GALLON = 400; // square feet per gallon

/**
 * Calculate foundation materials
 * @param params Foundation calculation parameters
 * @returns Calculation results
 */
export function calculateFoundation(params: FoundationCalculationParams) {
  const { length, width, depth, thickness = 4, type, reinforcement = false, wastage = 5 } = params;
  
  // Calculate volume in cubic feet
  let volume = length * width * (depth / 12); // Convert depth to feet
  
  // Add wastage
  volume = volume * (1 + wastage / 100);
  
  // Convert to cubic yards (concrete is measured in cubic yards)
  const concreteVolume = volume / CUBIC_YARDS_TO_CUBIC_FEET;
  
  // Calculate reinforcement if needed
  let reinforcementArea = 0;
  if (reinforcement) {
    reinforcementArea = length * width; // Square feet of rebar/mesh
  }
  
  // Calculate gravel base (if needed)
  let gravelVolume = 0;
  if (type === 'slab' || type === 'crawlspace') {
    gravelVolume = (length * width * (4 / 12)) / CUBIC_YARDS_TO_CUBIC_FEET; // 4 inch gravel base
  }
  
  return {
    concreteVolume: parseFloat(concreteVolume.toFixed(2)), // cubic yards
    reinforcementArea: parseFloat(reinforcementArea.toFixed(2)), // square feet
    gravelVolume: parseFloat(gravelVolume.toFixed(2)), // cubic yards
    formwork: parseFloat(((length * 2 + width * 2) * (depth / 12)).toFixed(2)) // linear feet
  };
}

/**
 * Calculate wall materials
 * @param params Wall calculation parameters
 * @returns Calculation results
 */
export function calculateWall(params: WallCalculationParams) {
  const { length, height, thickness, openings = [], type, insulation = false, wastage = 10 } = params;
  
  // Calculate wall area
  let wallArea = length * height;
  
  // Subtract openings
  const openingArea = openings.reduce((total, opening) => total + (opening.width * opening.height), 0);
  wallArea -= openingArea;
  
  // Add wastage
  wallArea = wallArea * (1 + wastage / 100);
  
  // Calculate materials based on wall type
  let materials: Record<string, number> = {};
  
  switch (type) {
    case 'brick':
      // Standard brick is 8" x 2.25" x 3.625"
      const bricksPerSqFt = 4.5; // Average number of bricks per square foot
      materials.bricks = Math.ceil(wallArea * bricksPerSqFt);
      materials.mortar = parseFloat((wallArea * 0.0375).toFixed(2)); // cubic feet of mortar
      break;
      
    case 'block':
      // Standard concrete block is 16" x 8" x 8"
      const blocksPerSqFt = 0.75; // 1.5 blocks per square foot
      materials.blocks = Math.ceil(wallArea * blocksPerSqFt);
      materials.mortar = parseFloat((wallArea * 0.05).toFixed(2)); // cubic feet of mortar
      break;
      
    case 'wood':
      // Calculate studs (16" on center)
      const studsPerFoot = 0.75; // 3/4 stud per foot (16" on center)
      materials.studs = Math.ceil(length * studsPerFoot) + 2; // Add corner studs
      materials.plates = Math.ceil(length / 8) * 2; // Top and bottom plates in 8' lengths
      materials.sheathingSheets = Math.ceil(wallArea / 32); // 4'x8' sheets
      break;
      
    case 'concrete':
      // Calculate concrete volume
      materials.concreteVolume = parseFloat(((wallArea * (thickness / 12)) / CUBIC_YARDS_TO_CUBIC_FEET).toFixed(2)); // cubic yards
      materials.formwork = parseFloat((length * 2 * height).toFixed(2)); // square feet of formwork
      break;
  }
  
  // Add insulation if needed
  if (insulation) {
    materials.insulationSqFt = parseFloat(wallArea.toFixed(2));
  }
  
  return {
    wallArea: parseFloat(wallArea.toFixed(2)), // square feet
    materials
  };
}

/**
 * Calculate roof materials
 * @param params Roof calculation parameters
 * @returns Calculation results
 */
export function calculateRoof(params: RoofCalculationParams) {
  const { length, width, pitch, overhang = 0, type, wastage = 15 } = params;
  
  // Calculate base roof area
  const baseArea = length * width;
  
  // Calculate actual roof area based on pitch
  const pitchMultiplier = 1 + (Math.tan(pitch * Math.PI / 180) ** 2);
  let roofArea = baseArea * Math.sqrt(pitchMultiplier);
  
  // Add overhang
  if (overhang > 0) {
    const overallLength = length + (overhang * 2);
    const overallWidth = width + (overhang * 2);
    const overallArea = overallLength * overallWidth * Math.sqrt(pitchMultiplier);
    roofArea = overallArea;
  }
  
  // Add wastage
  roofArea = roofArea * (1 + wastage / 100);
  
  // Calculate materials based on roof type
  let materials: Record<string, number> = {};
  
  switch (type) {
    case 'shingle':
      // Asphalt shingles typically come in bundles that cover 33.3 sq ft
      const squaresNeeded = roofArea / 100; // 1 square = 100 sq ft
      materials.shingleBundles = Math.ceil(squaresNeeded * 3); // 3 bundles per square
      materials.underlaymentRolls = Math.ceil(roofArea / 400); // 1 roll covers ~400 sq ft
      materials.ridgeVent = Math.ceil(length); // Linear feet
      break;
      
    case 'metal':
      // Metal roofing typically comes in panels
      const panelWidth = 3; // 3 feet wide
      materials.metalPanels = Math.ceil(roofArea / (panelWidth * 8)); // 8' long panels
      materials.screws = Math.ceil(materials.metalPanels * 30); // ~30 screws per panel
      break;
      
    case 'tile':
      // Concrete/clay tiles
      const tilesPerSqFt = 1; // Approximately 1 tile per square foot
      materials.tiles = Math.ceil(roofArea * tilesPerSqFt);
      materials.underlaymentRolls = Math.ceil(roofArea / 400);
      break;
      
    case 'flat':
      // EPDM or similar membrane
      materials.membraneArea = parseFloat(roofArea.toFixed(2));
      materials.adhesive = Math.ceil(roofArea / 200); // Gallons (1 gallon covers ~200 sq ft)
      break;
  }
  
  return {
    roofArea: parseFloat(roofArea.toFixed(2)), // square feet
    materials
  };
}

/**
 * Calculate floor materials
 * @param params Floor calculation parameters
 * @returns Calculation results
 */
export function calculateFloor(params: FloorCalculationParams) {
  const { length, width, type, wastage = 10 } = params;
  
  // Calculate floor area
  let floorArea = length * width;
  
  // Add wastage
  floorArea = floorArea * (1 + wastage / 100);
  
  // Calculate materials based on floor type
  let materials: Record<string, number> = {};
  
  switch (type) {
    case 'tile':
      // Standard tile is 12" x 12"
      const tilesPerSqFt = 1; // 1 tile per square foot
      materials.tiles = Math.ceil(floorArea * tilesPerSqFt);
      materials.thinset = Math.ceil(floorArea / 95); // 50 lb bag covers ~95 sq ft
      materials.grout = Math.ceil(floorArea / 75); // 25 lb bag covers ~75 sq ft
      break;
      
    case 'wood':
      // Hardwood flooring
      materials.woodSqFt = Math.ceil(floorArea);
      materials.underlayment = Math.ceil(floorArea);
      break;
      
    case 'carpet':
      // Carpet with padding
      materials.carpetSqYd = Math.ceil(floorArea / 9); // Convert to square yards
      materials.paddingSqYd = Math.ceil(floorArea / 9);
      break;
      
    case 'concrete':
      // Concrete slab
      materials.concreteCuYd = parseFloat(((floorArea * (4 / 12)) / CUBIC_YARDS_TO_CUBIC_FEET).toFixed(2)); // 4" thick slab
      break;
      
    case 'vinyl':
      // Vinyl flooring
      materials.vinylSqFt = Math.ceil(floorArea);
      materials.adhesive = Math.ceil(floorArea / 200); // Gallons
      break;
  }
  
  return {
    floorArea: parseFloat(floorArea.toFixed(2)), // square feet
    materials
  };
}

/**
 * Calculate concrete materials
 * @param params Concrete calculation parameters
 * @returns Calculation results
 */
export function calculateConcrete(params: ConcreteCalculationParams) {
  const { length, width, depth, reinforcement = false, psi = 3000, wastage = 10 } = params;
  
  // Calculate volume in cubic feet
  let volume = length * width * (depth / 12); // Convert depth to feet
  
  // Add wastage
  volume = volume * (1 + wastage / 100);
  
  // Convert to cubic yards (concrete is measured in cubic yards)
  const concreteVolume = volume / CUBIC_YARDS_TO_CUBIC_FEET;
  
  // Calculate reinforcement if needed
  let reinforcementArea = 0;
  if (reinforcement) {
    reinforcementArea = length * width; // Square feet of rebar/mesh
  }
  
  // Calculate number of bags needed (1 bag = 80 lbs, yields ~0.6 cubic feet)
  const bagsNeeded = Math.ceil(volume / 0.6);
  
  return {
    concreteVolume: parseFloat(concreteVolume.toFixed(2)), // cubic yards
    bagsNeeded: bagsNeeded, // 80 lb bags
    reinforcementArea: parseFloat(reinforcementArea.toFixed(2)), // square feet
    formwork: parseFloat(((length * 2 + width * 2) * (depth / 12)).toFixed(2)) // linear feet
  };
}

/**
 * Calculate framing materials
 * @param params Framing calculation parameters
 * @returns Calculation results
 */
export function calculateFraming(params: FramingCalculationParams) {
  const { length, height, spacing, type, wastage = 15 } = params;
  
  // Calculate number of studs
  const studsPerFoot = 12 / spacing; // studs per foot based on spacing
  let studs = Math.ceil(length * studsPerFoot) + 2; // Add corner studs
  
  // Add wastage
  studs = Math.ceil(studs * (1 + wastage / 100));
  
  // Calculate plates (top and bottom)
  const platesNeeded = Math.ceil(length / 8) * 2; // 8' lengths, double top plate
  
  // Calculate board feet
  let boardFeet = 0;
  
  switch (type) {
    case '2x4':
      boardFeet = (studs * (height / 12) * (4/12) * 2) + (platesNeeded * 8);
      break;
    case '2x6':
      boardFeet = (studs * (height / 12) * (6/12) * 2) + (platesNeeded * 8 * (6/4));
      break;
    case '2x8':
      boardFeet = (studs * (height / 12) * (8/12) * 2) + (platesNeeded * 8 * (8/4));
      break;
    case '2x10':
      boardFeet = (studs * (height / 12) * (10/12) * 2) + (platesNeeded * 8 * (10/4));
      break;
    case '2x12':
      boardFeet = (studs * (height / 12) * (12/12) * 2) + (platesNeeded * 8 * (12/4));
      break;
  }
  
  return {
    studs: studs,
    plates: platesNeeded,
    boardFeet: parseFloat(boardFeet.toFixed(2)),
    wallLength: parseFloat(length.toFixed(2)),
    wallHeight: parseFloat(height.toFixed(2))
  };
}

/**
 * Calculate drywall materials
 * @param params Drywall calculation parameters
 * @returns Calculation results
 */
export function calculateDrywall(params: DrywallCalculationParams) {
  const { length, height, openings = [], thickness, wastage = 10 } = params;
  
  // Calculate wall area
  let wallArea = length * height;
  
  // Subtract openings
  const openingArea = openings.reduce((total, opening) => total + (opening.width * opening.height), 0);
  wallArea -= openingArea;
  
  // Add wastage
  wallArea = wallArea * (1 + wastage / 100);
  
  // Calculate number of sheets needed (standard sheet is 4' x 8' = 32 sq ft)
  const sheetsNeeded = Math.ceil(wallArea / SQUARE_FEET_PER_SHEET_DRYWALL);
  
  // Calculate joint compound and tape
  const jointCompoundNeeded = Math.ceil(wallArea / 300); // 5 gallon bucket covers ~300 sq ft
  const tapeNeeded = Math.ceil(wallArea / 100); // 250 ft roll covers ~100 sq ft of wall
  
  // Calculate screws (approx. 30 screws per sheet)
  const screwsNeeded = sheetsNeeded * 30;
  
  return {
    wallArea: parseFloat(wallArea.toFixed(2)), // square feet
    sheetsNeeded: sheetsNeeded,
    jointCompound: jointCompoundNeeded, // 5 gallon buckets
    tape: tapeNeeded, // rolls
    screws: screwsNeeded,
    thickness: thickness
  };
}

/**
 * Calculate paint materials
 * @param params Paint calculation parameters
 * @returns Calculation results
 */
export function calculatePaint(params: PaintCalculationParams) {
  const { area, coats, type, wastage = 10 } = params;
  
  // Add wastage
  const totalArea = area * (1 + wastage / 100);
  
  // Calculate total area to be painted (considering multiple coats)
  const totalPaintArea = totalArea * coats;
  
  // Calculate gallons needed (1 gallon covers ~400 sq ft, depending on surface)
  let coverage = PAINT_COVERAGE_PER_GALLON;
  
  // Adjust coverage based on paint type
  if (type === 'primer') {
    coverage = 300; // Primer typically covers less area
  } else if (type === 'exterior') {
    coverage = 350; // Exterior paint may cover less due to surface texture
  }
  
  const gallonsNeeded = Math.ceil(totalPaintArea / coverage);
  
  return {
    paintArea: parseFloat(totalArea.toFixed(2)), // square feet
    totalPaintArea: parseFloat(totalPaintArea.toFixed(2)), // square feet with coats
    gallonsNeeded: gallonsNeeded,
    coats: coats,
    type: type
  };
}

/**
 * Evaluate a custom formula with variables
 * @param params Custom calculation parameters
 * @returns Calculation results
 */
export function calculateCustom(params: CustomCalculationParams) {
  const { formula, variables } = params;
  
  try {
    // Create a function from the formula
    const evalFunction = new Function(...Object.keys(variables), `return ${formula}`);
    
    // Execute the function with the variables
    const result = evalFunction(...Object.values(variables));
    
    return {
      result: parseFloat(Number(result).toFixed(2)),
      formula: formula,
      variables: variables
    };
  } catch (error) {
    console.error('Error evaluating custom formula:', error);
    return {
      result: 0,
      formula: formula,
      variables: variables,
      error: 'Invalid formula'
    };
  }
}

/**
 * Main calculation function that routes to the appropriate calculator
 * @param type Calculation type
 * @param params Calculation parameters
 * @returns Calculation results
 */
export function calculateEstimate(type: string, params: any) {
  switch (type) {
    case 'foundation':
      return calculateFoundation(params as FoundationCalculationParams);
    case 'wall':
      return calculateWall(params as WallCalculationParams);
    case 'roof':
      return calculateRoof(params as RoofCalculationParams);
    case 'floor':
      return calculateFloor(params as FloorCalculationParams);
    case 'concrete':
      return calculateConcrete(params as ConcreteCalculationParams);
    case 'framing':
      return calculateFraming(params as FramingCalculationParams);
    case 'drywall':
      return calculateDrywall(params as DrywallCalculationParams);
    case 'paint':
      return calculatePaint(params as PaintCalculationParams);
    case 'custom':
      return calculateCustom(params as CustomCalculationParams);
    default:
      throw new Error(`Unknown calculation type: ${type}`);
  }
}
