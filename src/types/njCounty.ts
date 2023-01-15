export const NJ_COUNTIES = [
  'Atlantic',
  'Bergen',
  'Burlington',
  'Camden',
  'Cumberland',
  'Essex',
  'Gloucester',
  'Hudson',
  'Hunterdon',
  'Monmouth',
  'Morris',
  'Passaic',
  'Salem',
  'Union',
] as const;

export type NJCounty = typeof NJ_COUNTIES[number];
