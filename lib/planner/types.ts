export type RouteVariantDef = {
  id: string;
  group: string;
  shortLabel: string;
  title: string;
  color: string;
  lineStyle: string;
  geojson: GeoJSON.FeatureCollection;
};

export type ResistanceLayerDef = {
  id: string;
  label: string;
  iconGlyph: string;
  color: string;
  fillOpacity: number;
  geojson: GeoJSON.FeatureCollection;
};
