'use client';
import * as React from 'react';
import {
  ChartPlugin,
  useSelector,
  getSVGPoint,
  selectorChartDrawingArea,
  ZoomData,
  selectorChartZoomOptionsLookup,
} from '@mui/x-charts/internals';
import { type TapEvent, type PanEvent } from '@mui/x-internal-gestures/core';
import { rafThrottle } from '@mui/x-internals/rafThrottle';
import { UseChartProZoomSignature } from '../useChartProZoom.types';
import {
  getHorizontalCenterRatio,
  getVerticalCenterRatio,
  isSpanValid,
  zoomAtPoint,
} from './useZoom.utils';
import { selectorZoomInteractionConfig } from '../ZoomInteractionConfig.selectors';

export const useZoomOnTapAndDrag = (
  {
    store,
    instance,
    svgRef,
  }: Pick<Parameters<ChartPlugin<UseChartProZoomSignature>>[0], 'store' | 'instance' | 'svgRef'>,
  setZoomDataCallback: React.Dispatch<ZoomData[] | ((prev: ZoomData[]) => ZoomData[])>,
) => {
  const drawingArea = useSelector(store, selectorChartDrawingArea);
  const optionsLookup = useSelector(store, selectorChartZoomOptionsLookup);
  const config = useSelector(store, selectorZoomInteractionConfig, ['tapAndDrag' as const]);

  // State to track the tap-and-drag sequence
  const tapCompleteRef = React.useRef(false);
  const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const tapPositionRef = React.useRef<{ x: number; y: number } | null>(null);

  const isZoomOnTapAndDragEnabled = React.useMemo(
    () => (Object.keys(optionsLookup).length > 0 && config) || false,
    [optionsLookup, config],
  );

  React.useEffect(() => {
    // TODO: update options
    if (!isZoomOnTapAndDragEnabled) {
      return;
    }

    // instance.updateZoomInteractionListeners('zoomTurnWheel', {
    //   requiredKeys: config!.requiredKeys,
    // });
  }, [config, isZoomOnTapAndDragEnabled, instance]);

  React.useEffect(() => {
    const element = svgRef.current;
    if (element === null || !isZoomOnTapAndDragEnabled) {
      return () => {};
    }

    const rafThrottledPanCallback = rafThrottle((event: PanEvent) => {
      // Only process if we've had a tap first and are in drag mode
      if (!tapCompleteRef.current) {
        return;
      }

      setZoomDataCallback((prev) => {
        return prev.map((zoom) => {
          const option = optionsLookup[zoom.axisId];
          if (!option) {
            return zoom;
          }

          const isZoomIn = event.detail.activeDeltaY < 0;
          const scaleRatio = 1 + event.detail.activeDeltaY / 100;

          // If the delta is 0, we didn't move
          if (event.detail.activeDeltaY === 0) {
            return zoom;
          }

          const point = getSVGPoint(element, {
            clientX: tapPositionRef.current?.x ?? 0,
            clientY: tapPositionRef.current?.y ?? 0,
          });

          const centerRatio =
            option.axisDirection === 'x'
              ? getHorizontalCenterRatio(point, drawingArea)
              : getVerticalCenterRatio(point, drawingArea);

          const [newMinRange, newMaxRange] = zoomAtPoint(centerRatio, scaleRatio, zoom, option);

          if (!isSpanValid(newMinRange, newMaxRange, isZoomIn, option)) {
            return zoom;
          }
          return { axisId: zoom.axisId, start: newMinRange, end: newMaxRange };
        });
      });
    });

    const handleTap = (event: TapEvent) => {
      // Clear any existing timeout
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      // Mark that a tap has completed and we're now waiting for drag
      tapCompleteRef.current = true;

      // Set timeout to reset tap state if no drag happens within timeout period (1 second)
      dragTimeoutRef.current = setTimeout(() => {
        tapCompleteRef.current = false;
        dragTimeoutRef.current = null;
      }, 1000);
      tapPositionRef.current = { x: event.detail.centroid.x, y: event.detail.centroid.y };
    };

    const handlePanStart = () => {
      // Clear the timeout since we're starting to drag
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    const handlePanEnd = () => {
      // Reset tap state when drag ends
      tapCompleteRef.current = false;
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    const tapHandler = instance.addInteractionListener('zoomTap', handleTap);
    const panStartHandler = instance.addInteractionListener('zoomPanStart', handlePanStart);
    const panHandler = instance.addInteractionListener('zoomPan', rafThrottledPanCallback);
    const panEndHandler = instance.addInteractionListener('zoomPanEnd', handlePanEnd);

    return () => {
      tapHandler.cleanup();
      panStartHandler.cleanup();
      panHandler.cleanup();
      panEndHandler.cleanup();
      rafThrottledPanCallback.clear();

      // Clean up timeout on unmount
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, [
    svgRef,
    drawingArea,
    isZoomOnTapAndDragEnabled,
    optionsLookup,
    store,
    instance,
    setZoomDataCallback,
  ]);
};
