import {
  useChartZAxis,
  useChartCartesianAxis,
  useChartTooltip,
  useChartInteraction,
  useChartHighlight,
  useChartKeyboardNavigation,
  useChartBrush,
  useChartVisibilityManager,
  useChartItemActivation,
} from '@mui/x-charts/internals';
import type {
  ConvertSignaturesIntoPlugins,
  UseChartZAxisSignature,
  UseChartCartesianAxisSignature,
  UseChartTooltipSignature,
  UseChartInteractionSignature,
  UseChartHighlightSignature,
  UseChartKeyboardNavigationSignature,
  UseChartBrushSignature,
  UseChartVisibilityManagerSignature,
  UseChartItemActivationSignature,
} from '@mui/x-charts/internals';
import { useChartProExport } from '../internals/plugins/useChartProExport';
import type { UseChartProExportSignature } from '../internals/plugins/useChartProExport';
import { useChartProZoom } from '../internals/plugins/useChartProZoom';
import type { UseChartProZoomSignature } from '../internals/plugins/useChartProZoom';
import { useChartProSampling } from '../internals/plugins/useChartProSampling';
import type { UseChartProSamplingSignature } from '../internals/plugins/useChartProSampling';

export type BarChartProPluginSignatures = [
  UseChartZAxisSignature,
  UseChartBrushSignature,
  UseChartTooltipSignature<'bar'>,
  UseChartInteractionSignature,
  UseChartCartesianAxisSignature<'bar'>,
  UseChartHighlightSignature<'bar'>,
  UseChartVisibilityManagerSignature<'bar'>,
  UseChartKeyboardNavigationSignature,
  UseChartItemActivationSignature,
  UseChartProZoomSignature,
  UseChartProExportSignature,
  UseChartProSamplingSignature,
];

export const BAR_CHART_PRO_PLUGINS: ConvertSignaturesIntoPlugins<BarChartProPluginSignatures> = [
  useChartZAxis,
  useChartBrush,
  useChartTooltip,
  useChartInteraction,
  useChartCartesianAxis,
  useChartHighlight,
  useChartVisibilityManager,
  useChartKeyboardNavigation,
  useChartItemActivation,
  useChartProZoom,
  useChartProExport,
  useChartProSampling,
];
