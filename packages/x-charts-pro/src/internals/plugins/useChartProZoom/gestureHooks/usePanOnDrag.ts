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
import { UseChartProZoomSignature } from '../useChartProZoom.types';

export const usePanOnDrag = (
  {
    store,
    instance,
    svgRef,
  }: Pick<Parameters<ChartPlugin<UseChartProZoomSignature>>[0], 'store' | 'instance' | 'svgRef'>,
  interactionTimeoutRef: React.RefObject<number | undefined>,
  setIsInteracting: React.Dispatch<boolean>,
  setZoomDataCallback: React.Dispatch<ZoomData[] | ((prev: ZoomData[]) => ZoomData[])>,
) => {
  const drawingArea = useSelector(store, selectorChartDrawingArea);
  const optionsLookup = useSelector(store, selectorChartZoomOptionsLookup);

  // Add event for chart panning
  const isPanEnabled = React.useMemo(
    () => Object.values(optionsLookup).some((v) => v.panning) || false,
    [optionsLookup],
  );

  const panningEventCacheRef = React.useRef<PointerEvent[]>([]);
  const isDraggingRef = React.useRef(false);
  const touchStartRef = React.useRef<{
    x: number;
    y: number;
    zoomData: readonly ZoomData[];
  } | null>(null);

  React.useEffect(() => {
    const element = svgRef.current;
    if (element === null || !isPanEnabled) {
      return () => {};
    }
    const removeOnDrag = instance.addInteractionListener('drag', (state) => {
      if (element === null || !isDraggingRef.current || panningEventCacheRef.current.length > 1) {
        return;
      }
      if (touchStartRef.current == null) {
        return;
      }
      const point = getSVGPoint(element, state.event);
      const movementX = point.x - touchStartRef.current.x;
      const movementY = (point.y - touchStartRef.current.y) * -1;
      const newZoomData = touchStartRef.current.zoomData.map((zoom) => {
        const options = optionsLookup[zoom.axisId];
        if (!options || !options.panning) {
          return zoom;
        }
        const min = zoom.start;
        const max = zoom.end;
        const span = max - min;
        const MIN_PERCENT = options.minStart;
        const MAX_PERCENT = options.maxEnd;
        const movement = options.axisDirection === 'x' ? movementX : movementY;
        const dimension = options.axisDirection === 'x' ? drawingArea.width : drawingArea.height;
        let newMinPercent = min - (movement / dimension) * span;
        let newMaxPercent = max - (movement / dimension) * span;
        if (newMinPercent < MIN_PERCENT) {
          newMinPercent = MIN_PERCENT;
          newMaxPercent = newMinPercent + span;
        }
        if (newMaxPercent > MAX_PERCENT) {
          newMaxPercent = MAX_PERCENT;
          newMinPercent = newMaxPercent - span;
        }
        if (
          newMinPercent < MIN_PERCENT ||
          newMaxPercent > MAX_PERCENT ||
          span < options.minSpan ||
          span > options.maxSpan
        ) {
          return zoom;
        }
        return {
          ...zoom,
          start: newMinPercent,
          end: newMaxPercent,
        };
      });
      setZoomDataCallback(newZoomData);
    });

    const removeOnDragStart = instance.addInteractionListener('dragStart', (state) => {
      panningEventCacheRef.current.push(state.event);
      const point = getSVGPoint(element, state.event);
      if (!instance.isPointInside(point)) {
        return;
      }
      // If there is only one pointer, prevent selecting text
      if (panningEventCacheRef.current.length === 1) {
        state.event.preventDefault();
      }
      isDraggingRef.current = true;
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      setIsInteracting(true);
      touchStartRef.current = {
        x: point.x,
        y: point.y,
        zoomData: store.getSnapshot().zoom.zoomData,
      };
    });

    const removeOnDragEnd = instance.addInteractionListener('dragEnd', (state) => {
      panningEventCacheRef.current.splice(
        panningEventCacheRef.current.findIndex(
          (cachedEvent) => cachedEvent.pointerId === state.event.pointerId,
        ),
        1,
      );
      setIsInteracting(false);
      isDraggingRef.current = false;
      touchStartRef.current = null;
    });

    return () => {
      removeOnDragStart();
      removeOnDrag();
      removeOnDragEnd();
    };
  }, [
    instance,
    svgRef,
    isDraggingRef,
    setIsInteracting,
    isPanEnabled,
    optionsLookup,
    drawingArea.width,
    drawingArea.height,
    setZoomDataCallback,
    store,
    interactionTimeoutRef,
  ]);
};
