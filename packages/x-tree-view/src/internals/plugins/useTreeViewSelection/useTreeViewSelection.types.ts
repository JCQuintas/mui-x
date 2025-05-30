import * as React from 'react';
import type { DefaultizedProps } from '@mui/x-internals/types';
import type { TreeViewPluginSignature } from '../../models';
import { UseTreeViewItemsSignature } from '../useTreeViewItems';
import { UseTreeViewExpansionSignature } from '../useTreeViewExpansion';
import { TreeViewSelectionPropagation, TreeViewCancellableEventHandler } from '../../../models';

export interface UseTreeViewSelectionPublicAPI {
  /**
   * Select or deselect an item.
   * @param {object} parameters The parameters of the method.
   * @param {string} parameters.itemId The id of the item to select or deselect.
   * @param {React.SyntheticEvent} parameters.event The DOM event that triggered the change.
   * @param {boolean} parameters.keepExistingSelection If `true`, the other already selected items will remain selected, otherwise, they will be deselected. This parameter is only relevant when `multiSelect` is `true`
   * @param {boolean | undefined} parameters.shouldBeSelected If `true` the item will be selected. If `false` the item will be deselected. If not defined, the item's selection status will be toggled.
   */
  setItemSelection: (parameters: {
    itemId: string;
    event?: React.SyntheticEvent;
    shouldBeSelected?: boolean;
    keepExistingSelection?: boolean;
  }) => void;
}

export interface UseTreeViewSelectionInstance extends UseTreeViewSelectionPublicAPI {
  /**
   * Select all the navigable items in the tree.
   * @param {React.SyntheticEvent} event The DOM event that triggered the change.
   */
  selectAllNavigableItems: (event: React.SyntheticEvent) => void;
  /**
   * Expand the current selection range up to the given item.
   * @param {React.SyntheticEvent} event The DOM event that triggered the change.
   * @param {string} itemId The id of the item to expand the selection to.
   */
  expandSelectionRange: (event: React.SyntheticEvent, itemId: string) => void;
  /**
   * Expand the current selection range from the first navigable item to the given item.
   * @param {React.SyntheticEvent} event The DOM event that triggered the change.
   * @param {string} itemId The id of the item up to which the selection range should be expanded.
   */
  selectRangeFromStartToItem: (event: React.SyntheticEvent, itemId: string) => void;
  /**
   * Expand the current selection range from the given item to the last navigable item.
   * @param {React.SyntheticEvent} event The DOM event that triggered the change.
   * @param {string} itemId The id of the item from which the selection range should be expanded.
   */
  selectRangeFromItemToEnd: (event: React.SyntheticEvent, itemId: string) => void;
  /**
   * Update the selection when navigating with ArrowUp / ArrowDown keys.
   * @param {React.SyntheticEvent} event The DOM event that triggered the change.
   * @param {string} currentItemId The id of the active item before the keyboard navigation.
   * @param {string} nextItemId The id of the active item after the keyboard navigation.
   */
  selectItemFromArrowNavigation: (
    event: React.SyntheticEvent,
    currentItemId: string,
    nextItemId: string,
  ) => void;
}

export type TreeViewSelectionValue<Multiple extends boolean | undefined> = Multiple extends true
  ? string[]
  : string | null;

export interface UseTreeViewSelectionParameters<Multiple extends boolean | undefined> {
  /**
   * If `true` selection is disabled.
   * @default false
   */
  disableSelection?: boolean;
  /**
   * Selected item ids. (Uncontrolled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   * @default []
   */
  defaultSelectedItems?: TreeViewSelectionValue<Multiple>;
  /**
   * Selected item ids. (Controlled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   */
  selectedItems?: TreeViewSelectionValue<Multiple>;
  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect?: Multiple;
  /**
   * If `true`, the Tree View renders a checkbox at the left of its label that allows selecting it.
   * @default false
   */
  checkboxSelection?: boolean;
  /**
   * When `selectionPropagation.descendants` is set to `true`.
   *
   * - Selecting a parent selects all its descendants automatically.
   * - Deselecting a parent deselects all its descendants automatically.
   *
   * When `selectionPropagation.parents` is set to `true`.
   *
   * - Selecting all the descendants of a parent selects the parent automatically.
   * - Deselecting a descendant of a selected parent deselects the parent automatically.
   *
   * Only works when `multiSelect` is `true`.
   * On the <SimpleTreeView />, only the expanded items are considered (since the collapsed item are not passed to the Tree View component at all)
   *
   * @default { parents: false, descendants: false }
   */
  selectionPropagation?: TreeViewSelectionPropagation;
  /**
   * Callback fired when Tree Items are selected/deselected.
   * @param {React.SyntheticEvent} event The DOM event that triggered the change. Can be null when the change is caused by the `publicAPI.setItemSelection()` method.
   * @param {string[] | string} itemIds The ids of the selected items.
   * When `multiSelect` is `true`, this is an array of strings; when false (default) a string.
   */
  onSelectedItemsChange?: (
    event: React.SyntheticEvent | null,
    itemIds: TreeViewSelectionValue<Multiple>,
  ) => void;
  /**
   * Callback fired when a Tree Item is selected or deselected.
   * @param {React.SyntheticEvent} event The DOM event that triggered the change. Can be null when the change is caused by the `publicAPI.setItemSelection()` method.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isSelected `true` if the item has just been selected, `false` if it has just been deselected.
   */
  onItemSelectionToggle?: (
    event: React.SyntheticEvent | null,
    itemId: string,
    isSelected: boolean,
  ) => void;
}

export type UseTreeViewSelectionParametersWithDefaults<Multiple extends boolean> = DefaultizedProps<
  UseTreeViewSelectionParameters<Multiple>,
  | 'disableSelection'
  | 'defaultSelectedItems'
  | 'multiSelect'
  | 'checkboxSelection'
  | 'selectionPropagation'
>;

export interface UseTreeViewSelectionState {
  selection: {
    selectedItems: TreeViewSelectionValue<boolean>;
    isEnabled: boolean;
    isMultiSelectEnabled: boolean;
    isCheckboxSelectionEnabled: boolean;
    selectionPropagation: TreeViewSelectionPropagation;
  };
}

export type UseTreeViewSelectionSignature = TreeViewPluginSignature<{
  params: UseTreeViewSelectionParameters<any>;
  paramsWithDefaults: UseTreeViewSelectionParametersWithDefaults<any>;
  instance: UseTreeViewSelectionInstance;
  publicAPI: UseTreeViewSelectionPublicAPI;
  state: UseTreeViewSelectionState;
  dependencies: [
    UseTreeViewItemsSignature,
    UseTreeViewExpansionSignature,
    UseTreeViewItemsSignature,
  ];
}>;

export interface UseTreeItemCheckboxSlotPropsFromSelection {
  visible?: boolean;
  checked?: boolean;
  disabled?: boolean;
  tabIndex?: -1;
  onChange?: TreeViewCancellableEventHandler<React.ChangeEvent<HTMLInputElement>>;
}

declare module '@mui/x-tree-view/useTreeItem' {
  interface UseTreeItemCheckboxSlotOwnProps extends UseTreeItemCheckboxSlotPropsFromSelection {}
}
