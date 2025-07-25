import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import { DefaultizedProps } from '@mui/x-internals/types';
import { TimeClockSlots, TimeClockSlotProps } from '../TimeClock/TimeClock.types';
import { BasePickerInputProps } from '../internals/models/props/basePickerProps';
import { LocalizedComponent, PickersInputLocaleText } from '../locales/utils/pickersLocaleTextApi';
import {
  TimePickerToolbarProps,
  ExportedTimePickerToolbarProps,
  TimePickerToolbar,
} from './TimePickerToolbar';
import { TimeValidationError } from '../models';
import { PickerViewRendererLookup } from '../internals/hooks/usePicker';
import { TimeViewRendererProps } from '../timeViewRenderers';
import { applyDefaultViewProps } from '../internals/utils/views';
import { BaseClockProps, ExportedBaseClockProps } from '../internals/models/props/time';
import { PickerValue, TimeViewWithMeridiem } from '../internals/models';
import { ValidateTimePropsToDefault } from '../validation/validateTime';
import { useApplyDefaultValuesToTimeValidationProps } from '../managers/useTimeManager';
import { usePickerAdapter } from '../hooks/usePickerAdapter';

export interface BaseTimePickerSlots extends TimeClockSlots {
  /**
   * Custom component for the toolbar rendered above the views.
   * @default TimePickerToolbar
   */
  toolbar?: React.JSXElementConstructor<TimePickerToolbarProps>;
}

export interface BaseTimePickerSlotProps extends TimeClockSlotProps {
  toolbar?: ExportedTimePickerToolbarProps;
}

export type TimePickerViewRenderers<TView extends TimeViewWithMeridiem> = PickerViewRendererLookup<
  PickerValue,
  TView,
  TimeViewRendererProps<TView, BaseClockProps<TView>>
>;

export interface BaseTimePickerProps<TView extends TimeViewWithMeridiem>
  extends BasePickerInputProps<PickerValue, TView, TimeValidationError>,
    ExportedBaseClockProps {
  /**
   * Display ampm controls under the clock (instead of in the toolbar).
   * @default true on desktop, false on mobile
   */
  ampmInClock?: boolean;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: BaseTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: BaseTimePickerSlotProps;
  /**
   * Define custom view renderers for each section.
   * If `null`, the section will only have field editing.
   * If `undefined`, internally defined view will be used.
   */
  viewRenderers?: Partial<TimePickerViewRenderers<TView>>;
}

type UseTimePickerDefaultizedProps<
  TView extends TimeViewWithMeridiem,
  Props extends BaseTimePickerProps<TView>,
> = LocalizedComponent<
  DefaultizedProps<Props, 'views' | 'openTo' | 'ampm' | ValidateTimePropsToDefault>
>;

export function useTimePickerDefaultizedProps<
  TView extends TimeViewWithMeridiem,
  Props extends BaseTimePickerProps<TView>,
>(props: Props, name: string): UseTimePickerDefaultizedProps<TView, Props> {
  const adapter = usePickerAdapter();
  const themeProps = useThemeProps({
    props,
    name,
  });

  const validationProps = useApplyDefaultValuesToTimeValidationProps(themeProps);
  const ampm = themeProps.ampm ?? adapter.is12HourCycleInCurrentLocale();

  const localeText = React.useMemo<PickersInputLocaleText | undefined>(() => {
    if (themeProps.localeText?.toolbarTitle == null) {
      return themeProps.localeText;
    }

    return {
      ...themeProps.localeText,
      timePickerToolbarTitle: themeProps.localeText.toolbarTitle,
    };
  }, [themeProps.localeText]);

  return {
    ...themeProps,
    ...validationProps,
    ampm,
    localeText,
    ...applyDefaultViewProps({
      views: themeProps.views,
      openTo: themeProps.openTo,
      defaultViews: ['hours', 'minutes'] as TView[],
      defaultOpenTo: 'hours' as TView,
    }),
    slots: {
      toolbar: TimePickerToolbar,
      ...themeProps.slots,
    },
    slotProps: {
      ...themeProps.slotProps,
      toolbar: {
        ampm,
        ampmInClock: themeProps.ampmInClock,
        ...themeProps.slotProps?.toolbar,
      },
    },
  };
}
