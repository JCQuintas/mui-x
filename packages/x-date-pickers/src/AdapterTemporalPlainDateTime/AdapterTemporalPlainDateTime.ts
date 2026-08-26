import type { DateBuilderReturnType, MuiPickersAdapter } from '../models';
import { AdapterTemporalBase } from '../AdapterTemporalBase/AdapterTemporalBase';
import type { TemporalFields } from '../AdapterTemporalBase/AdapterTemporalBase';

/**
 * Adapter for `Temporal.PlainDateTime`: a date and a wall-clock time, with no timezone.
 *
 * Use it when the value is "3pm on the 4th" regardless of where the reader is, such as a recurring
 * schedule or a local appointment time.
 */
export class AdapterTemporalPlainDateTime
  extends AdapterTemporalBase<Temporal.PlainDateTime>
  implements MuiPickersAdapter<string>
{
  public lib = 'temporal-plain-date-time';

  public isTimezoneCompatible = false;

  protected createBlankValue = (): Temporal.PlainDateTime =>
    Temporal.PlainDateTime.from({ year: 1970, month: 1, day: 1 });

  protected getFields = (value: Temporal.PlainDateTime): TemporalFields => ({
    year: value.year,
    month: value.month,
    day: value.day,
    hour: value.hour,
    minute: value.minute,
    second: value.second,
    millisecond: value.millisecond,
    dayOfWeek: value.dayOfWeek,
  });

  protected fromFields = (fields: TemporalFields): Temporal.PlainDateTime | null => {
    try {
      return Temporal.PlainDateTime.from(
        {
          year: fields.year,
          month: fields.month,
          day: fields.day,
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

  public setTimezone = (value: Temporal.PlainDateTime) => value;

  public date = <T extends string | null | undefined>(value?: T): DateBuilderReturnType<T> => {
    type R = DateBuilderReturnType<T>;
    if (value === null) {
      return null as unknown as R;
    }

    if (typeof value === 'undefined') {
      const now = new Date(Date.now());
      return Temporal.PlainDateTime.from({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        millisecond: now.getMilliseconds(),
      }) as unknown as R;
    }

    try {
      // Drop any offset or zone suffix: the wall-clock reading is what this type keeps.
      const withoutZone = value.replace(/(Z|[+-]\d{2}:?\d{2})?(\[[^\]]+\])?$/, '');
      return Temporal.PlainDateTime.from(withoutZone) as unknown as R;
    } catch (error) {
      return this.createInvalidValue() as unknown as R;
    }
  };

  public parse = (value: string, format: string): Temporal.PlainDateTime | null => {
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
        hour: parsed.hour ?? 0,
        minute: parsed.minute ?? 0,
        second: parsed.second ?? 0,
        millisecond: parsed.millisecond ?? 0,
        dayOfWeek: 1,
      }) ?? this.createInvalidValue()
    );
  };

  /** A `PlainDateTime` has no instant, so its wall-clock reading is projected onto UTC. */
  public toJsDate = (value: Temporal.PlainDateTime) => {
    if (!this.isValid(value)) {
      return new Date(NaN);
    }
    const date = new Date(0);
    date.setUTCFullYear(value.year, value.month - 1, value.day);
    date.setUTCHours(value.hour, value.minute, value.second, value.millisecond);
    return date;
  };

  protected compareValues = (value: Temporal.PlainDateTime, comparing: Temporal.PlainDateTime) =>
    Temporal.PlainDateTime.compare(value, comparing);
}

declare module '@mui/x-date-pickers/models' {
  interface PickerValidDateLookup {
    temporalPlainDateTime: Temporal.PlainDateTime;
  }
}
