export type PlannerState = {
  selectedVariantId: string;
  resistanceLayerVisibility: Record<string, boolean>;
};

export const DEFAULT_PLANNER_STATE: PlannerState = {
  selectedVariantId: "v-a7",
  resistanceLayerVisibility: {
    protected_forests: true,
    flood_zones: true,
    residential_buffers: false,
    industrial_utilities: true,
    topographical_constraints: true,
    cultural_heritage: false,
  },
};

