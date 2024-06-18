import { scaleBand, scalePoint } from 'd3-scale';
import { DEFAULT_X_AXIS_KEY, DEFAULT_Y_AXIS_KEY } from '../../constants';
import { AxisConfig, ScaleName } from '../../models';
import {
  ChartsXAxisProps,
  ChartsAxisProps,
  ChartsYAxisProps,
  isBandScaleConfig,
  isPointScaleConfig,
} from '../../models/axis';
import { CartesianChartSeriesType, ExtremumGetter } from '../../models/seriesType/config';
import { DefaultizedAxisConfig } from './CartesianContext';
import { getColorScale, getOrdinalColorScale } from '../../internals/colorScale';
import { getTickNumber } from '../../hooks/useTicks';
import { getScale } from '../../internals/getScale';
import { DrawingArea } from '../DrawingProvider';
import { FormattedSeries } from '../SeriesContextProvider';
import { MakeOptional } from '../../models/helpers';
import { getAxisExtremum } from './getAxisExtremum';

export function computeValue(
  drawingArea: DrawingArea,
  formattedSeries: FormattedSeries,
  axis: MakeOptional<AxisConfig<ScaleName, any, ChartsYAxisProps>, 'id'>[] | undefined,
  extremumGetters: { [K in CartesianChartSeriesType]?: ExtremumGetter<K> },
  axisName: 'y',
): {
  axis: DefaultizedAxisConfig<ChartsYAxisProps>;
  axisIds: string[];
};
export function computeValue(
  drawingArea: DrawingArea,
  formattedSeries: FormattedSeries,
  inAxis: MakeOptional<AxisConfig<ScaleName, any, ChartsXAxisProps>, 'id'>[] | undefined,
  extremumGetters: { [K in CartesianChartSeriesType]?: ExtremumGetter<K> },
  axisName: 'x',
): {
  axis: DefaultizedAxisConfig<ChartsAxisProps>;
  axisIds: string[];
};
export function computeValue(
  drawingArea: DrawingArea,
  formattedSeries: FormattedSeries,
  inAxis: MakeOptional<AxisConfig<ScaleName, any, ChartsAxisProps>, 'id'>[] | undefined,
  extremumGetters: { [K in CartesianChartSeriesType]?: ExtremumGetter<K> },
  axisName: 'x' | 'y',
) {
  const DEFAULT_AXIS_KEY = axisName === 'x' ? DEFAULT_X_AXIS_KEY : DEFAULT_Y_AXIS_KEY;

  const allAxis: AxisConfig<ScaleName, any, ChartsAxisProps>[] = [
    ...(inAxis?.map((a, index) => ({ id: `defaultized-x-axis-${index}`, ...a })) ?? []),
    ...(inAxis === undefined || inAxis.findIndex(({ id }) => id === DEFAULT_AXIS_KEY) === -1
      ? [{ id: DEFAULT_AXIS_KEY, scaleType: 'linear' as const }]
      : []),
  ];

  const completeAxis: DefaultizedAxisConfig<ChartsAxisProps> = {};
  allAxis.forEach((axis, axisIndex) => {
    const isDefaultAxis = axisIndex === 0;
    const [minData, maxData] = getAxisExtremum(
      axis,
      extremumGetters,
      isDefaultAxis,
      formattedSeries,
    );

    const range = axis.reverse
      ? [drawingArea.left + drawingArea.width, drawingArea.left]
      : [drawingArea.left, drawingArea.left + drawingArea.width];

    if (isBandScaleConfig(axis)) {
      const DEFAULT_CATEGORY_GAP_RATIO = 0.2;
      const DEFAULT_BAR_GAP_RATIO = 0.1;

      const categoryGapRatio = axis.categoryGapRatio ?? DEFAULT_CATEGORY_GAP_RATIO;
      const barGapRatio = axis.barGapRatio ?? DEFAULT_BAR_GAP_RATIO;
      completeAxis[axis.id] = {
        categoryGapRatio,
        barGapRatio,
        ...axis,
        scale: scaleBand(axis.data!, range)
          .paddingInner(categoryGapRatio)
          .paddingOuter(categoryGapRatio / 2),
        tickNumber: axis.data!.length,
        colorScale:
          axis.colorMap &&
          (axis.colorMap.type === 'ordinal'
            ? getOrdinalColorScale({ values: axis.data, ...axis.colorMap })
            : getColorScale(axis.colorMap)),
      };
    }
    if (isPointScaleConfig(axis)) {
      completeAxis[axis.id] = {
        ...axis,
        scale: scalePoint(axis.data!, range),
        tickNumber: axis.data!.length,
        colorScale:
          axis.colorMap &&
          (axis.colorMap.type === 'ordinal'
            ? getOrdinalColorScale({ values: axis.data, ...axis.colorMap })
            : getColorScale(axis.colorMap)),
      };
    }
    if (axis.scaleType === 'band' || axis.scaleType === 'point') {
      // Could be merged with the two previous "if conditions" but then TS does not get that `axis.scaleType` can't be `band` or `point`.
      return;
    }

    const scaleType = axis.scaleType ?? ('linear' as const);

    const extremums = [axis.min ?? minData, axis.max ?? maxData];
    const tickNumber = getTickNumber({ ...axis, range, domain: extremums });

    const scale = getScale(scaleType, extremums, range).nice(tickNumber);
    const [minDomain, maxDomain] = scale.domain();
    const domain = [axis.min ?? minDomain, axis.max ?? maxDomain];

    completeAxis[axis.id] = {
      ...axis,
      scaleType: scaleType as any,
      scale: scale.domain(domain) as any,
      tickNumber,
      colorScale: axis.colorMap && getColorScale(axis.colorMap),
    };
  });

  return {
    axis: completeAxis,
    axisIds: allAxis.map(({ id }) => id),
  };
}
