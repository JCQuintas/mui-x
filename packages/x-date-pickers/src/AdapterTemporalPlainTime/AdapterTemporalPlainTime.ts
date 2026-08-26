import type { DateBuilderReturnType, MuiPickersAdapter, PickersTimezone } from '../models';
import { AdapterTemporalBase } from '../AdapterTemporalBase/AdapterTemporalBase';
import type { TemporalFields } from '../AdapterTemporalBase/AdapterTemporalBase';

/**
 * Adapter for `Temporal.PlainTime`: a wall-clock time with no date and no timezone.
 *
 * Use it for values that are a time of day and nothing else (an opening hour, an alarm). Such a
 * value has no instant, so it is never moved by a DST transition.
 */
export class AdapterTemporalPlainTime
  extends AdapterTemporalBase<Temporal.PlainTime>
  implements MuiPickersAdapter<string>
{
  public lib = 'temporal-plain-time';

  public isTimezoneCompatible = false;

  protected createBlankValue = (): Temporal.PlainTime => Temporal.PlainTime.from({ hour: 0 });

  protected getFields = (value: Temporal.PlainTime): TemporalFields => ({
    year: 1970,
    month: 1,
    day: 1,
    hour: value.hour,
    minute: value.minute,
    second: value.second,
    millisecond: value.millisecond,
    dayOfWeek: 4,
  });

  protected fromFields = (fields: TemporalFields): Temporal.PlainTime | null => {
    try {
      return Temporal.PlainTime.from(
        {
          hour: fields.hour,
          minute: fields.minute,
          second: fields.second,
          millisecond: fields.millisecond,
        },
        { overflow: 'reject' },
      );
    } catch (error) {
      return null;
    }
  };

  public getTimezone = (): string => 'system';

  public setTimezone = (value: Temporal.PlainTime, _timezone?: PickersTimezone) => value;

  public date = <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
    type R = DateBuilderReturnType<T>;
    if (value === null) {
      return null as unknown as R;
    }

    if (typeof value === 'undefined') {
      const now = new Date(Date.now());
      return Temporal.PlainTime.from({
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        millisecond: now.getMilliseconds(),
      }) as unknown as R;
    }

    try {
      // Accept a bare time as well as a full ISO string, keeping only the time part.
      const timePart = value.includes('T') ? value.slice(value.indexOf('T') + 1) : value;
      return Temporal.PlainTime.from(timePart) as unknown as R;
    } catch (error) {
      return this.createInvalidValue() as unknown as R;
    }
  };

  public parse = (value: string, format: string): Temporal.PlainTime | null => {
    if (value === '') {
      return null;
    }

    const parsed = this.parseFields(value, format);
    if (parsed === null) {
      return this.createInvalidValue();
    }

    return (
      this.fromFields({
        year: 1970,
        month: 1,
        day: 1,
        hour: parsed.hour ?? 0,
        minute: parsed.minute ?? 0,
        second: parsed.second ?? 0,
        millisecond: parsed.millisecond ?? 0,
        dayOfWeek: 4,
      }) ?? this.createInvalidValue()
    );
  };

  /** A `PlainTime` has no date, so it is projected onto the epoch day in UTC. */
  public toJsDate = (value: Temporal.PlainTime) => {
    if (!this.isValid(value)) {
      return new Date(NaN);
    }
    const date = new Date(0);
    date.setUTCHours(value.hour, value.minute, value.second, value.millisecond);
    return date;
  };

  protected compareValues = (value: Temporal.PlainTime, comparing: Temporal.PlainTime) =>
    Temporal.PlainTime.compare(value, comparing);

  // A `PlainTime` carries no date, so the date operations are inert.

  public getYear = (_value: Temporal.PlainTime) => NaN;

  public getMonth = (_value: Temporal.PlainTime) => NaN;

  public getDate = (_value: Temporal.PlainTime) => NaN;

  public getDaysInMonth = (_value: Temporal.PlainTime) => NaN;

  public getDayOfWeek = (_value: Temporal.PlainTime) => NaN;

  public getWeekNumber = (_value: Temporal.PlainTime) => NaN;

  public setYear = (value: Temporal.PlainTime, _year: number) => value;

  public setMonth = (value: Temporal.PlainTime, _month: number) => value;

  public setDate = (value: Temporal.PlainTime, _date: number) => value;

  public addYears = (value: Temporal.PlainTime, _amount: number) => value;

  public addMonths = (value: Temporal.PlainTime, _amount: number) => value;

  public addWeeks = (value: Temporal.PlainTime, _amount: number) => value;

  public addDays = (value: Temporal.PlainTime, _amount: number) => value;

  public startOfYear = (value: Temporal.PlainTime) => value;

  public startOfMonth = (value: Temporal.PlainTime) => value;

  public startOfWeek = (value: Temporal.PlainTime) => value;

  public startOfDay = (value: Temporal.PlainTime) =>
    this.withFields(value, { hour: 0, minute: 0, second: 0, millisecond: 0 });

  public endOfYear = (value: Temporal.PlainTime) => value;

  public endOfMonth = (value: Temporal.PlainTime) => value;

  public endOfWeek = (value: Temporal.PlainTime) => value;

  public getWeekArray = (_value: Temporal.PlainTime): Temporal.PlainTime[][] => [];

  public getYearRange = (
    _range: [Temporal.PlainTime, Temporal.PlainTime],
  ): Temporal.PlainTime[] => [];

  public isSameYear = (value: Temporal.PlainTime, comparing: Temporal.PlainTime) =>
    this.bothValid(value, comparing);

  public isSameMonth = (value: Temporal.PlainTime, comparing: Temporal.PlainTime) =>
    this.bothValid(value, comparing);

  public isSameDay = (value: Temporal.PlainTime, comparing: Temporal.PlainTime) =>
    this.bothValid(value, comparing);

  public isAfterYear = (_value: Temporal.PlainTime, _comparing: Temporal.PlainTime) => false;

  public isBeforeYear = (_value: Temporal.PlainTime, _comparing: Temporal.PlainTime) => false;

  public isAfterDay = (_value: Temporal.PlainTime, _comparing: Temporal.PlainTime) => false;

  public isBeforeDay = (_value: Temporal.PlainTime, _comparing: Temporal.PlainTime) => false;
}

declare module '@mui/x-date-pickers/models' {
  interface PickerValidDateLookup {
    temporalPlainTime: Temporal.PlainTime;
  }
}
