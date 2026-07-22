import * as React from 'react';
import { DEFAULT_MARGINS } from '@mui/x-charts/constants';
import { defaultizeMargin } from '@mui/x-charts/internals';
import type { ChartsOverlayProps } from '@mui/x-charts/ChartsOverlay';
import type { ChartsWrapperProps } from '@mui/x-charts/ChartsWrapper';
import type { SankeyChartProps } from './SankeyChart';
import type { SankeyItemIdentifier } from './sankey.types';
import type { ChartsContainerProProps } from '../ChartsContainerPro';
import { SANKEY_CHART_PLUGINS } from './SankeyChart.plugins';
import type { SankeyChartPluginSignatures } from './SankeyChart.plugins';

/**
 * A helper function that extracts SankeyChartProps from the input props
 * and returns an object with props for the children components of SankeyChart.
 *
 * @param props The input props for SankeyChart
 * @returns An object with props for the children components of SankeyChart
 */
export const useSankeyChartProps = (props: SankeyChartProps) => {
  const {
    series,
    width,
    height,
    margin: marginProps,
    colors,
    sx,
    children,
    slots,
    slotProps,
    loading,
    highlightedItem,
    onHighlightChange,
    className,
    apiRef,
    onNodeClick,
    onLinkClick,
    ...other
  } = props;

  const margin = defaultizeMargin(marginProps, DEFAULT_MARGINS);

  // Keyboard activation reports the focused item; dispatch it to the matching pointer callback.
  const onItemClick = React.useCallback(
    (event: KeyboardEvent, item: SankeyItemIdentifier) => {
      if (item.subType === 'node') {
        (onNodeClick as ((...args: any[]) => void) | undefined)?.(event, item);
      } else {
        (onLinkClick as ((...args: any[]) => void) | undefined)?.(event, item);
      }
    },
    [onNodeClick, onLinkClick],
  );

  const chartsContainerProps: ChartsContainerProProps<'sankey', SankeyChartPluginSignatures> = {
    ...other,
    series: [
      {
        type: 'sankey' as const,
        ...series,
      },
    ],
    width,
    height,
    margin,
    colors,
    sx,
    highlightedItem,
    onHighlightChange,
    apiRef,
    onItemClick,
    plugins: SANKEY_CHART_PLUGINS,
  };

  const sankeyPlotProps = {
    onNodeClick,
    onLinkClick,
  };

  const overlayProps: ChartsOverlayProps = {
    slots,
    slotProps,
    loading,
  };

  const chartsWrapperProps: Omit<ChartsWrapperProps, 'children'> = {
    sx,
    hideLegend: false,
    className,
  };

  return {
    chartsContainerProps,
    sankeyPlotProps,
    overlayProps,
    chartsWrapperProps,
    children,
  };
};
