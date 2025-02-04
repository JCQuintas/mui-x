'use client';
import * as React from 'react';
import { warnOnce } from '@mui/x-internals/warning';
import { ChartPlugin } from '../../models';
import { ChartSeriesType } from '../../../../models/seriesType/config';
import { UseChartCartesianAxisSignature } from './useChartCartesianAxis.types';
import { rainbowSurgePalette } from '../../../../colorPalettes';
import { useSelector } from '../../../store/useSelector';
import { selectorChartDrawingArea } from '../../corePlugins/useChartDimensions/useChartDimensions.selectors';
import { selectorChartSeriesProcessed } from '../../corePlugins/useChartSeries/useChartSeries.selectors';
import { defaultizeAxis } from './defaultizeAxis';
import { selectorChartXAxis, selectorChartYAxis } from './useChartCartesianAxis.selectors';
import { getAxisValue } from './getAxisValue';
import { getSVGPoint } from '../../../getSVGPoint';
import { selectorChartsInteractionAxis } from '../useChartInteraction';

export const useChartCartesianAxis: ChartPlugin<
  UseChartCartesianAxisSignature<ChartSeriesType>
> = ({ params, store, seriesConfig, svgRef, instance }) => {
  const { xAxis, yAxis, dataset } = params;

  if (process.env.NODE_ENV !== 'production') {
    const ids = [...(xAxis ?? []), ...(yAxis ?? [])]
      .filter((axis) => axis.id)
      .map((axis) => axis.id);
    const duplicates = new Set(ids.filter((id, index) => ids.indexOf(id) !== index));
    if (duplicates.size > 0) {
      warnOnce(
        [
          `MUI X: The following axis ids are duplicated: ${Array.from(duplicates).join(', ')}.`,
          `Please make sure that each axis has a unique id.`,
        ].join('\n'),
        'error',
      );
    }
  }

  const drawingArea = useSelector(store, selectorChartDrawingArea);
  const processedSeries = useSelector(store, selectorChartSeriesProcessed);

  const interactionAxis = useSelector(store, selectorChartsInteractionAxis);
  const { axis: xAxisWithScale, axisIds: xAxisIds } = useSelector(store, selectorChartXAxis);
  const { axis: yAxisWithScale, axisIds: yAxisIds } = useSelector(store, selectorChartYAxis);

  // The effect do not track any value defined synchronously during the 1st render by hooks called after `useChartCartesianAxis`
  // As a consequence, the state generated by the 1st run of this useEffect will always be equal to the initialization one
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    store.update((prev) => ({
      ...prev,
      cartesianAxis: {
        ...prev.cartesianAxis,
        x: defaultizeAxis(xAxis, dataset, 'x'),
        y: defaultizeAxis(yAxis, dataset, 'y'),
      },
    }));
  }, [seriesConfig, drawingArea, xAxis, yAxis, dataset, store]);

  const usedXAxis = xAxisIds[0];
  const usedYAxis = yAxisIds[0];

  // Use a ref to avoid rerendering on every mousemove event.
  const mousePosition = React.useRef({
    isInChart: false,
    x: -1,
    y: -1,
  });

  React.useEffect(() => {
    const element = svgRef.current;
    if (element === null || params.disableAxisListener) {
      return () => {};
    }

    const handleOut = () => {
      mousePosition.current = {
        isInChart: false,
        x: -1,
        y: -1,
      };

      instance.cleanInteraction();
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
      const target = 'targetTouches' in event ? event.targetTouches[0] : event;
      const svgPoint = getSVGPoint(element, target);

      mousePosition.current.x = svgPoint.x;
      mousePosition.current.y = svgPoint.y;

      if (!instance.isPointInside(svgPoint, { targetElement: event.target as SVGElement })) {
        if (mousePosition.current.isInChart) {
          store.update((prev) => ({
            ...prev,
            interaction: { item: null, axis: { x: null, y: null } },
          }));
          mousePosition.current.isInChart = false;
        }
        return;
      }
      mousePosition.current.isInChart = true;

      instance.setAxisInteraction({
        x: getAxisValue(xAxisWithScale[usedXAxis], svgPoint.x),
        y: getAxisValue(yAxisWithScale[usedYAxis], svgPoint.y),
      });
    };

    const handleDown = (event: PointerEvent) => {
      const target = event.currentTarget;
      if (!target) {
        return;
      }

      if ((target as HTMLElement).hasPointerCapture(event.pointerId)) {
        (target as HTMLElement).releasePointerCapture(event.pointerId);
      }
    };

    element.addEventListener('pointerdown', handleDown);
    element.addEventListener('pointermove', handleMove);
    element.addEventListener('pointerout', handleOut);
    element.addEventListener('pointercancel', handleOut);
    element.addEventListener('pointerleave', handleOut);
    return () => {
      element.removeEventListener('pointerdown', handleDown);
      element.removeEventListener('pointermove', handleMove);
      element.removeEventListener('pointerout', handleOut);
      element.removeEventListener('pointercancel', handleOut);
      element.removeEventListener('pointerleave', handleOut);
    };
  }, [
    svgRef,
    store,
    xAxisWithScale,
    usedXAxis,
    yAxisWithScale,
    usedYAxis,
    instance,
    params.disableAxisListener,
  ]);

  React.useEffect(() => {
    const element = svgRef.current;
    if (element === null || !params.onAxisClick) {
      return () => {};
    }

    const handleMouseClick = (event: MouseEvent) => {
      event.preventDefault();

      let dataIndex: number | null = null;
      let isXaxis: boolean = false;
      if (interactionAxis.x === null && interactionAxis.y === null) {
        const svgPoint = getSVGPoint(element, event);

        const xIndex = getAxisValue(xAxisWithScale[usedXAxis], svgPoint.x)?.index ?? null;
        isXaxis = xIndex !== null && xIndex !== -1;

        dataIndex = isXaxis
          ? xIndex
          : (getAxisValue(yAxisWithScale[usedYAxis], svgPoint.y)?.index ?? null);
      } else {
        isXaxis = interactionAxis.x !== null && interactionAxis.x.index !== -1;
        dataIndex = isXaxis
          ? interactionAxis.x && interactionAxis.x.index
          : interactionAxis.y && interactionAxis.y.index;
      }

      const USED_AXIS_ID = isXaxis ? xAxisIds[0] : yAxisIds[0];
      if (dataIndex == null || dataIndex === -1) {
        return;
      }

      // The .data exist because otherwise the dataIndex would be null or -1.
      const axisValue = (isXaxis ? xAxisWithScale : yAxisWithScale)[USED_AXIS_ID].data![dataIndex];

      const seriesValues: Record<string, number | null | undefined> = {};

      Object.keys(processedSeries)
        .filter((seriesType): seriesType is 'bar' | 'line' => ['bar', 'line'].includes(seriesType))
        .forEach((seriesType) => {
          processedSeries[seriesType]?.seriesOrder.forEach((seriesId) => {
            const seriesItem = processedSeries[seriesType]!.series[seriesId];

            const providedXAxisId = seriesItem.xAxisId;
            const providedYAxisId = seriesItem.yAxisId;

            const axisKey = isXaxis ? providedXAxisId : providedYAxisId;
            if (axisKey === undefined || axisKey === USED_AXIS_ID) {
              seriesValues[seriesId] = seriesItem.data[dataIndex];
            }
          });
        });

      params.onAxisClick?.(event, { dataIndex, axisValue, seriesValues });
    };

    element.addEventListener('click', handleMouseClick);
    return () => {
      element.removeEventListener('click', handleMouseClick);
    };
  }, [
    params.onAxisClick,
    processedSeries,
    svgRef,
    xAxisWithScale,
    xAxisIds,
    yAxisWithScale,
    yAxisIds,
    params,
    interactionAxis,
    usedXAxis,
    usedYAxis,
  ]);

  return {};
};

useChartCartesianAxis.params = {
  xAxis: true,
  yAxis: true,
  dataset: true,
  onAxisClick: true,
  disableAxisListener: true,
};

useChartCartesianAxis.getDefaultizedParams = ({ params }) => {
  return {
    ...params,
    colors: params.colors ?? rainbowSurgePalette,
    theme: params.theme ?? 'light',
    defaultizedXAxis: defaultizeAxis(params.xAxis, params.dataset, 'x'),
    defaultizedYAxis: defaultizeAxis(params.yAxis, params.dataset, 'y'),
  };
};

useChartCartesianAxis.getInitialState = (params) => ({
  cartesianAxis: {
    x: params.defaultizedXAxis,
    y: params.defaultizedYAxis,
  },
});
