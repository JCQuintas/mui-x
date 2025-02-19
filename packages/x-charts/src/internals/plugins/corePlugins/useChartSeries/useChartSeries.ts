'use client';
import * as React from 'react';
import { ChartPlugin } from '../../models';
import { UseChartSeriesSignature } from './useChartSeries.types';
import { rainbowSurgePalette } from '../../../../colorPalettes';
import { preprocessSeries } from './processSeries';

export const useChartSeries: ChartPlugin<UseChartSeriesSignature> = ({
  params,
  store,
  seriesConfig,
}) => {
  const { series, dataset, theme, colors } = params;

  // The effect do not track any value defined synchronously during the 1st render by hooks called after `useChartSeries`
  // As a consequence, the state generated by the 1st run of this useEffect will always be equal to the initialization one
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    store.update((prev) => ({
      ...prev,
      series: {
        ...prev.series,
        processedSeries: preprocessSeries({
          series,
          colors: typeof colors === 'function' ? colors(theme) : colors,
          seriesConfig,
          dataset,
        }),
      },
    }));
  }, [colors, dataset, series, theme, seriesConfig, store]);

  return {};
};

useChartSeries.params = {
  dataset: true,
  series: true,
  colors: true,
  theme: true,
};

const EMPTY_ARRAY: any[] = [];

useChartSeries.getDefaultizedParams = ({ params }) => ({
  ...params,
  series: params.series?.length ? params.series : EMPTY_ARRAY,
  colors: params.colors ?? rainbowSurgePalette,
  theme: params.theme ?? 'light',
});

useChartSeries.getInitialState = ({ series = [], colors, theme, dataset }, _, seriesConfig) => {
  return {
    series: {
      seriesConfig,
      processedSeries: preprocessSeries({
        series,
        colors: typeof colors === 'function' ? colors(theme) : colors,
        seriesConfig,
        dataset,
      }),
    },
  };
};
