import type {
  ConvertSignaturesIntoPlugins,
  UseChartHighlightSignature,
  UseChartTooltipSignature,
  UseChartInteractionSignature,
  UseChartPolarAxisSignature,
  UseChartVisibilityManagerSignature,
  UseChartKeyboardNavigationSignature,
  UseChartItemActivationSignature,
} from '@mui/x-charts/internals';
import { RADAR_PLUGINS } from '@mui/x-charts/internals';
import { useChartProExport } from '../internals/plugins/useChartProExport';
import type { UseChartProExportSignature } from '../internals/plugins/useChartProExport';

export type RadarChartProPluginSignatures = [
  UseChartTooltipSignature<'radar'>,
  UseChartInteractionSignature,
  UseChartPolarAxisSignature,
  UseChartHighlightSignature<'radar'>,
  UseChartKeyboardNavigationSignature,
  UseChartVisibilityManagerSignature<'radar'>,
  UseChartItemActivationSignature,
  UseChartProExportSignature,
];

export const RADAR_CHART_PRO_PLUGINS: ConvertSignaturesIntoPlugins<RadarChartProPluginSignatures> =
  [...RADAR_PLUGINS, useChartProExport];
