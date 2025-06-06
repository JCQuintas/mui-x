import * as React from 'react';
import PropTypes from 'prop-types';

import { line as d3Line } from '@mui/x-charts-vendor/d3-shape';
import { ComputedAxis, cartesianSeriesTypes, useSelector, useStore } from '@mui/x-charts/internals';
import { FunnelItemIdentifier, FunnelDataPoints, PositionGetter } from './funnel.types';
import { FunnelSection } from './FunnelSection';
import { alignLabel, positionLabel } from './labelUtils';
import { FunnelPlotSlotExtension } from './funnelPlotSlots.types';
import { useFunnelSeriesContext } from '../hooks/useFunnelSeries';
import { getFunnelCurve } from './curves';
import { FunnelSectionLabel } from './FunnelSectionLabel';
import {
  selectorChartXAxis,
  selectorChartYAxis,
} from './funnelAxisPlugin/useChartFunnelAxisRendering.selectors';
import { isBandScale } from '@mui/x-charts/internals/isBandScale';

cartesianSeriesTypes.addType('funnel');

export interface FunnelPlotProps extends FunnelPlotSlotExtension {
  /**
   * The gap, in pixels, between funnel sections.
   * @default 0
   */
  gap?: number;
  /**
   * Callback fired when a funnel item is clicked.
   * @param {React.MouseEvent<SVGElement, MouseEvent>} event The event source of the callback.
   * @param {FunnelItemIdentifier} funnelItemIdentifier The funnel item identifier.
   */
  onItemClick?: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    funnelItemIdentifier: FunnelItemIdentifier,
  ) => void;
}

const useAggregatedData = (gapIn: number | undefined) => {
  const seriesData = useFunnelSeriesContext();
  const store = useStore();
  const { axis: xAxis, axisIds: xAxisIds } = useSelector(store, selectorChartXAxis);
  const { axis: yAxis, axisIds: yAxisIds } = useSelector(store, selectorChartYAxis);
  const gap = gapIn ?? 0;

  const allData = React.useMemo(() => {
    if (seriesData === undefined) {
      return [];
    }

    const { series, seriesOrder } = seriesData;
    const defaultXAxisId = xAxisIds[0];
    const defaultYAxisId = yAxisIds[0];

    const isHorizontal = Object.values(series).some((s) => s.layout === 'horizontal');

    const result = seriesOrder.map((seriesId) => {
      const currentSeries = series[seriesId];
      const xAxisId = currentSeries.xAxisId ?? defaultXAxisId;
      const yAxisId = currentSeries.yAxisId ?? defaultYAxisId;

      const valueFormatter = currentSeries.valueFormatter;

      const baseScaleConfig = isHorizontal ? xAxis[xAxisId] : yAxis[yAxisId];

      const isXAxisBand = xAxis[xAxisId].scaleType === 'band';
      const isYAxisBand = yAxis[yAxisId].scaleType === 'band';

      const bandWidth =
        ((isXAxisBand || isYAxisBand) &&
          (baseScaleConfig as ComputedAxis<'band'>).scale?.bandwidth()) ||
        0;

      const xScale = xAxis[xAxisId].scale;
      const yScale = yAxis[yAxisId].scale;

      const xPosition: PositionGetter = (
        value,
        bandIndex,
        bandIdentifier,
        stackOffset,
        useBand,
      ) => {
        if (isBandScale(xScale)) {
          const position = xScale(bandIdentifier)!;
          return useBand ? position + bandWidth : position;
        }
        return xScale(isHorizontal ? value + (stackOffset || 0) : value)!;
      };

      const yPosition = (
        value: number,
        bandIndex: number,
        bandIdentifier: string | number,
        stackOffset?: number,
        useBand?: boolean,
      ) => {
        if (isBandScale(yScale)) {
          const position = yScale(bandIdentifier);
          return useBand ? position! + bandWidth : position!;
        }
        return yScale(isHorizontal ? value : value + (stackOffset || 0))!;
      };

      const allY = currentSeries.dataPoints.flatMap((d, dataIndex) =>
        d.flatMap((v) =>
          yPosition(
            v.y,
            dataIndex,
            baseScaleConfig.data?.[dataIndex],
            v.stackOffset,
            v.useBandWidth,
          ),
        ),
      );
      const allX = currentSeries.dataPoints.flatMap((d, dataIndex) =>
        d.flatMap((v) =>
          xPosition(
            v.x,
            dataIndex,
            baseScaleConfig.data?.[dataIndex],
            v.stackOffset,
            v.useBandWidth,
          ),
        ),
      );
      const minPoint = {
        x: Math.min(...allX) + gap / 2,
        y: Math.min(...allY) + gap / 2,
      };
      const maxPoint = {
        x: Math.max(...allX) - gap / 2,
        y: Math.max(...allY) - gap / 2,
      };

      return currentSeries.dataPoints.flatMap((values, dataIndex) => {
        const color = currentSeries.data[dataIndex].color!;
        const id = `${seriesId}-${dataIndex}`;
        const sectionLabel =
          typeof currentSeries.sectionLabel === 'function'
            ? currentSeries.sectionLabel({
                dataIndex,
                seriesId,
                value: currentSeries.data[dataIndex].value,
              })
            : currentSeries.sectionLabel;

        const isIncreasing = currentSeries.dataDirection === 'increasing';

        const curve = getFunnelCurve(currentSeries.curve, {
          isHorizontal,
          gap,
          position: dataIndex,
          sections: currentSeries.dataPoints.length,
          borderRadius: currentSeries.borderRadius,
          isIncreasing,
          min: minPoint,
          max: maxPoint,
        });

        const line = d3Line<FunnelDataPoints>()
          .x((d) =>
            xPosition(
              d.x,
              dataIndex,
              baseScaleConfig.data?.[dataIndex],
              d.stackOffset,
              d.useBandWidth,
            ),
          )
          .y((d) =>
            yPosition(
              d.y,
              dataIndex,
              baseScaleConfig.data?.[dataIndex],
              d.stackOffset,
              d.useBandWidth,
            ),
          )
          .curve(curve);

        return {
          d: line(values)!,
          color,
          id,
          seriesId,
          dataIndex,
          variant: currentSeries.variant,
          label: sectionLabel !== false && {
            ...positionLabel({
              ...sectionLabel,
              xPosition,
              yPosition,
              isHorizontal,
              values,
              dataIndex,
              baseScaleData: baseScaleConfig.data ?? [],
            }),
            ...alignLabel(sectionLabel ?? {}),
            value: valueFormatter
              ? valueFormatter(currentSeries.data[dataIndex], { dataIndex })
              : currentSeries.data[dataIndex].value?.toLocaleString(),
          },
        };
      });
    });

    return result.flat();
  }, [seriesData, xAxis, xAxisIds, yAxis, yAxisIds, gap]);

  return allData;
};

function FunnelPlot(props: FunnelPlotProps) {
  const { onItemClick, gap, ...other } = props;

  const data = useAggregatedData(gap);

  return (
    <React.Fragment>
      {data.map(({ d, color, id, seriesId, dataIndex, variant }) => (
        <FunnelSection
          {...other}
          d={d}
          color={color}
          key={id}
          dataIndex={dataIndex}
          seriesId={seriesId}
          variant={variant}
          onClick={
            onItemClick &&
            ((event) => {
              onItemClick(event, { type: 'funnel', seriesId, dataIndex });
            })
          }
        />
      ))}
      {data.map(({ id, label, seriesId, dataIndex }) => {
        if (!label || !label.value) {
          return null;
        }

        return (
          <FunnelSectionLabel
            key={id}
            label={label}
            dataIndex={dataIndex}
            seriesId={seriesId}
            {...other}
          />
        );
      })}
    </React.Fragment>
  );
}

FunnelPlot.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The gap, in pixels, between funnel sections.
   * @default 0
   */
  gap: PropTypes.number,
  /**
   * Callback fired when a funnel item is clicked.
   * @param {React.MouseEvent<SVGElement, MouseEvent>} event The event source of the callback.
   * @param {FunnelItemIdentifier} funnelItemIdentifier The funnel item identifier.
   */
  onItemClick: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
} as any;

export { FunnelPlot };
