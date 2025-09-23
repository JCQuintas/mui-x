/**
 * PressAndDragGesture - Detects press followed by drag gestures
 *
 * This gesture tracks a two-phase interaction:
 * 1. First, a press and hold (similar to PressGesture) is detected and maintained for a duration
 * 2. Then, drag movements are tracked while maintaining the press
 *
 * The gesture fires events when:
 * - A press is held long enough (pressStart)
 * - Drag movement begins and passes threshold while pressing (dragStart)
 * - Drag movement continues while pressing (drag)
 * - Drag movement ends or press is released (dragEnd)
 * - The gesture is canceled at any point
 */

import { GesturePhase, GestureState } from '../Gesture';
import { PointerGesture, PointerGestureEventData, PointerGestureOptions } from '../PointerGesture';
import { PointerData } from '../PointerManager';
import { TargetElement } from '../types/TargetElement';
import { Direction } from '../types/Direction';
import { calculateCentroid, createEventName, getDirection, isDirectionAllowed } from '../utils';

/**
 * Configuration options for PressAndDragGesture
 * Extends PointerGestureOptions with press and drag specific settings
 */
export type PressAndDragGestureOptions<GestureName extends string> =
  PointerGestureOptions<GestureName> & {
    /**
     * Duration in milliseconds required to hold before the press gesture is recognized
     * @default 500
     */
    pressDuration?: number;

    /**
     * Maximum distance in pixels a pointer can move during the press phase for it to still be considered a press
     * @default 10
     */
    pressMaxDistance?: number;

    /**
     * Distance threshold in pixels for drag activation.
     * The drag will only be recognized once the pointer has moved this many
     * pixels from the press position.
     * @default 0
     */
    dragThreshold?: number;

    /**
     * Optional array of allowed directions for the drag gesture
     * If not specified, all directions are allowed
     */
    dragDirection?: Array<'up' | 'down' | 'left' | 'right'>;
  };

/**
 * Event data specific to press and drag gesture events
 * Contains information about the gesture state, position, and movement
 */
export type PressAndDragGestureEventData<
  CustomData extends Record<string, unknown> = Record<string, unknown>,
> = PointerGestureEventData<CustomData> & {
  /** X coordinate of the press */
  pressX: number;
  /** Y coordinate of the press */
  pressY: number;
  /** Duration of the press when it was recognized (in milliseconds) */
  pressDuration: number;
  /** The initial centroid position when the drag began (null during press-only phase) */
  initialDragCentroid: { x: number; y: number } | null;
  /** Horizontal distance moved in pixels from last drag event */
  deltaX: number;
  /** Vertical distance moved in pixels from last drag event */
  deltaY: number;
  /** Active horizontal delta since the start of the current gesture */
  activeDeltaX: number;
  /** Active vertical delta since the start of the current gesture */
  activeDeltaY: number;
  /** Total accumulated horizontal movement in pixels during drag */
  totalDeltaX: number;
  /** Total accumulated vertical movement in pixels during drag */
  totalDeltaY: number;
  /** The direction of drag movement with vertical and horizontal components */
  dragDirection: Direction;
  /** Horizontal velocity in pixels per second during drag */
  velocityX: number;
  /** Vertical velocity in pixels per second during drag */
  velocityY: number;
  /** Total velocity magnitude in pixels per second during drag */
  velocity: number;
};

/**
 * Type definition for the CustomEvent created by PressAndDragGesture
 */
export type PressAndDragEvent<
  CustomData extends Record<string, unknown> = Record<string, unknown>,
> = CustomEvent<PressAndDragGestureEventData<CustomData>>;

/**
 * Represents the current phase of the PressAndDrag gesture
 */
export type PressAndDragPhase = 'waitingForPress' | 'pressing' | 'pressReady' | 'dragging';

/**
 * State tracking for the PressAndDragGesture
 */
export type PressAndDragGestureState = GestureState & {
  /** Current phase of the press and drag gesture */
  phase: PressAndDragPhase;
  /** The position where the press was detected */
  pressPosition: { x: number; y: number } | null;
  /** Start time of the press (used to calculate duration) */
  pressStartTime: number;
  /** ID of the timer used to track press duration */
  pressTimerId: ReturnType<typeof setTimeout> | null;
  /** The initial centroid position when the drag began */
  dragStartCentroid: { x: number; y: number } | null;
  /** The most recent centroid position during the drag */
  lastDragCentroid: { x: number; y: number } | null;
  /** Whether the drag movement threshold has been reached */
  dragThresholdReached: boolean;
  /** Total accumulated horizontal delta during drag */
  totalDeltaX: number;
  /** Total accumulated vertical delta during drag */
  totalDeltaY: number;
  /** Active horizontal delta since the start of the current gesture */
  activeDeltaX: number;
  /** Active vertical delta since the start of the current gesture */
  activeDeltaY: number;
  /** Map of pointers that initiated the drag, used for tracking */
  dragStartPointers: Map<number, PointerData>;
  /** The last direction of drag movement detected */
  lastDragDirection: Direction;
  /** The last delta movement in pixels since the last drag event */
  lastDeltas: { x: number; y: number } | null;
};

/**
 * PressAndDragGesture class for handling press followed by drag interactions
 *
 * This gesture first detects a press (touch and hold for a duration), then tracks
 * drag movements while maintaining the press state.
 */
export class PressAndDragGesture<GestureName extends string> extends PointerGesture<GestureName> {
  protected state: PressAndDragGestureState = {
    phase: 'waitingForPress',
    pressPosition: null,
    pressStartTime: 0,
    pressTimerId: null,
    dragStartCentroid: null,
    lastDragCentroid: null,
    dragThresholdReached: false,
    totalDeltaX: 0,
    totalDeltaY: 0,
    activeDeltaX: 0,
    activeDeltaY: 0,
    dragStartPointers: new Map(),
    lastDragDirection: {
      vertical: null,
      horizontal: null,
      mainAxis: null,
    },
    lastDeltas: null,
  };

  protected readonly isSinglePhase!: false;

  protected readonly eventType!: PressAndDragEvent;

  protected readonly optionsType!: PressAndDragGestureOptions<GestureName>;

  protected readonly mutableOptionsType!: Omit<typeof this.optionsType, 'name'>;

  protected readonly mutableStateType!: Omit<
    Partial<typeof this.state>,
    | 'phase'
    | 'pressPosition'
    | 'pressStartTime'
    | 'pressTimerId'
    | 'dragStartCentroid'
    | 'lastDragCentroid'
    | 'dragThresholdReached'
    | 'dragStartPointers'
    | 'lastDragDirection'
  >;

  /**
   * Duration in milliseconds required to hold before the press gesture is recognized
   */
  private pressDuration: number;

  /**
   * Maximum distance a pointer can move during press for it to still be considered a press
   */
  private pressMaxDistance: number;

  /**
   * Movement threshold for drag activation
   */
  private dragThreshold: number;

  /**
   * Allowed directions for the drag gesture
   */
  private dragDirection: Array<'up' | 'down' | 'left' | 'right'>;

  constructor(options: PressAndDragGestureOptions<GestureName>) {
    super(options);
    this.pressDuration = options.pressDuration ?? 500;
    this.pressMaxDistance = options.pressMaxDistance ?? 10;
    this.dragThreshold = options.dragThreshold ?? 0;
    this.dragDirection = options.dragDirection || ['up', 'down', 'left', 'right'];
  }

  public clone(overrides?: Record<string, unknown>): PressAndDragGesture<GestureName> {
    return new PressAndDragGesture({
      name: this.name,
      preventDefault: this.preventDefault,
      stopPropagation: this.stopPropagation,
      minPointers: this.minPointers,
      maxPointers: this.maxPointers,
      pressDuration: this.pressDuration,
      pressMaxDistance: this.pressMaxDistance,
      dragThreshold: this.dragThreshold,
      dragDirection: [...this.dragDirection],
      requiredKeys: [...this.requiredKeys],
      pointerMode: [...this.pointerMode],
      preventIf: [...this.preventIf],
      pointerOptions: structuredClone(this.pointerOptions),
      // Apply any overrides passed to the method
      ...overrides,
    });
  }

  public destroy(): void {
    this.clearPressTimer();
    this.resetState();
    super.destroy();
  }

  protected updateOptions(options: typeof this.mutableOptionsType): void {
    super.updateOptions(options);

    this.pressDuration = options.pressDuration ?? this.pressDuration;
    this.pressMaxDistance = options.pressMaxDistance ?? this.pressMaxDistance;
    this.dragThreshold = options.dragThreshold ?? this.dragThreshold;
    this.dragDirection = options.dragDirection || this.dragDirection;
  }

  protected resetState(): void {
    this.clearPressTimer();
    this.isActive = false;
    this.state = {
      ...this.state,
      phase: 'waitingForPress',
      pressPosition: null,
      pressStartTime: 0,
      pressTimerId: null,
      dragStartCentroid: null,
      lastDragCentroid: null,
      dragThresholdReached: false,
      activeDeltaX: 0,
      activeDeltaY: 0,
      dragStartPointers: new Map(),
      lastDragDirection: {
        vertical: null,
        horizontal: null,
        mainAxis: null,
      },
      lastDeltas: null,
    };
  }

  /**
   * Clear the press timer if it's active
   */
  private clearPressTimer(): void {
    if (this.state.pressTimerId !== null) {
      clearTimeout(this.state.pressTimerId);
      this.state.pressTimerId = null;
    }
  }

  /**
   * Handle pointer events for the press and drag gesture
   */
  protected handlePointerEvent(pointers: Map<number, PointerData>, event: PointerEvent): void {
    const pointersArray = Array.from(pointers.values());

    // Check for our forceCancel event to handle interrupted gestures
    if (event.type === 'forceCancel') {
      this.cancel(event.target as null, pointersArray, event);
      return;
    }

    // Find which element (if any) is being targeted
    const targetElement = this.getTargetElement(event);
    if (!targetElement) {
      return;
    }

    // Check if this gesture should be prevented by active gestures
    if (this.shouldPreventGesture(targetElement, event.pointerType)) {
      this.cancel(targetElement, pointersArray, event);
      return;
    }

    // Filter pointers to only include those targeting our element or its children
    const relevantPointers = this.getRelevantPointers(pointersArray, targetElement);

    // Check if we have enough pointers and not too many
    if (relevantPointers.length < this.minPointers || relevantPointers.length > this.maxPointers) {
      if (this.isActive) {
        this.cancel(targetElement, relevantPointers, event);
      }
      return;
    }

    switch (event.type) {
      case 'pointerdown':
        this.handlePointerDown(targetElement, relevantPointers, event);
        break;

      case 'pointermove':
        this.handlePointerMove(targetElement, relevantPointers, event);
        break;

      case 'pointerup':
        this.handlePointerUp(targetElement, relevantPointers, event);
        break;

      case 'pointercancel':
      case 'forceCancel':
        this.cancel(targetElement, relevantPointers, event);
        break;

      default:
        break;
    }
  }

  /**
   * Handle pointer down events based on current phase
   */
  private handlePointerDown(
    targetElement: TargetElement,
    relevantPointers: PointerData[],
    event: PointerEvent,
  ): void {
    switch (this.state.phase) {
      case 'waitingForPress':
        // Start tracking for potential press
        this.state.pressPosition = calculateCentroid(relevantPointers);
        this.state.pressStartTime = event.timeStamp;
        this.state.phase = 'pressing';
        this.isActive = true;
        this.originalTarget = targetElement;

        // Start the timer for press recognition
        this.clearPressTimer();
        this.state.pressTimerId = setTimeout(() => {
          if (this.isActive && this.state.phase === 'pressing') {
            this.state.phase = 'pressReady';
            // Create a synthetic event with current timestamp for the press event
            const currentTime = performance.now();
            const syntheticEvent = { ...event, timeStamp: currentTime } as PointerEvent;
            // Emit press start event
            this.emitPressEvent(targetElement, 'start', relevantPointers, syntheticEvent);
          }
        }, this.pressDuration);
        break;

      case 'pressing':
      case 'pressReady':
      case 'dragging':
        // Ignore additional pointer downs during these phases
        break;

      default:
        break;
    }
  }

  /**
   * Handle pointer move events based on current phase
   */
  private handlePointerMove(
    targetElement: TargetElement,
    relevantPointers: PointerData[],
    event: PointerEvent,
  ): void {
    switch (this.state.phase) {
      case 'pressing':
        if (this.isActive && this.state.pressPosition) {
          // Check if movement exceeds press threshold
          const currentPosition = calculateCentroid(relevantPointers);
          const deltaX = currentPosition.x - this.state.pressPosition.x;
          const deltaY = currentPosition.y - this.state.pressPosition.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance > this.pressMaxDistance) {
            // Movement too large for a press - cancel and reset
            this.cancel(targetElement, relevantPointers, event);
          }
        }
        break;

      case 'pressReady':
        // Start tracking for drag
        if (!this.state.dragStartCentroid) {
          this.state.dragStartCentroid = calculateCentroid(relevantPointers);
          this.state.lastDragCentroid = { ...this.state.dragStartCentroid };

          // Store initial pointers for drag tracking
          relevantPointers.forEach((pointer) => {
            this.state.dragStartPointers.set(pointer.pointerId, pointer);
          });

          this.state.phase = 'dragging';

          // Reset totals for new drag sequence
          this.state.totalDeltaX = 0;
          this.state.totalDeltaY = 0;
          this.state.dragThresholdReached = false;
        }
        // Fall through to process the movement
        this.processDragMovement(targetElement, relevantPointers, event);
        break;

      case 'dragging':
        if (this.state.dragStartCentroid && relevantPointers.length >= this.minPointers) {
          this.processDragMovement(targetElement, relevantPointers, event);
        }
        break;

      case 'waitingForPress':
        // No movement handling needed in this phase
        break;

      default:
        break;
    }
  }

  /**
   * Handle pointer up events based on current phase
   */
  private handlePointerUp(
    targetElement: TargetElement,
    relevantPointers: PointerData[],
    event: PointerEvent,
  ): void {
    switch (this.state.phase) {
      case 'pressing':
        // Press was released before threshold - cancel
        this.cancel(targetElement, relevantPointers, event);
        break;

      case 'pressReady':
        // Press ended without drag - emit press end
        this.emitPressEvent(targetElement, 'end', relevantPointers, event);
        this.resetState();
        break;

      case 'dragging':
        // End the drag
        if (this.state.dragThresholdReached) {
          // If we have fewer pointers than minimum, end the drag
          const activePointers = relevantPointers.filter(
            (p) => p.type !== 'pointerup' && p.type !== 'pointercancel',
          );

          if (activePointers.length < this.minPointers) {
            this.emitDragEvent(targetElement, 'end', relevantPointers, event);
            this.resetState();
          }
        } else {
          // Drag never reached threshold, treat as press end
          this.emitPressEvent(targetElement, 'end', relevantPointers, event);
          this.resetState();
        }
        break;

      case 'waitingForPress':
        // No action needed for pointer up in this phase
        break;

      default:
        break;
    }
  }

  /**
   * Process drag movement and emit appropriate events
   */
  private processDragMovement(
    targetElement: TargetElement,
    relevantPointers: PointerData[],
    event: PointerEvent,
  ): void {
    if (
      !this.state.dragStartCentroid ||
      !this.state.lastDragCentroid ||
      !this.state.pressPosition
    ) {
      return;
    }

    // Calculate current centroid
    const currentCentroid = calculateCentroid(relevantPointers);

    // Calculate delta from drag start (or press position if no drag started yet)
    const referencePoint = this.state.dragStartCentroid;
    const distanceDeltaX = currentCentroid.x - referencePoint.x;
    const distanceDeltaY = currentCentroid.y - referencePoint.y;

    // Calculate movement distance from reference point
    const distance = Math.sqrt(distanceDeltaX * distanceDeltaX + distanceDeltaY * distanceDeltaY);

    // Determine movement direction
    const moveDirection = getDirection(this.state.lastDragCentroid, currentCentroid);

    // Calculate change in position since last move
    const lastDeltaX = this.state.lastDragCentroid
      ? currentCentroid.x - this.state.lastDragCentroid.x
      : 0;
    const lastDeltaY = this.state.lastDragCentroid
      ? currentCentroid.y - this.state.lastDragCentroid.y
      : 0;

    // Check if movement passes the threshold and is in an allowed direction
    if (
      !this.state.dragThresholdReached &&
      distance >= this.dragThreshold &&
      isDirectionAllowed(moveDirection, this.dragDirection)
    ) {
      this.state.dragThresholdReached = true;

      // For the first drag event, use total distance from start
      this.state.totalDeltaX = distanceDeltaX;
      this.state.totalDeltaY = distanceDeltaY;
      this.state.activeDeltaX += lastDeltaX;
      this.state.activeDeltaY += lastDeltaY;
      this.state.lastDeltas = { x: lastDeltaX, y: lastDeltaY };

      // Emit drag start event
      this.emitDragEvent(targetElement, 'start', relevantPointers, event);

      // Also emit the first drag event immediately if there's actual movement
      if (lastDeltaX !== 0 || lastDeltaY !== 0) {
        this.emitDragEvent(targetElement, 'ongoing', relevantPointers, event);
      }
    } else if (this.state.dragThresholdReached) {
      // Continue tracking movement - update totals to current position from start
      this.state.totalDeltaX = distanceDeltaX;
      this.state.totalDeltaY = distanceDeltaY;
      this.state.activeDeltaX += lastDeltaX;
      this.state.activeDeltaY += lastDeltaY;
      this.state.lastDeltas = { x: lastDeltaX, y: lastDeltaY };

      // Emit ongoing drag event
      this.emitDragEvent(targetElement, 'ongoing', relevantPointers, event);
    }

    // Update last centroid and direction
    this.state.lastDragCentroid = currentCentroid;
    this.state.lastDragDirection = moveDirection;
  }

  /**
   * Emit press-specific events
   */
  private emitPressEvent(
    element: TargetElement,
    phase: GesturePhase,
    pointers: PointerData[],
    event: PointerEvent,
  ): void {
    if (!this.state.pressPosition) {
      return;
    }

    const currentDuration = event.timeStamp - this.state.pressStartTime;

    // Get list of active gestures
    const activeGestures = this.gesturesRegistry.getActiveGestures(element);

    // Create custom event data
    const customEventData: PressAndDragGestureEventData = {
      gestureName: this.name,
      centroid: this.state.pressPosition,
      target: event.target,
      srcEvent: event,
      phase,
      pointers,
      timeStamp: event.timeStamp,
      pressX: this.state.pressPosition.x,
      pressY: this.state.pressPosition.y,
      pressDuration: currentDuration,
      initialDragCentroid: null,
      deltaX: 0,
      deltaY: 0,
      activeDeltaX: 0,
      activeDeltaY: 0,
      totalDeltaX: 0,
      totalDeltaY: 0,
      dragDirection: {
        vertical: null,
        horizontal: null,
        mainAxis: null,
      },
      velocityX: 0,
      velocityY: 0,
      velocity: 0,
      activeGestures,
      customData: this.customData,
    };

    // Event name based on phase
    const eventName = createEventName(this.name, phase);

    // Dispatch custom event
    const domEvent = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: customEventData,
    });

    element.dispatchEvent(domEvent);

    // Apply preventDefault/stopPropagation if configured
    if (this.preventDefault) {
      event.preventDefault();
    }

    if (this.stopPropagation) {
      event.stopPropagation();
    }
  }

  /**
   * Emit drag-specific events with movement data
   */
  private emitDragEvent(
    element: TargetElement,
    phase: GesturePhase,
    pointers: PointerData[],
    event: PointerEvent,
  ): void {
    if (
      !this.state.pressPosition ||
      !this.state.dragStartCentroid ||
      !this.state.lastDragCentroid
    ) {
      return;
    }

    const deltaX = this.state.lastDeltas?.x ?? 0;
    const deltaY = this.state.lastDeltas?.y ?? 0;

    // Calculate velocity - time difference in seconds
    const firstPointer = this.state.dragStartPointers.values().next().value;
    const timeElapsed = firstPointer ? (event.timeStamp - firstPointer.timeStamp) / 1000 : 0;
    const velocityX = timeElapsed > 0 ? deltaX / timeElapsed : 0;
    const velocityY = timeElapsed > 0 ? deltaY / timeElapsed : 0;
    const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    const currentDuration = event.timeStamp - this.state.pressStartTime;

    // Get list of active gestures
    const activeGestures = this.gesturesRegistry.getActiveGestures(element);

    // Create custom event data
    const customEventData: PressAndDragGestureEventData = {
      gestureName: this.name,
      centroid: this.state.lastDragCentroid,
      target: event.target,
      srcEvent: event,
      phase,
      pointers,
      timeStamp: event.timeStamp,
      pressX: this.state.pressPosition.x,
      pressY: this.state.pressPosition.y,
      pressDuration: currentDuration,
      initialDragCentroid: this.state.dragStartCentroid,
      deltaX,
      deltaY,
      activeDeltaX: this.state.activeDeltaX,
      activeDeltaY: this.state.activeDeltaY,
      totalDeltaX: this.state.totalDeltaX,
      totalDeltaY: this.state.totalDeltaY,
      dragDirection: this.state.lastDragDirection,
      velocityX,
      velocityY,
      velocity,
      activeGestures,
      customData: this.customData,
    };

    // Event name based on phase (dragStart, drag, dragEnd, dragCancel)
    const eventName = createEventName(this.name, phase);

    // Dispatch custom event
    const domEvent = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: customEventData,
    });

    element.dispatchEvent(domEvent);

    // Apply preventDefault/stopPropagation if configured
    if (this.preventDefault) {
      event.preventDefault();
    }

    if (this.stopPropagation) {
      event.stopPropagation();
    }
  }

  /**
   * Cancel the current gesture
   */
  private cancel(
    element: TargetElement | null,
    pointers: PointerData[],
    event: PointerEvent,
  ): void {
    if (this.isActive) {
      const el = element ?? this.element;

      if (this.state.phase === 'dragging' && this.state.dragThresholdReached) {
        this.emitDragEvent(el, 'cancel', pointers, event);
      } else if (this.state.phase === 'pressReady') {
        this.emitPressEvent(el, 'cancel', pointers, event);
      }
    }
    this.resetState();
  }
}
