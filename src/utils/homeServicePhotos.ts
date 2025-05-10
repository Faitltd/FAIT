/**
 * Utility functions for working with home service photos
 */

// Define the base path to the home service photos folder
const BASE_PATH = '/Home service photos';

// Define categories of photos for easier selection
export const PHOTO_CATEGORIES = {
  KITCHEN: 'kitchen',
  BATHROOM: 'bathroom',
  LIVING_ROOM: 'living_room',
  BEDROOM: 'bedroom',
  EXTERIOR: 'exterior',
  BLUEPRINTS: 'blueprints',
  PEOPLE: 'people',
};

// Map of photo categories to their file paths
const PHOTO_MAP = {
  [PHOTO_CATEGORIES.KITCHEN]: [
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_kitche_0.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_kitche_1.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_kitche_2.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_kitche_3.jpg',
  ],
  [PHOTO_CATEGORIES.BATHROOM]: [
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_bathro_0.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_bathro_1.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_bathro_2.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_2020_modern_bathro_3.jpg',
  ],
  [PHOTO_CATEGORIES.LIVING_ROOM]: [
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_0.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_1.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_2.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_3.jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_0 (1).jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_1 (1).jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_2 (1).jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_3 (1).jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_0 (2).jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_1 (2).jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_2 (2).jpg',
    'Leonardo_Kino_XL_real_estate_photography_of_mid_century_modern_3 (2).jpg',
  ],
  [PHOTO_CATEGORIES.BLUEPRINTS]: [
    'Leonardo_Kino_XL_close_up_of_home_blueprints_0.jpg',
  ],
  [PHOTO_CATEGORIES.PEOPLE]: [
    'Leonardo_Kino_XL_a_happy_black_couple_smiling_and_giving_thumb_0.jpg',
    'Leonardo_Kino_XL_a_happy_black_couple_smiling_and_giving_thumb_3.jpg',
    'Leonardo_Kino_XL_a_happy_cambodian_couple_smiling_and_giving_t_1.jpg',
    'Leonardo_Kino_XL_a_happy_cambodian_couple_smiling_and_giving_t_3.jpg',
    'Leonardo_Kino_XL_a_happy_couple_smiling_and_giving_thumbs_up_i_1.jpg',
    'Leonardo_Kino_XL_a_happy_couple_smiling_and_giving_thumbs_up_i_3.jpg',
    'Leonardo_Kino_XL_a_happy_indian_couple_smiling_and_giving_thum_3.jpg',
    'Leonardo_Kino_XL_a_happy_mixed_family_smiling_and_giving_thumb_0.jpg',
    'Leonardo_Kino_XL_a_happy_mixed_family_smiling_and_giving_thumb_2.jpg',
    'Leonardo_Kino_XL_a_happy_thai_couple_smiling_and_giving_thumbs_0.jpg',
    'Leonardo_Kino_XL_a_happy_thai_couple_smiling_and_giving_thumbs_2.jpg',
  ],
};

/**
 * Get a random photo from a specific category
 * @param category The category of photo to get
 * @returns The path to a random photo from the specified category
 */
export const getRandomPhoto = (category: string): string => {
  const photos = PHOTO_MAP[category];
  if (!photos || photos.length === 0) {
    return '';
  }
  
  const randomIndex = Math.floor(Math.random() * photos.length);
  return `${BASE_PATH}/${photos[randomIndex]}`;
};

/**
 * Get a specific photo from a category by index
 * @param category The category of photo to get
 * @param index The index of the photo in the category array
 * @returns The path to the specified photo
 */
export const getPhotoByIndex = (category: string, index: number): string => {
  const photos = PHOTO_MAP[category];
  if (!photos || photos.length === 0 || index >= photos.length) {
    return '';
  }
  
  return `${BASE_PATH}/${photos[index]}`;
};

/**
 * Get all photos from a specific category
 * @param category The category of photos to get
 * @returns An array of paths to all photos in the specified category
 */
export const getAllPhotos = (category: string): string[] => {
  const photos = PHOTO_MAP[category];
  if (!photos || photos.length === 0) {
    return [];
  }
  
  return photos.map(photo => `${BASE_PATH}/${photo}`);
};

/**
 * Get a set of parallax layers configuration using photos from specified categories
 * @param categories Array of categories to use for layers
 * @param speeds Array of speeds for each layer (should match categories length)
 * @returns Configuration object for ParallaxLayers component
 */
export const getParallaxLayers = (
  categories: string[],
  speeds: number[] = []
) => {
  return categories.map((category, index) => ({
    image: getRandomPhoto(category),
    speed: speeds[index] || 0.2 + (index * 0.1), // Default speed formula if not provided
    opacity: 0.8 - (index * 0.2), // Decreasing opacity for deeper layers
    zIndex: categories.length - index
  }));
};
