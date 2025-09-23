'use client';
import * as React from 'react';
import {
  ChartPlugin,
  useSelector,
  selectorChartDrawingArea,
  ZoomData,
  selectorChartZoomOptionsLookup,
} from '@mui/x-charts/internals';
import { rafThrottle } from '@mui/x-internals/rafThrottle';
import { PressAndDragEvent } from '@mui/x-internal-gestures/core';
import { UseChartProZoomSignature } from '../useChartProZoom.types';
import { translateZoom } from './useZoom.utils';

/**
 * Hook that enables chart panning using press-and-drag gestures.
 *
 * This differs from the regular `usePanOnDrag` in that it requires users to:
 * 1. Press and hold for 300ms first (similar to a long press)
 * 2. Then drag to pan the chart
 *
 * This interaction pattern is useful for:
 * - Touch devices where you want to avoid accidental panning
 * - Situations where you want more deliberate panning actions
 * - When you need to distinguish between selection and panning gestures
 *
 * The press-and-drag gesture provides visual feedback through the press phase
 * before enabling drag, making the interaction more predictable for users.
 *
 * @param param0 - Chart plugin context containing store, instance, and SVG ref
 * @param setZoomDataCallback - Callback to update zoom data when panning occurs
 */
export const usePanOnPressAndDrag = (
  {
    store,
    instance,
    svgRef,
  }: Pick<Parameters<ChartPlugin<UseChartProZoomSignature>>[0], 'store' | 'instance' | 'svgRef'>,
  setZoomDataCallback: React.Dispatch<ZoomData[] | ((prev: ZoomData[]) => ZoomData[])>,
) => {
  const drawingArea = useSelector(store, selectorChartDrawingArea);
  const optionsLookup = useSelector(store, selectorChartZoomOptionsLookup);
  const startRef = React.useRef<readonly ZoomData[]>(null);

  // Add event for chart panning with press and drag
  const isPanEnabled = React.useMemo(
    () => Object.values(optionsLookup).some((v) => v.panning) || false,
    [optionsLookup],
  );

  React.useEffect(() => {
    const element = svgRef.current;

    if (element === null || !isPanEnabled) {
      return () => {};
    }

    const handlePressAndDragStart = (event: PressAndDragEvent) => {
      if (!(event.detail.target as SVGElement)?.closest('[data-charts-zoom-slider]')) {
        startRef.current = store.value.zoom.zoomData;
      }
    };

    const handlePressAndDragEnd = () => {
      startRef.current = null;
    };

    const throttledCallback = rafThrottle(
      (event: PressAndDragEvent, zoomData: readonly ZoomData[]) => {
        const newZoomData = translateZoom(
          zoomData,
          { x: event.detail.activeDeltaX, y: -event.detail.activeDeltaY },
          {
            width: drawingArea.width,
            height: drawingArea.height,
          },
          optionsLookup,
        );

        setZoomDataCallback(newZoomData);
      },
    );

    const handlePressAndDrag = (event: PressAndDragEvent) => {
      const zoomData = startRef.current;
      if (!zoomData) {
        return;
      }

      throttledCallback(event, zoomData);
    };

    // Use the chart's main interaction listener instead of creating a separate GestureManager
    const pressAndDragStartHandler = instance.addInteractionListener(
      'pressAndDragStart',
      handlePressAndDragStart,
    );
    const pressAndDragHandler = instance.addInteractionListener('pressAndDrag', handlePressAndDrag);
    const pressAndDragEndHandler = instance.addInteractionListener(
      'pressAndDragEnd',
      handlePressAndDragEnd,
    );

    return () => {
      pressAndDragStartHandler.cleanup();
      pressAndDragHandler.cleanup();
      pressAndDragEndHandler.cleanup();
      throttledCallback.clear();
    };
  }, [
    svgRef,
    instance,
    isPanEnabled,
    optionsLookup,
    drawingArea.width,
    drawingArea.height,
    setZoomDataCallback,
    store,
    startRef,
  ]);
};
