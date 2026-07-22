import type { HasProperty } from '@mui/x-internals/types';

export interface ChartsTypeFeatureFlags {}

/**
 * The event that activated an item, where `TEvent` is the event received on pointer interaction.
 * Defaults to `TEvent`. Import `@mui/x-charts/moduleAugmentation/keyboardItemActivation` to widen
 * it with `KeyboardEvent`, which is what is received at runtime when the item is activated with
 * the Enter and Space keys.
 */
export type ItemActivationEvent<TEvent = MouseEvent> =
  HasProperty<ChartsTypeFeatureFlags, 'itemActivationEvent'> extends true
    ? TEvent | KeyboardEvent
    : TEvent;
