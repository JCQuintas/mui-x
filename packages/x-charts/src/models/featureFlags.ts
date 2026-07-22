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

/**
 * An `onItemClick` argument that pointer interaction can compute but keyboard activation cannot,
 * where `TPointer` is what a pointer interaction provides and `TKeyboard` what remains available on
 * Enter and Space activation. Defaults to `TPointer`. Import
 * `@mui/x-charts/moduleAugmentation/keyboardItemActivation` to widen it with `TKeyboard`.
 */
export type ItemActivationExtra<TPointer, TKeyboard = undefined> =
  HasProperty<ChartsTypeFeatureFlags, 'itemActivationEvent'> extends true
    ? TPointer | TKeyboard
    : TPointer;
