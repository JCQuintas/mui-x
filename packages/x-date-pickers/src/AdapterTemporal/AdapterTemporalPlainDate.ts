import type { DateBuilderReturnType, MuiPickersAdapter, PickersTimezone } from '../models';
import { AdapterTemporalBase } from './AdapterTemporalBase';
import type { TemporalFields } from './AdapterTemporalBase';

/**
 * Adapter for `Temporal.PlainDate`: a calendar date with no time and no timezone.
 *
 * Use it for values that are a date and nothing else (a birthday, an invoice date). Because the
 * value carries no timezone, it cannot shift a day when the reader is in another zone, which is the
 * failure mode of representing such values as an exact point in time.
 */
export class AdapterTemporalPlainDate
  extends AdapterTemporalBase<Temporal.PlainDate>
  implements MuiPickersAdapter<string>
{
  public lib = 'temporal-plain-date';

  public isTimezoneCompatible = false;

  protected createBlankValue = (): Temporal.PlainDate =>
    Temporal.PlainDate.from({ year: 1970, month: 1, day: 1 });

  protected getFields = (value: Temporal.PlainDate): TemporalFields => ({
    year: value.year,
    month: value.month,
    day: value.day,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    dayOfWeek: value.dayOfWeek,
  });

  protected fromFields = (fields: TemporalFields): Temporal.PlainDate | null => {
    try {
      return Temporal.PlainDate.from(
        { year: fields.year, month: fields.month, day: fields.day },
        { overflow: 'reject' },
      );
    } catch (error) {
      return null;
    }
  };

  public getTimezone = (): string => 'system';

  public setTimezone = (value: Temporal.PlainDate, _timezone?: PickersTimezone) => value;

  public date = <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
    type R = DateBuilderReturnType<T>;
    if (value === null) {
      return null as unknown as R;
    }

    if (typeof value === 'undefined') {
      // Derived from `Date.now()` rather than `Temporal.Now` so the current date stays mockable.
      const now = new Date(Date.now());
      return Temporal.PlainDate.from({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      }) as unknown as R;
    }

    try {
      // Accept both a plain date and a longer ISO string, keeping only the date part.
      return Temporal.PlainDate.from(value.slice(0, 10)) as unknown as R;
    } catch (error) {
      return this.createInvalidValue() as unknown as R;
    }
  };

  public parse = (value: string, format: string): Temporal.PlainDate | null => {
    if (value === '') {
      return null;
    }

    const parsed = this.parseFields(value, format);
    if (parsed === null || parsed.incompleteDate) {
      return this.createInvalidValue();
    }

    return (
      this.fromFields({
        year: parsed.year ?? 1970,
        month: parsed.month ?? 1,
        day: parsed.day ?? 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        dayOfWeek: 1,
      }) ?? this.createInvalidValue()
    );
  };

  /** A `PlainDate` has no instant, so it is projected to midnight UTC. */
  public toJsDate = (value: Temporal.PlainDate) => {
    if (!this.isValid(value)) {
      return new Date(NaN);
    }
    const date = new Date(0);
    date.setUTCFullYear(value.year, value.month - 1, value.day);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  };

  protected compareValues = (value: Temporal.PlainDate, comparing: Temporal.PlainDate) =>
    Temporal.PlainDate.compare(value, comparing);

  // A `PlainDate` carries no time, so the time operations are inert.

  public getHours = (_value: Temporal.PlainDate) => 0;

  public getMinutes = (_value: Temporal.PlainDate) => 0;

  public getSeconds = (_value: Temporal.PlainDate) => 0;

  public getMilliseconds = (_value: Temporal.PlainDate) => 0;

  public setHours = (value: Temporal.PlainDate, _hours: number) => value;

  public setMinutes = (value: Temporal.PlainDate, _minutes: number) => value;

  public setSeconds = (value: Temporal.PlainDate, _seconds: number) => value;

  public setMilliseconds = (value: Temporal.PlainDate, _milliseconds: number) => value;

  public addHours = (value: Temporal.PlainDate, _amount: number) => value;

  public addMinutes = (value: Temporal.PlainDate, _amount: number) => value;

  public addSeconds = (value: Temporal.PlainDate, _amount: number) => value;

  public startOfDay = (value: Temporal.PlainDate) => value;

  public endOfDay = (value: Temporal.PlainDate) => value;

  public isSameHour = (value: Temporal.PlainDate, comparing: Temporal.PlainDate) =>
    this.isSameDay(value, comparing);
}

declare module '@mui/x-date-pickers/models' {
  interface PickerValidDateLookup {
    temporalPlainDate: Temporal.PlainDate;
  }
}
