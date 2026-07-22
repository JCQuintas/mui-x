import {
  useChartTooltip,
  useChartInteraction,
  useChartKeyboardNavigation,
  useChartHighlight,
  useChartItemActivation,
} from '@mui/x-charts/internals';
import type {
  ConvertSignaturesIntoPlugins,
  UseChartTooltipSignature,
  UseChartInteractionSignature,
  UseChartKeyboardNavigationSignature,
  UseChartHighlightSignature,
  UseChartItemActivationSignature,
} from '@mui/x-charts/internals';
import { useChartProExport } from '../internals/plugins/useChartProExport';
import type { UseChartProExportSignature } from '../internals/plugins/useChartProExport';

export type SankeyChartPluginSignatures = [
  UseChartTooltipSignature<'sankey'>,
  UseChartInteractionSignature,
  UseChartHighlightSignature<'sankey'>,
  UseChartProExportSignature,
  UseChartKeyboardNavigationSignature,
  UseChartItemActivationSignature,
];

export const SANKEY_CHART_PLUGINS: ConvertSignaturesIntoPlugins<SankeyChartPluginSignatures> = [
  useChartTooltip,
  useChartInteraction,
  useChartHighlight,
  useChartProExport,
  useChartKeyboardNavigation,
  useChartItemActivation,
];
