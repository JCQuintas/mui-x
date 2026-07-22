import type { ChartPluginSignature } from '../../models';

export interface UseChartItemActivationParameters {
  /**
   * Callback fired when an item is activated, either by a pointer or with the Enter and Space keys.
   * Charts forward their own `onItemClick` here, so the signature is left to the chart.
   * @param {...any} args The arguments the chart declares on its own `onItemClick`.
   */
  onItemClick?: (...args: any[]) => void;
}

export type UseChartItemActivationSignature = ChartPluginSignature<{
  params: UseChartItemActivationParameters;
  defaultizedParams: UseChartItemActivationParameters;
}>;
