/**
 * KeyboardManager - Manager for keyboard events in the gesture recognition system
 *
 * This class tracks keyboard state:
 * 1. Capturing and tracking all pressed keys
 * 2. Providing methods to check if specific keys are pressed
 */

/**
 * Type definition for keyboard keys
 */
export type KeyboardKey = AllKeys | (string & {});

type AllNumbers = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type AllLetters =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';
type AllMeta = 'Shift' | 'Control' | 'Alt' | 'Meta' | 'ControlOrMeta';
type AllKeys = AllMeta | AllLetters | AllNumbers;

/**
 * Class responsible for tracking keyboard state
 */
export class KeyboardManager {
  private pressedKeys: Set<KeyboardKey> = new Set();

  // Static properties to manage global event handlers
  private static instance: KeyboardManager | null = null;

  private static referenceCount: number = 0;

  private static eventHandlersAttached: boolean = false;

  // Instance methods that can be safely bound and shared
  private static handleKeyDown = (event: KeyboardEvent): void => {
    if (KeyboardManager.instance) {
      KeyboardManager.instance.pressedKeys.add(event.key);
    }
  };

  private static handleKeyUp = (event: KeyboardEvent): void => {
    if (KeyboardManager.instance) {
      KeyboardManager.instance.pressedKeys.delete(event.key);
    }
  };

  private static clearKeys = (): void => {
    if (KeyboardManager.instance) {
      KeyboardManager.instance.pressedKeys.clear();
    }
  };

  /**
   * Create a new KeyboardManager instance
   */
  constructor() {
    this.initialize();
  }

  /**
   * Initialize the keyboard event listeners with reference counting
   */
  private initialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Increment reference count
    KeyboardManager.referenceCount += 1;

    // Set this as the global instance (all instances will share the same pressed keys)
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = this;
    } else {
      // Share the same pressed keys set with the global instance
      this.pressedKeys = KeyboardManager.instance.pressedKeys;
    }

    // Only attach event listeners once
    if (!KeyboardManager.eventHandlersAttached) {
      window.addEventListener('keydown', KeyboardManager.handleKeyDown);
      window.addEventListener('keyup', KeyboardManager.handleKeyUp);
      window.addEventListener('blur', KeyboardManager.clearKeys);
      KeyboardManager.eventHandlersAttached = true;
    }
  }

  /**
   * Check if a set of keys are all currently pressed
   * @param keys The keys to check
   * @returns True if all specified keys are pressed, false otherwise
   */
  public areKeysPressed(keys?: KeyboardKey[]): boolean {
    if (!keys || keys.length === 0) {
      return true; // No keys required means the condition is satisfied
    }

    return keys.every((key) => {
      if (key === 'ControlOrMeta') {
        return this.pressedKeys.has('Control') || this.pressedKeys.has('Meta');
      }
      return this.pressedKeys.has(key);
    });
  }

  /**
   * Cleanup method to remove event listeners using reference counting
   */
  public destroy(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Decrement reference count
    KeyboardManager.referenceCount -= 1;

    // Only remove event listeners when no more instances exist
    if (KeyboardManager.referenceCount <= 0) {
      if (KeyboardManager.eventHandlersAttached) {
        window.removeEventListener('keydown', KeyboardManager.handleKeyDown);
        window.removeEventListener('keyup', KeyboardManager.handleKeyUp);
        window.removeEventListener('blur', KeyboardManager.clearKeys);
        KeyboardManager.eventHandlersAttached = false;
      }

      // Clear pressed keys and reset global state
      if (KeyboardManager.instance) {
        KeyboardManager.instance.pressedKeys.clear();
        KeyboardManager.instance = null;
      }

      KeyboardManager.referenceCount = 0;
    }
  }
}
