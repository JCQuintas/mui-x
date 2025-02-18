import type { MakeOptional } from '@mui/x-internals/types';
import type { ChartPluginSignature } from '../../models';
import type { ChartSeriesType, DatasetType } from '../../../../models/seriesType/config';
import type {
  AxisDefaultized,
  ScaleName,
  AxisId,
  AxisConfig,
  ChartsAxisData,
} from '../../../../models/axis';
import type { UseChartSeriesSignature } from '../../corePlugins/useChartSeries';
import type { ZoomData, ZoomOptions } from './zoom.types';
import type { UseChartInteractionSignature } from '../useChartInteraction';

export type DefaultizedAxisConfig<AxisDirection extends 'x' | 'y'> = {
  [axisId: AxisId]: AxisDefaultized<ScaleName, any, AxisDirection>;
};

export type CartesianContextState = {
  /**
   * Mapping from x-axis key to scaling configuration.
   */
  xAxis: DefaultizedAxisConfig<'x'>;
  /**
   * Mapping from y-axis key to scaling configuration.
   */
  yAxis: DefaultizedAxisConfig<'y'>;
  /**
   * The x-axes IDs sorted by order they got provided.
   */
  xAxisIds: AxisId[];
  /**
   * The y-axes IDs sorted by order they got provided.
   */
  yAxisIds: AxisId[];
};

export interface UseChartCartesianAxisParameters {
  /**
   * The configuration of the x-axes.
   * If not provided, a default axis config is used.
   * An array of [[AxisConfig]] objects.
   */
  xAxis?: MakeOptional<AxisConfig<ScaleName, any, 'x'>, 'id'>[];
  /**
   * The configuration of the y-axes.
   * If not provided, a default axis config is used.
   * An array of [[AxisConfig]] objects.
   */
  yAxis?: MakeOptional<AxisConfig<ScaleName, any, 'y'>, 'id'>[];
  /**
   * An array of objects that can be used to populate series and axes data using their `dataKey` property.
   */
  dataset?: DatasetType;
  /**
   * The function called for onClick events.
   * The second argument contains information about all line/bar elements at the current mouse position.
   * @param {MouseEvent} event The mouse event recorded on the `<svg/>` element.
   * @param {null | AxisData} data The data about the clicked axis and items associated with it.
   */
  onAxisClick?: (event: MouseEvent, data: null | ChartsAxisData) => void;
  /**
   * If `true`, the charts will not listen to the mouse move event.
   * It might break interactive features, but will improve performance.
   * @default false
   */
  disableAxisListener?: boolean;
}

export type UseChartCartesianAxisDefaultizedParameters = UseChartCartesianAxisParameters & {
  defaultizedXAxis: AxisConfig<ScaleName, any, 'x'>[];
  defaultizedYAxis: AxisConfig<ScaleName, any, 'y'>[];
};

export interface DefaultizedZoomOptions extends Required<ZoomOptions> {
  axisId: AxisId;
  axisDirection: 'x' | 'y';
}

export interface UseChartCartesianAxisState {
  /**
   * @ignore - state populated by the useChartProZoomPlugin
   */
  zoom?: {
    isInteracting: boolean;
    zoomData: ZoomData[];
  };
  cartesianAxis: {
    x: AxisConfig<ScaleName, any, 'x'>[];
    y: AxisConfig<ScaleName, any, 'y'>[];
  };
}

export type ExtremumFilter = (
  value: { x: number | Date | string | null; y: number | Date | string | null },
  dataIndex: number,
) => boolean;

export interface UseChartCartesianAxisInstance {}

export type UseChartCartesianAxisSignature<SeriesType extends ChartSeriesType = ChartSeriesType> =
  ChartPluginSignature<{
    params: UseChartCartesianAxisParameters;
    defaultizedParams: UseChartCartesianAxisDefaultizedParameters;
    state: UseChartCartesianAxisState;
    // instance: UseChartCartesianAxisInstance;
    dependencies: [UseChartSeriesSignature<SeriesType>];
    optionalDependencies: [UseChartInteractionSignature];
  }>;
