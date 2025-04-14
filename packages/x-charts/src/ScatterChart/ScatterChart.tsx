'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useThemeProps } from '@mui/material/styles';
import { MakeOptional } from '@mui/x-internals/types';
import {
  ScatterPlot,
  ScatterPlotProps,
  ScatterPlotSlotProps,
  ScatterPlotSlots,
} from './ScatterPlot';
import { ChartContainerProps } from '../ChartContainer';
import { ChartsAxis, ChartsAxisProps } from '../ChartsAxis';
import { ScatterSeriesType } from '../models/seriesType/scatter';
import { ChartsTooltip } from '../ChartsTooltip';
import { ChartsTooltipSlots, ChartsTooltipSlotProps } from '../ChartsTooltip/ChartTooltip.types';
import { ChartsLegend, ChartsLegendSlotProps, ChartsLegendSlots } from '../ChartsLegend';
import {
  ChartsOverlay,
  ChartsOverlayProps,
  ChartsOverlaySlotProps,
  ChartsOverlaySlots,
} from '../ChartsOverlay';
import { ChartsAxisHighlight, ChartsAxisHighlightProps } from '../ChartsAxisHighlight';
import { ChartsAxisSlots, ChartsAxisSlotProps } from '../models/axis';
import { ChartsGrid, ChartsGridProps } from '../ChartsGrid';
import { useScatterChartProps } from './useScatterChartProps';
import { useChartContainerProps } from '../ChartContainer/useChartContainerProps';
import { ChartDataProvider } from '../ChartDataProvider';
import { ChartsSurface } from '../ChartsSurface';
import { ChartsWrapper } from '../internals/components/ChartsWrapper';
import { UseChartVoronoiSignature } from '../internals/plugins/featurePlugins/useChartVoronoi';
import { ScatterChartPluginsSignatures } from './ScatterChart.plugins';

export interface ScatterChartSlots
  extends ChartsAxisSlots,
    ScatterPlotSlots,
    ChartsLegendSlots,
    ChartsOverlaySlots,
    ChartsTooltipSlots {}
export interface ScatterChartSlotProps
  extends ChartsAxisSlotProps,
    ScatterPlotSlotProps,
    ChartsLegendSlotProps,
    ChartsOverlaySlotProps,
    ChartsTooltipSlotProps {}

export interface ScatterChartProps
  extends Omit<
      ChartContainerProps<'scatter', ScatterChartPluginsSignatures>,
      'series' | 'plugins' | 'onItemClick'
    >,
    Omit<ChartsAxisProps, 'slots' | 'slotProps'>,
    Omit<ChartsOverlayProps, 'slots' | 'slotProps'> {
  /**
   * The series to display in the scatter chart.
   * An array of [[ScatterSeriesType]] objects.
   */
  series: Readonly<MakeOptional<ScatterSeriesType, 'type'>[]>;
  /**
   * The configuration of axes highlight.
   * @see See {@link https://mui.com/x/react-charts/highlighting/ highlighting docs} for more details.
   * @default { x: 'none', y: 'none' }
   */
  axisHighlight?: ChartsAxisHighlightProps;
  /**
   * Option to display a cartesian grid in the background.
   */
  grid?: Pick<ChartsGridProps, 'vertical' | 'horizontal'>;
  /**
   * If true, the interaction will not use the Voronoi cell and fall back to hover events.
   * @default false
   */
  disableVoronoi?: boolean;
  /**
   * If `true`, the legend is not rendered.
   */
  hideLegend?: boolean;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: ScatterChartSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: ScatterChartSlotProps;
  /**
   * Callback fired when clicking on a scatter item.
   * @param {MouseEvent} event The mouse event recorded on the `<svg/>` element if using Voronoi cells. Or the Mouse event from the scatter element, when `disableVoronoi=true`.
   * @param {ScatterItemIdentifier} scatterItemIdentifier The scatter item identifier.
   */
  onItemClick?: ScatterPlotProps['onItemClick'] | UseChartVoronoiSignature['params']['onItemClick'];
}

/**
 * Demos:
 *
 * - [Scatter](https://mui.com/x/react-charts/scatter/)
 * - [Scatter demonstration](https://mui.com/x/react-charts/scatter-demo/)
 *
 * API:
 *
 * - [ScatterChart API](https://mui.com/x/api/charts/scatter-chart/)
 */
const ScatterChart = React.forwardRef(function ScatterChart(
  inProps: ScatterChartProps,
  ref: React.Ref<SVGSVGElement>,
) {
  const props = useThemeProps({ props: inProps, name: 'MuiScatterChart' });
  const {
    chartsWrapperProps,
    chartContainerProps,
    chartsAxisProps,
    gridProps,
    scatterPlotProps,
    overlayProps,
    legendProps,
    axisHighlightProps,
    children,
  } = useScatterChartProps(props);
  const { chartDataProviderProps, chartsSurfaceProps } = useChartContainerProps(
    chartContainerProps,
    ref,
  );

  const Tooltip = props.slots?.tooltip ?? ChartsTooltip;

  return (
    <ChartDataProvider<'scatter', ScatterChartPluginsSignatures> {...chartDataProviderProps}>
      <ChartsWrapper {...chartsWrapperProps}>
        {!props.hideLegend && <ChartsLegend {...legendProps} />}
        <ChartsSurface {...chartsSurfaceProps}>
          <ChartsAxis {...chartsAxisProps} />
          <ChartsGrid {...gridProps} />
          <g data-drawing-container>
            {/* The `data-drawing-container` indicates that children are part of the drawing area. Ref: https://github.com/mui/mui-x/issues/13659 */}
            <ScatterPlot {...scatterPlotProps} />
          </g>
          <ChartsOverlay {...overlayProps} />
          <ChartsAxisHighlight {...axisHighlightProps} />
          {!props.loading && <Tooltip trigger="item" {...props.slotProps?.tooltip} />}
          {children}
        </ChartsSurface>
      </ChartsWrapper>
    </ChartDataProvider>
  );
});

ScatterChart.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  apiRef: PropTypes.shape({
    current: PropTypes.object,
  }),
  /**
   * The configuration of axes highlight.
   * @see See {@link https://mui.com/x/react-charts/highlighting/ highlighting docs} for more details.
   * @default { x: 'none', y: 'none' }
   */
  axisHighlight: PropTypes.shape({
    x: PropTypes.oneOf(['band', 'line', 'none']),
    y: PropTypes.oneOf(['band', 'line', 'none']),
  }),
  children: PropTypes.node,
  className: PropTypes.string,
  /**
   * Color palette used to colorize multiple series.
   * @default rainbowSurgePalette
   */
  colors: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.func]),
  /**
   * An array of objects that can be used to populate series and axes data using their `dataKey` property.
   */
  dataset: PropTypes.arrayOf(PropTypes.object),
  desc: PropTypes.string,
  /**
   * If `true`, the charts will not listen to the mouse move event.
   * It might break interactive features, but will improve performance.
   * @default false
   */
  disableAxisListener: PropTypes.bool,
  /**
   * If true, the interaction will not use the Voronoi cell and fall back to hover events.
   * @default false
   */
  disableVoronoi: PropTypes.bool,
  /**
   * Option to display a cartesian grid in the background.
   */
  grid: PropTypes.shape({
    horizontal: PropTypes.bool,
    vertical: PropTypes.bool,
  }),
  /**
   * The height of the chart in px. If not defined, it takes the height of the parent element.
   */
  height: PropTypes.number,
  /**
   * If `true`, the legend is not rendered.
   */
  hideLegend: PropTypes.bool,
  /**
   * The highlighted item.
   * Used when the highlight is controlled.
   */
  highlightedItem: PropTypes.shape({
    dataIndex: PropTypes.number,
    seriesId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }),
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id: PropTypes.string,
  /**
   * If `true`, a loading overlay is displayed.
   * @default false
   */
  loading: PropTypes.bool,
  /**
   * The margin between the SVG and the drawing area.
   * It's used for leaving some space for extra information such as the x- and y-axis or legend.
   *
   * Accepts a `number` to be used on all sides or an object with the optional properties: `top`, `bottom`, `left`, and `right`.
   */
  margin: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      bottom: PropTypes.number,
      left: PropTypes.number,
      right: PropTypes.number,
      top: PropTypes.number,
    }),
  ]),
  /**
   * The function called for onClick events.
   * The second argument contains information about all line/bar elements at the current mouse position.
   * @param {MouseEvent} event The mouse event recorded on the `<svg/>` element.
   * @param {null | AxisData} data The data about the clicked axis and items associated with it.
   */
  onAxisClick: PropTypes.func,
  /**
   * The callback fired when the highlighted item changes.
   *
   * @param {HighlightItemData | null} highlightedItem  The newly highlighted item.
   */
  onHighlightChange: PropTypes.func,
  /**
   * Callback fired when clicking on a scatter item.
   * @param {MouseEvent} event The mouse event recorded on the `<svg/>` element if using Voronoi cells. Or the Mouse event from the scatter element, when `disableVoronoi=true`.
   * @param {ScatterItemIdentifier} scatterItemIdentifier The scatter item identifier.
   */
  onItemClick: PropTypes.func,
  /**
   * The series to display in the scatter chart.
   * An array of [[ScatterSeriesType]] objects.
   */
  series: PropTypes.arrayOf(PropTypes.object).isRequired,
  /**
   * If `true`, animations are skipped.
   * If unset or `false`, the animations respects the user's `prefers-reduced-motion` setting.
   */
  skipAnimation: PropTypes.bool,
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
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  theme: PropTypes.oneOf(['dark', 'light']),
  title: PropTypes.string,
  /**
   * Defines the maximal distance between a scatter point and the pointer that triggers the interaction.
   * If `undefined`, the radius is assumed to be infinite.
   */
  voronoiMaxRadius: PropTypes.number,
  /**
   * The width of the chart in px. If not defined, it takes the width of the parent element.
   */
  width: PropTypes.number,
  /**
   * The configuration of the x-axes.
   * If not provided, a default axis config is used.
   * An array of [[AxisConfig]] objects.
   */
  xAxis: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        barGapRatio: PropTypes.number,
        categoryGapRatio: PropTypes.number,
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            type: PropTypes.oneOf(['ordinal']).isRequired,
            unknownColor: PropTypes.string,
            values: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string])
                .isRequired,
            ),
          }),
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['band']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            type: PropTypes.oneOf(['ordinal']).isRequired,
            unknownColor: PropTypes.string,
            values: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string])
                .isRequired,
            ),
          }),
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['point']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['log']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['pow']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['sqrt']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['time']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['utc']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['x']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        height: PropTypes.number,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['bottom', 'none', 'top']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['linear']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelMinGap: PropTypes.number,
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
      }),
    ]).isRequired,
  ),
  /**
   * The configuration of the y-axes.
   * If not provided, a default axis config is used.
   * An array of [[AxisConfig]] objects.
   */
  yAxis: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        barGapRatio: PropTypes.number,
        categoryGapRatio: PropTypes.number,
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            type: PropTypes.oneOf(['ordinal']).isRequired,
            unknownColor: PropTypes.string,
            values: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string])
                .isRequired,
            ),
          }),
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['band']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            type: PropTypes.oneOf(['ordinal']).isRequired,
            unknownColor: PropTypes.string,
            values: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string])
                .isRequired,
            ),
          }),
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['point']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['log']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['pow']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['sqrt']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['time']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['utc']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
      PropTypes.shape({
        axis: PropTypes.oneOf(['y']),
        classes: PropTypes.object,
        colorMap: PropTypes.oneOfType([
          PropTypes.shape({
            color: PropTypes.oneOfType([
              PropTypes.arrayOf(PropTypes.string.isRequired),
              PropTypes.func,
            ]).isRequired,
            max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
            type: PropTypes.oneOf(['continuous']).isRequired,
          }),
          PropTypes.shape({
            colors: PropTypes.arrayOf(PropTypes.string).isRequired,
            thresholds: PropTypes.arrayOf(
              PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
            ).isRequired,
            type: PropTypes.oneOf(['piecewise']).isRequired,
          }),
        ]),
        data: PropTypes.array,
        dataKey: PropTypes.string,
        disableLine: PropTypes.bool,
        disableTicks: PropTypes.bool,
        domainLimit: PropTypes.oneOfType([PropTypes.oneOf(['nice', 'strict']), PropTypes.func]),
        fill: PropTypes.string,
        hideTooltip: PropTypes.bool,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        ignoreTooltip: PropTypes.bool,
        label: PropTypes.string,
        labelStyle: PropTypes.object,
        max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
        offset: PropTypes.number,
        position: PropTypes.oneOf(['left', 'none', 'right']),
        reverse: PropTypes.bool,
        scaleType: PropTypes.oneOf(['linear']),
        slotProps: PropTypes.object,
        slots: PropTypes.object,
        stroke: PropTypes.string,
        sx: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
          ),
          PropTypes.func,
          PropTypes.object,
        ]),
        tickInterval: PropTypes.oneOfType([
          PropTypes.oneOf(['auto']),
          PropTypes.array,
          PropTypes.func,
        ]),
        tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
        tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
        tickLabelStyle: PropTypes.object,
        tickMaxStep: PropTypes.number,
        tickMinStep: PropTypes.number,
        tickNumber: PropTypes.number,
        tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
        tickSize: PropTypes.number,
        valueFormatter: PropTypes.func,
        width: PropTypes.number,
      }),
    ]).isRequired,
  ),
  /**
   * The configuration of the z-axes.
   */
  zAxis: PropTypes.arrayOf(
    PropTypes.shape({
      colorMap: PropTypes.oneOfType([
        PropTypes.shape({
          colors: PropTypes.arrayOf(PropTypes.string).isRequired,
          type: PropTypes.oneOf(['ordinal']).isRequired,
          unknownColor: PropTypes.string,
          values: PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string])
              .isRequired,
          ),
        }),
        PropTypes.shape({
          color: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.string.isRequired),
            PropTypes.func,
          ]).isRequired,
          max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
          min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
          type: PropTypes.oneOf(['continuous']).isRequired,
        }),
        PropTypes.shape({
          colors: PropTypes.arrayOf(PropTypes.string).isRequired,
          thresholds: PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
          ).isRequired,
          type: PropTypes.oneOf(['piecewise']).isRequired,
        }),
      ]),
      data: PropTypes.array,
      dataKey: PropTypes.string,
      id: PropTypes.string,
      max: PropTypes.number,
      min: PropTypes.number,
    }),
  ),
} as any;

export { ScatterChart };
