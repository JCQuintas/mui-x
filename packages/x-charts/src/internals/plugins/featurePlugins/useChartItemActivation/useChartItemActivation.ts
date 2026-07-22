'use client';
import type { ChartPlugin } from '../../models';
import type { UseChartItemActivationSignature } from './useChartItemActivation.types';

/**
 * Carries the chart `onItemClick` callback into the store params so that keyboard navigation can
 * activate the focused item. Pointer clicks stay handled by the plot components.
 */
export const useChartItemActivation: ChartPlugin<UseChartItemActivationSignature> = () => {
  return {};
};

useChartItemActivation.params = {
  onItemClick: true,
};
