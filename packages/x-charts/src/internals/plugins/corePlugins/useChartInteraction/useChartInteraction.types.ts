import { Handler, WebKitGestureEvent } from '@use-gesture/react';
import { ChartPluginSignature } from '../../models';

export type ChartInteraction =
  | 'drag'
  | 'dragStart'
  | 'dragEnd'
  | 'pinch'
  | 'pinchStart'
  | 'pinchEnd'
  | 'wheel'
  | 'wheelStart'
  | 'wheelEnd'
  | 'move'
  | 'moveStart'
  | 'moveEnd';

export type RemoveInteractionListener = () => void;

export type AddInteractionListener = {
  (
    interaction: 'drag' | 'dragStart' | 'dragEnd',
    callback: Handler<'drag', PointerEvent | MouseEvent | TouchEvent | KeyboardEvent>,
  ): RemoveInteractionListener;
  (
    interaction: 'pinch' | 'pinchStart' | 'pinchEnd',
    callback: Handler<'pinch', PointerEvent | TouchEvent | WheelEvent | WebKitGestureEvent>,
  ): RemoveInteractionListener;
  (
    interaction: 'wheel' | 'wheelStart' | 'wheelEnd',
    callback: Handler<'wheel', WheelEvent>,
  ): RemoveInteractionListener;
  (
    interaction: 'move' | 'moveStart' | 'moveEnd',
    callback: Handler<'move', PointerEvent>,
  ): RemoveInteractionListener;
};

export interface UseChartInteractionParameters {}

export type UseChartInteractionDefaultizedParameters = UseChartInteractionParameters & {};

export interface UseChartInteractionState {}

export interface UseChartInteractionInstance {
  /**
   * Adds an interaction listener to the SVG element.
   *
   * @param interaction The interaction to listen to.
   * @param callback The callback to call when the interaction occurs.
   */
  addInteractionListener: AddInteractionListener;
}

export type UseChartInteractionSignature = ChartPluginSignature<{
  params: UseChartInteractionParameters;
  defaultizedParams: UseChartInteractionDefaultizedParameters;
  state: UseChartInteractionState;
  instance: UseChartInteractionInstance;
}>;
