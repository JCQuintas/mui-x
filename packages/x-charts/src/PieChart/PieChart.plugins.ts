import { useChartInteraction } from '../internals/plugins/featurePlugins/useChartInteraction';
import type { UseChartInteractionSignature } from '../internals/plugins/featurePlugins/useChartInteraction';
import { useChartTooltip } from '../internals/plugins/featurePlugins/useChartTooltip';
import type { UseChartTooltipSignature } from '../internals/plugins/featurePlugins/useChartTooltip';
import { useChartHighlight } from '../internals/plugins/featurePlugins/useChartHighlight';
import type { UseChartHighlightSignature } from '../internals/plugins/featurePlugins/useChartHighlight';
import { useChartKeyboardNavigation } from '../internals/plugins/featurePlugins/useChartKeyboardNavigation';
import type { UseChartKeyboardNavigationSignature } from '../internals/plugins/featurePlugins/useChartKeyboardNavigation';
import type { ConvertSignaturesIntoPlugins } from '../internals/plugins/models/helpers';
import { useChartVisibilityManager } from '../internals/plugins/featurePlugins/useChartVisibilityManager';
import type { UseChartVisibilityManagerSignature } from '../internals/plugins/featurePlugins/useChartVisibilityManager';
import { useChartItemActivation } from '../internals/plugins/featurePlugins/useChartItemActivation';
import type { UseChartItemActivationSignature } from '../internals/plugins/featurePlugins/useChartItemActivation';

export type PieChartPluginSignatures = [
  UseChartTooltipSignature<'pie'>,
  UseChartInteractionSignature,
  UseChartHighlightSignature<'pie'>,
  UseChartVisibilityManagerSignature<'pie'>,
  UseChartKeyboardNavigationSignature,
  UseChartItemActivationSignature,
];
export const PIE_CHART_PLUGINS: ConvertSignaturesIntoPlugins<PieChartPluginSignatures> = [
  useChartTooltip,
  useChartInteraction,
  useChartHighlight,
  useChartVisibilityManager,
  useChartKeyboardNavigation,
  useChartItemActivation,
];
