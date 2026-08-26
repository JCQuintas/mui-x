import type { DateBuilderReturnType, MuiPickersAdapter, PickersTimezone } from '../models';
import { AdapterTemporalBase, markInvalid } from './AdapterTemporalBase';
import type { TemporalFields } from './AdapterTemporalBase';

/**
 * Logical timezone per value: `Temporal` cannot distinguish `system` from a named zone resolving to
 * the same offset. Values built outside the adapter fall back to their own `timeZoneId`.
 */
const logicalTimezones = new WeakMap<Temporal.ZonedDateTime, PickersTimezone>();

/**
 * The timezone used when the `default` timezone is requested and no explicit default has been set.
 * `Temporal` has no global default timezone, so the adapter provides its own.
 */
let defaultTimezone: PickersTimezone = 'system';

/**
 * Set the timezone used by the Temporal adapter when the `default` timezone is requested.
 * `Temporal` does not expose a global default timezone (unlike `luxon`, `moment` or `dayjs`),
 * so this function is the way to configure it.
 * @param {PickersTimezone | undefined} timezone The timezone to use as default, or `undefined` to reset to `system`.
 */
export function setDefaultTimezone(timezone?: PickersTimezone) {
  defaultTimezone = timezone ?? 'system';
}

/**
 * Adapter for `Temporal.ZonedDateTime`, the only Temporal type that carries a timezone.
 * Use it when the value is an exact point in time. For values that are conceptually timezone-less,
 * prefer `AdapterTemporalPlainDate`, `AdapterTemporalPlainTime` or `AdapterTemporalPlainDateTime`.
 */
export class AdapterTemporal
  extends AdapterTemporalBase<Temporal.ZonedDateTime>
  implements MuiPickersAdapter<string>
{
  public lib = 'temporal';

  public isTimezoneCompatible = true;

  private getSystemTimezone = (): string => Temporal.Now.timeZoneId();

  /**
   * Resolve a `PickersTimezone` into the concrete IANA zone to use with `Temporal`, and the logical
   * timezone to remember on the value.
   */
  private resolveTimezone = (
    timezone: PickersTimezone,
  ): { zone: string; logical: PickersTimezone } => {
    if (timezone === 'default') {
      if (defaultTimezone === 'system') {
        return { zone: this.getSystemTimezone(), logical: 'system' };
      }
      return this.resolveTimezone(defaultTimezone);
    }
    if (timezone === 'system') {
      return { zone: this.getSystemTimezone(), logical: 'system' };
    }
    return { zone: timezone, logical: timezone };
  };

  private createDate = (
    zonedDateTime: Temporal.ZonedDateTime,
    timezone: PickersTimezone,
  ): Temporal.ZonedDateTime => {
    logicalTimezones.set(zonedDateTime, timezone);
    return zonedDateTime;
  };

  protected createBlankValue = (): Temporal.ZonedDateTime =>
    Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO('UTC');

  protected createInvalidValue = (timezone: PickersTimezone = 'system'): Temporal.ZonedDateTime =>
    this.createDate(markInvalid(this.createBlankValue()), timezone);

  protected getFields = (value: Temporal.ZonedDateTime): TemporalFields => ({
    year: value.year,
    month: value.month,
    day: value.day,
    hour: value.hour,
    minute: value.minute,
    second: value.second,
    millisecond: value.millisecond,
    dayOfWeek: value.dayOfWeek,
  });

  protected fromFields = (
    fields: TemporalFields,
    timezone: PickersTimezone,
  ): Temporal.ZonedDateTime | null => {
    const { zone, logical } = this.resolveTimezone(timezone);
    try {
      const plainDateTime = Temporal.PlainDateTime.from(
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
      return this.createDate(plainDateTime.toZonedDateTime(zone), logical);
    } catch (error) {
      return null;
    }
  };

  /** Derived values keep the logical timezone of the value they came from. */
  protected mapValue = (
    value: Temporal.ZonedDateTime,
    fn: (value: Temporal.ZonedDateTime) => Temporal.ZonedDateTime,
  ): Temporal.ZonedDateTime => {
    if (!this.isValid(value)) {
      return value;
    }
    return this.createDate(fn(value), this.getTimezone(value));
  };

  protected withFields = (
    value: Temporal.ZonedDateTime,
    fields: Record<string, number>,
  ): Temporal.ZonedDateTime => {
    if (!this.isValid(value)) {
      return value;
    }
    const timezone = this.getTimezone(value);
    try {
      return this.createDate(value.with(fields), timezone);
    } catch (error) {
      return this.createInvalidValue(timezone);
    }
  };

  public getTimezone = (value: Temporal.ZonedDateTime): string =>
    logicalTimezones.get(value) ?? value.timeZoneId;

  public setTimezone = (value: Temporal.ZonedDateTime, timezone: PickersTimezone) => {
    const { zone, logical } = this.resolveTimezone(timezone);
    if (!this.isValid(value)) {
      return this.createInvalidValue(logical);
    }
    return this.createDate(value.withTimeZone(zone), logical);
  };

  public date = <T extends string | null | undefined>(
    value?: T,
    timezone: PickersTimezone = 'default',
  ): DateBuilderReturnType<T> => {
    type R = DateBuilderReturnType<T>;
    if (value === null) {
      return null as unknown as R;
    }

    const { zone, logical } = this.resolveTimezone(timezone);

    if (typeof value === 'undefined') {
      // Derive the current instant from `Date.now()` rather than `Temporal.Now` so the current time
      // stays mockable (for example with `vi.setSystemTime`), matching the other adapters.
      const now = Temporal.Instant.fromEpochMilliseconds(Date.now()).toZonedDateTimeISO(zone);
      return this.createDate(now, logical) as unknown as R;
    }

    try {
      // A string with an offset or a `Z` suffix represents an exact instant.
      const instant = Temporal.Instant.from(value);
      return this.createDate(instant.toZonedDateTimeISO(zone), logical) as unknown as R;
    } catch (error) {
      // Otherwise, interpret the string as a wall-clock time in the target timezone.
      try {
        const plainDateTime = Temporal.PlainDateTime.from(value);
        return this.createDate(plainDateTime.toZonedDateTime(zone), logical) as unknown as R;
      } catch (innerError) {
        return this.createInvalidValue(logical) as unknown as R;
      }
    }
  };

  public parse = (value: string, format: string): Temporal.ZonedDateTime | null => {
    if (value === '') {
      return null;
    }

    const { logical } = this.resolveTimezone('default');
    const parsed = this.parseFields(value, format);

    if (parsed === null || parsed.incompleteDate) {
      return this.createInvalidValue(logical);
    }

    return (
      this.fromFields(
        {
          year: parsed.year ?? 1970,
          month: parsed.month ?? 1,
          day: parsed.day ?? 1,
          hour: parsed.hour ?? 0,
          minute: parsed.minute ?? 0,
          second: parsed.second ?? 0,
          millisecond: parsed.millisecond ?? 0,
          dayOfWeek: 1,
        },
        'default',
      ) ?? this.createInvalidValue(logical)
    );
  };

  public toJsDate = (value: Temporal.ZonedDateTime) =>
    this.isValid(value) ? new Date(value.epochMilliseconds) : new Date(NaN);

  /**
   * `Temporal`'s `startOfDay` resolves days where midnight does not exist (DST transitions),
   * which setting the time fields to zero would not.
   */
  public startOfDay = (value: Temporal.ZonedDateTime) =>
    this.mapValue(value, (item) => item.startOfDay());

  protected compareValues = (value: Temporal.ZonedDateTime, comparing: Temporal.ZonedDateTime) =>
    Temporal.ZonedDateTime.compare(value, comparing);

  /** Express `comparing` in the timezone of `value` so wall-clock comparisons use the same zone. */
  protected comparingFields = (
    value: Temporal.ZonedDateTime,
    comparing: Temporal.ZonedDateTime,
  ): TemporalFields => this.getFields(comparing.withTimeZone(value.timeZoneId));
}

declare module '@mui/x-date-pickers/models' {
  interface PickerValidDateLookup {
    temporal: Temporal.ZonedDateTime;
  }
}
