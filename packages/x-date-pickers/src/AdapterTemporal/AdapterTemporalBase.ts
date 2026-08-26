import type {
  AdapterFormats,
  AdapterOptions,
  DateBuilderReturnType,
  FieldFormatTokenMap,
  PickersTimezone,
} from '../models';

/**
 * Any Temporal type an adapter of this family can handle.
 */
export type AnyTemporalValue =
  Temporal.PlainDate | Temporal.PlainTime | Temporal.PlainDateTime | Temporal.ZonedDateTime;

/**
 * Wall-clock fields shared by every Temporal type. Fields the type does not carry are left at their
 * neutral value, so formatting and parsing can be written once for the whole family.
 */
export interface TemporalFields {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  dayOfWeek: number;
}

export const NEUTRAL_FIELDS: TemporalFields = {
  year: 1970,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
  dayOfWeek: 4,
};

export const formatTokenMap: FieldFormatTokenMap = {
  // Year
  yy: 'year',
  yyyy: { sectionType: 'year', contentType: 'digit', maxLength: 4 },

  // Month
  M: { sectionType: 'month', contentType: 'digit', maxLength: 2 },
  MM: 'month',
  MMM: { sectionType: 'month', contentType: 'letter' },
  MMMM: { sectionType: 'month', contentType: 'letter' },

  // Day of the month
  d: { sectionType: 'day', contentType: 'digit', maxLength: 2 },
  dd: 'day',

  // Day of the week
  EE: { sectionType: 'weekDay', contentType: 'letter' },
  EEE: { sectionType: 'weekDay', contentType: 'letter' },
  EEEE: { sectionType: 'weekDay', contentType: 'letter' },

  // Meridiem
  a: 'meridiem',

  // Hours
  H: { sectionType: 'hours', contentType: 'digit', maxLength: 2 },
  HH: 'hours',
  h: { sectionType: 'hours', contentType: 'digit', maxLength: 2 },
  hh: 'hours',

  // Minutes
  m: { sectionType: 'minutes', contentType: 'digit', maxLength: 2 },
  mm: 'minutes',

  // Seconds
  s: { sectionType: 'seconds', contentType: 'digit', maxLength: 2 },
  ss: 'seconds',
};

export const defaultFormats: AdapterFormats = {
  year: 'yyyy',
  month: 'MMMM',
  monthShort: 'MMM',
  dayOfMonth: 'd',
  dayOfMonthFull: 'd',
  weekday: 'EEEE',
  weekdayShort: 'EE',
  hours24h: 'HH',
  hours12h: 'hh',
  meridiem: 'a',
  minutes: 'mm',
  seconds: 'ss',

  fullDate: 'MMM d, yyyy',
  keyboardDate: 'MM/dd/yyyy',
  shortDate: 'MMM d',
  normalDate: 'd MMMM',
  normalDateWithWeekday: 'EEE, MMM d',

  fullTime12h: 'hh:mm a',
  fullTime24h: 'HH:mm',

  keyboardDateTime12h: 'MM/dd/yyyy hh:mm a',
  keyboardDateTime24h: 'MM/dd/yyyy HH:mm',
};

/**
 * Invalid values, tracked by identity: `Temporal` has no invalid instance, and the Pickers need a
 * non-null value to report `invalidDate` (`null` means empty).
 */
const invalidValues = new WeakSet<object>();

export function markInvalid<TValue extends AnyTemporalValue>(value: TValue): TValue {
  invalidValues.add(value);
  return value;
}

export function isMarkedInvalid(value: AnyTemporalValue): boolean {
  return invalidValues.has(value);
}

function pad(value: number, length: number): string {
  return String(Math.abs(value)).padStart(length, '0');
}

function to12Hours(hour: number): number {
  const value = hour % 12;
  return value === 0 ? 12 : value;
}

// Matches escaped sections (wrapped in single quotes) and the supported tokens, longest first.
const FORMAT_TOKEN_REGEXP =
  /'[^']*'|MMMM|MMM|MM|M|EEEE|EEE|EE|yyyy|yy|dd|d|HH|H|hh|h|mm|m|ss|s|SSS|a/g;

// Token descriptors for `parse`: [token, capture group, field]. Longest tokens first.
const PARSE_TOKENS: [string, string, string][] = [
  ['yyyy', '(\\d{4})', 'year'],
  ['yy', '(\\d{2})', 'year2'],
  ['MMMM', '(\\p{L}+)', 'monthName'],
  ['MMM', '(\\p{L}+)', 'monthName'],
  ['MM', '(\\d{2})', 'month'],
  ['M', '(\\d{1,2})', 'month'],
  ['dd', '(\\d{2})', 'day'],
  ['d', '(\\d{1,2})', 'day'],
  ['EEEE', '(\\p{L}+)', 'weekdayName'],
  ['EEE', '(\\p{L}+)', 'weekdayName'],
  ['EE', '(\\p{L}+)', 'weekdayName'],
  ['HH', '(\\d{2})', 'hour'],
  ['H', '(\\d{1,2})', 'hour'],
  ['hh', '(\\d{2})', 'hour12'],
  ['h', '(\\d{1,2})', 'hour12'],
  ['mm', '(\\d{2})', 'minute'],
  ['m', '(\\d{1,2})', 'minute'],
  ['ss', '(\\d{2})', 'second'],
  ['s', '(\\d{1,2})', 'second'],
  ['SSS', '(\\d{3})', 'millisecond'],
  ['a', '(AM|PM|am|pm)', 'meridiem'],
];

/**
 * Raw values pulled out of a string by {@link AdapterTemporalBase.parseFields}.
 */
export interface ParsedFields {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  /** True when the format contained a day token but no month token. */
  incompleteDate: boolean;
}

export function assertTemporalAvailable() {
  if (typeof Temporal === 'undefined') {
    throw new Error(
      `MUI X Date Pickers: The \`Temporal\` API is not available in this environment.
The \`AdapterTemporal\` adapter relies on the global \`Temporal\` object, which your runtime does not provide natively.
Load a Temporal polyfill (for example \`import 'temporal-polyfill/global'\`) before creating the adapter.
See https://mui.com/x/react-date-pickers/date-localization/ for more details.`,
    );
  }
}

/**
 * Shared implementation for the Temporal adapters. Handles everything that does not depend on which
 * Temporal type is being edited: locale resolution, token formatting, and token parsing.
 *
 * Subclasses supply the type-specific behavior through the abstract members. Date-aware subclasses
 * inherit the date operations, time-aware subclasses inherit the time operations, and a subclass
 * that lacks either overrides them with no-ops.
 */
export abstract class AdapterTemporalBase<TValue extends AnyTemporalValue> {
  public isMUIAdapter = true;

  public isTimezoneCompatible = false;

  public abstract lib: string;

  public locale: string;

  public formats: AdapterFormats;

  public escapedCharacters = { start: "'", end: "'" };

  public formatTokenMap = formatTokenMap;

  constructor({ locale, formats }: AdapterOptions<string, never> = {}) {
    assertTemporalAvailable();
    this.locale = locale || 'en-US';
    this.formats = { ...defaultFormats, ...formats };
  }

  /** Wall-clock fields of a value, filled with neutral values for the parts the type lacks. */
  protected abstract getFields(value: TValue): TemporalFields;

  /** Build a value from a complete field set, or `null` when the fields are out of range. */
  protected abstract fromFields(fields: TemporalFields, timezone: PickersTimezone): TValue | null;

  /** A fresh instance used to represent an invalid value. */
  protected abstract createBlankValue(): TValue;

  /** The timezone a value logically belongs to. */
  public abstract getTimezone(value: TValue): string;

  public abstract setTimezone(value: TValue, timezone: PickersTimezone): TValue;

  public abstract date<T extends string | null | undefined>(
    value?: T,
    timezone?: PickersTimezone,
  ): DateBuilderReturnType<T>;

  public abstract toJsDate(value: TValue): Date;

  protected createInvalidValue(): TValue {
    return markInvalid(this.createBlankValue());
  }

  public getInvalidDate = (): TValue => this.createInvalidValue();

  public isValid = (value: TValue | null): value is TValue => {
    return value != null && !isMarkedInvalid(value);
  };

  /**
   * Apply an operation to a valid value. Invalid values are returned untouched so operations
   * propagate invalidity instead of throwing.
   */
  protected mapValue = (value: TValue, fn: (value: TValue) => TValue): TValue => {
    if (!this.isValid(value)) {
      return value;
    }
    return fn(value);
  };

  /** Apply `with`-style changes, returning an invalid value when the input is out of range. */
  protected withFields = (value: TValue, fields: Record<string, number>): TValue => {
    if (!this.isValid(value)) {
      return value;
    }
    try {
      return (value as any).with(fields) as TValue;
    } catch (error) {
      return this.createInvalidValue();
    }
  };

  public getCurrentLocaleCode = () => this.locale;

  public is12HourCycleInCurrentLocale = () =>
    Boolean(new Intl.DateTimeFormat(this.locale, { hour: 'numeric' }).resolvedOptions().hour12);

  public expandFormat = (format: string) => format;

  public formatNumber = (numberToFormat: string) => numberToFormat;

  protected getFirstDayOfWeek = (): number => {
    const locale = new Intl.Locale(this.locale);
    // `getWeekInfo` is the standard method, `weekInfo` a non-standard fallback used by some engines.
    const weekInfo =
      // @ts-ignore `getWeekInfo` is not yet in the TS lib.
      typeof locale.getWeekInfo === 'function' ? locale.getWeekInfo() : (locale as any).weekInfo;
    // `firstDay` uses 1 (Monday) to 7 (Sunday), the same convention as `Temporal`'s `dayOfWeek`.
    return weekInfo?.firstDay ?? 7;
  };

  /** A JS date carrying the wall-clock fields, used only to feed `Intl` for localized names. */
  private toIntlDate = (fields: TemporalFields): Date => {
    const date = new Date(0);
    date.setUTCFullYear(fields.year, fields.month - 1, fields.day);
    date.setUTCHours(fields.hour, fields.minute, fields.second, fields.millisecond);
    return date;
  };

  private intlFormat = (fields: TemporalFields, options: Intl.DateTimeFormatOptions): string =>
    new Intl.DateTimeFormat(this.locale, { timeZone: 'UTC', ...options }).format(
      this.toIntlDate(fields),
    );

  private getMeridiemString = (fields: TemporalFields): string => {
    const parts = new Intl.DateTimeFormat(this.locale, {
      timeZone: 'UTC',
      hour: 'numeric',
      hour12: true,
    }).formatToParts(this.toIntlDate(fields));
    const dayPeriod = parts.find((part) => part.type === 'dayPeriod');
    if (dayPeriod) {
      return dayPeriod.value;
    }
    /* v8 ignore next */
    return fields.hour < 12 ? 'AM' : 'PM';
  };

  public format = (value: TValue, formatKey: keyof AdapterFormats) =>
    this.formatByString(value, this.formats[formatKey]);

  public formatByString = (value: TValue, format: string) => {
    if (!this.isValid(value)) {
      return 'Invalid Date';
    }
    const fields = this.getFields(value);
    return format.replace(FORMAT_TOKEN_REGEXP, (token) => {
      if (token[0] === "'") {
        return token.slice(1, -1);
      }
      switch (token) {
        case 'yyyy':
          return pad(fields.year, 4);
        case 'yy':
          return pad(fields.year % 100, 2);
        case 'MMMM':
          return this.intlFormat(fields, { month: 'long' });
        case 'MMM':
          return this.intlFormat(fields, { month: 'short' });
        case 'MM':
          return pad(fields.month, 2);
        case 'M':
          return String(fields.month);
        case 'dd':
          return pad(fields.day, 2);
        case 'd':
          return String(fields.day);
        case 'EEEE':
          return this.intlFormat(fields, { weekday: 'long' });
        case 'EEE':
          return this.intlFormat(fields, { weekday: 'short' });
        case 'EE':
          return this.intlFormat(fields, { weekday: 'short' }).slice(0, 2);
        case 'HH':
          return pad(fields.hour, 2);
        case 'H':
          return String(fields.hour);
        case 'hh':
          return pad(to12Hours(fields.hour), 2);
        case 'h':
          return String(to12Hours(fields.hour));
        case 'mm':
          return pad(fields.minute, 2);
        case 'm':
          return String(fields.minute);
        case 'ss':
          return pad(fields.second, 2);
        case 's':
          return String(fields.second);
        case 'SSS':
          return pad(fields.millisecond, 3);
        case 'a':
          return this.getMeridiemString(fields);
        /* v8 ignore next 2 */
        default:
          return token;
      }
    });
  };

  /** Resolve a localized month name (long or short) to its 1-based month number. */
  private resolveMonthName = (name: string): number | undefined => {
    const target = name.toLocaleLowerCase(this.locale);
    for (let month = 1; month <= 12; month += 1) {
      const date = new Date(Date.UTC(2020, month - 1, 1));
      const isMatch = (['long', 'short'] as const).some(
        (style) =>
          new Intl.DateTimeFormat(this.locale, { month: style, timeZone: 'UTC' })
            .format(date)
            .toLocaleLowerCase(this.locale) === target,
      );
      if (isMatch) {
        return month;
      }
    }
    return undefined;
  };

  /**
   * Pull the supported tokens out of a string. Returns `null` when the string does not match the
   * format, or when a month name cannot be resolved in the current locale.
   */
  protected parseFields = (value: string, format: string): ParsedFields | null => {
    const fields: string[] = [];
    let regexString = '^';

    let index = 0;
    while (index < format.length) {
      // Escaped sections (wrapped in single quotes) are matched literally, not tokenized.
      if (format[index] === "'") {
        const end = format.indexOf("'", index + 1);
        const inner = end === -1 ? format.slice(index + 1) : format.slice(index + 1, end);
        regexString += inner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        index = end === -1 ? format.length : end + 1;
        continue;
      }

      const remaining = format.slice(index);
      const token = PARSE_TOKENS.find((candidate) => remaining.startsWith(candidate[0]));

      if (token) {
        regexString += token[1];
        fields.push(token[2]);
        index += token[0].length;
      } else {
        regexString += format[index].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        index += 1;
      }
    }
    regexString += '$';

    const match = value.match(new RegExp(regexString, 'u'));
    if (!match) {
      return null;
    }

    const parsed: Record<string, string> = {};
    fields.forEach((field, fieldIndex) => {
      parsed[field] = match[fieldIndex + 1];
    });

    let month: number | undefined;
    if (parsed.month !== undefined) {
      month = Number(parsed.month);
    } else if (parsed.monthName !== undefined) {
      month = this.resolveMonthName(parsed.monthName);
      if (month === undefined) {
        return null;
      }
    }

    let year: number | undefined;
    if (parsed.year !== undefined) {
      year = Number(parsed.year);
    } else if (parsed.year2 !== undefined) {
      year = 2000 + Number(parsed.year2);
    }

    const isPM = parsed.meridiem?.toUpperCase() === 'PM';
    let hour = parsed.hour !== undefined ? Number(parsed.hour) : undefined;
    if (parsed.hour12 !== undefined) {
      hour = (Number(parsed.hour12) % 12) + (isPM ? 12 : 0);
    } else if (parsed.meridiem !== undefined && parsed.hour === undefined) {
      // Meridiem without an explicit hour (for example editing a lone meridiem section).
      hour = isPM ? 12 : 0;
    }

    return {
      year,
      month,
      day: parsed.day !== undefined ? Number(parsed.day) : undefined,
      hour,
      minute: parsed.minute !== undefined ? Number(parsed.minute) : undefined,
      second: parsed.second !== undefined ? Number(parsed.second) : undefined,
      millisecond: parsed.millisecond !== undefined ? Number(parsed.millisecond) : undefined,
      // A day without a month is an incomplete date. Other libraries (for example Luxon) treat it as
      // invalid, so the field keeps the typed value instead of merging it into the reference date.
      incompleteDate: parsed.day !== undefined && month === undefined,
    };
  };

  // Date operations. Overridden with no-ops by subclasses whose type carries no date.

  public getYear = (value: TValue) => (this.isValid(value) ? this.getFields(value).year : NaN);

  public getMonth = (value: TValue) =>
    this.isValid(value) ? this.getFields(value).month - 1 : NaN;

  public getDate = (value: TValue) => (this.isValid(value) ? this.getFields(value).day : NaN);

  public getDaysInMonth = (value: TValue) =>
    this.isValid(value) ? (value as any).daysInMonth : NaN;

  public getDayOfWeek = (value: TValue) => {
    if (!this.isValid(value)) {
      return NaN;
    }
    const firstDay = this.getFirstDayOfWeek();
    return ((this.getFields(value).dayOfWeek - firstDay + 7) % 7) + 1;
  };

  public getWeekNumber = (value: TValue) => {
    if (!this.isValid(value)) {
      return NaN;
    }
    const fields = this.getFields(value);
    const date = Temporal.PlainDate.from({
      year: fields.year,
      month: fields.month,
      day: fields.day,
    });
    // ISO 8601 week number: the week is the one containing its Thursday.
    const thursday = date.add({ days: 4 - date.dayOfWeek });
    return Math.ceil(thursday.dayOfYear / 7);
  };

  public setYear = (value: TValue, year: number) => this.withFields(value, { year });

  public setMonth = (value: TValue, month: number) => this.withFields(value, { month: month + 1 });

  public setDate = (value: TValue, date: number) => this.withFields(value, { day: date });

  public addYears = (value: TValue, amount: number) =>
    this.mapValue(value, (item) => (item as any).add({ years: amount }));

  public addMonths = (value: TValue, amount: number) =>
    this.mapValue(value, (item) => (item as any).add({ months: amount }));

  public addWeeks = (value: TValue, amount: number) =>
    this.mapValue(value, (item) => (item as any).add({ weeks: amount }));

  public addDays = (value: TValue, amount: number) =>
    this.mapValue(value, (item) => (item as any).add({ days: amount }));

  public startOfYear = (value: TValue) =>
    this.startOfDay(this.withFields(value, { month: 1, day: 1 }));

  public startOfMonth = (value: TValue) => this.startOfDay(this.withFields(value, { day: 1 }));

  public startOfWeek = (value: TValue) => {
    const firstDay = this.getFirstDayOfWeek();
    return this.startOfDay(
      this.mapValue(value, (item) =>
        (item as any).subtract({ days: ((item as any).dayOfWeek - firstDay + 7) % 7 }),
      ),
    );
  };

  public endOfYear = (value: TValue) =>
    this.endOfDay(this.withFields(value, { month: 12, day: 31 }));

  public endOfMonth = (value: TValue) =>
    this.endOfDay(
      this.mapValue(value, (item) => (item as any).with({ day: (item as any).daysInMonth })),
    );

  public endOfWeek = (value: TValue) =>
    this.endOfDay(this.mapValue(this.startOfWeek(value), (item) => (item as any).add({ days: 6 })));

  public getWeekArray = (value: TValue): TValue[][] => {
    if (!this.isValid(value)) {
      return [];
    }
    const start = this.startOfWeek(this.startOfMonth(value));
    const end = this.endOfWeek(this.endOfMonth(value));

    const weeks: TValue[][] = [];
    let current = start;
    let week: TValue[] = [];

    while (this.isBeforeDay(current, end) || this.isSameDay(current, end)) {
      week.push(current);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      current = this.startOfDay(this.addDays(current, 1));
    }

    return weeks;
  };

  public getYearRange = ([start, end]: [TValue, TValue]): TValue[] => {
    const endDate = this.endOfYear(end);
    const years: TValue[] = [];

    let current = this.startOfYear(start);
    while (this.isBefore(current, endDate)) {
      years.push(current);
      current = this.addYears(current, 1);
    }

    return years;
  };

  // Time operations. Overridden with no-ops by subclasses whose type carries no time.

  public getHours = (value: TValue) => (this.isValid(value) ? this.getFields(value).hour : NaN);

  public getMinutes = (value: TValue) => (this.isValid(value) ? this.getFields(value).minute : NaN);

  public getSeconds = (value: TValue) => (this.isValid(value) ? this.getFields(value).second : NaN);

  public getMilliseconds = (value: TValue) =>
    this.isValid(value) ? this.getFields(value).millisecond : NaN;

  public setHours = (value: TValue, hours: number) => this.withFields(value, { hour: hours });

  public setMinutes = (value: TValue, minutes: number) =>
    this.withFields(value, { minute: minutes });

  public setSeconds = (value: TValue, seconds: number) =>
    this.withFields(value, { second: seconds });

  public setMilliseconds = (value: TValue, milliseconds: number) =>
    this.withFields(value, { millisecond: milliseconds });

  public addHours = (value: TValue, amount: number) =>
    this.mapValue(value, (item) => (item as any).add({ hours: amount }));

  public addMinutes = (value: TValue, amount: number) =>
    this.mapValue(value, (item) => (item as any).add({ minutes: amount }));

  public addSeconds = (value: TValue, amount: number) =>
    this.mapValue(value, (item) => (item as any).add({ seconds: amount }));

  public startOfDay = (value: TValue) =>
    this.withFields(value, { hour: 0, minute: 0, second: 0, millisecond: 0 });

  public endOfDay = (value: TValue) =>
    this.withFields(value, {
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
      microsecond: 999,
      nanosecond: 999,
    });

  // Comparisons.

  protected bothValid = (value: TValue, comparing: TValue) =>
    this.isValid(value) && this.isValid(comparing);

  /** Order two valid values: negative, zero or positive, like `Temporal`'s `compare`. */
  protected abstract compareValues(value: TValue, comparing: TValue): number;

  public isEqual = (value: TValue | null, comparing: TValue | null) => {
    if (value === null && comparing === null) {
      return true;
    }
    if (value === null || comparing === null) {
      return false;
    }
    const isValueValid = this.isValid(value);
    const isComparingValid = this.isValid(comparing);
    if (!isValueValid || !isComparingValid) {
      return !isValueValid && !isComparingValid;
    }
    return this.compareValues(value, comparing) === 0;
  };

  public isAfter = (value: TValue, comparing: TValue) =>
    this.bothValid(value, comparing) && this.compareValues(value, comparing) > 0;

  public isBefore = (value: TValue, comparing: TValue) =>
    this.bothValid(value, comparing) && this.compareValues(value, comparing) < 0;

  public isWithinRange = (value: TValue, [start, end]: [TValue, TValue]) => {
    if (!this.isValid(value) || !this.isValid(start) || !this.isValid(end)) {
      return false;
    }
    return this.compareValues(value, start) >= 0 && this.compareValues(value, end) <= 0;
  };

  /** Fields of `comparing` expressed in the same frame as `value`, so wall-clock parts line up. */
  protected comparingFields = (value: TValue, comparing: TValue): TemporalFields =>
    this.getFields(comparing);

  public isSameYear = (value: TValue, comparing: TValue) =>
    this.bothValid(value, comparing) &&
    this.getFields(value).year === this.comparingFields(value, comparing).year;

  public isSameMonth = (value: TValue, comparing: TValue) => {
    if (!this.bothValid(value, comparing)) {
      return false;
    }
    const fields = this.getFields(value);
    const other = this.comparingFields(value, comparing);
    return fields.year === other.year && fields.month === other.month;
  };

  public isSameDay = (value: TValue, comparing: TValue) => {
    if (!this.bothValid(value, comparing)) {
      return false;
    }
    const fields = this.getFields(value);
    const other = this.comparingFields(value, comparing);
    return fields.year === other.year && fields.month === other.month && fields.day === other.day;
  };

  public isSameHour = (value: TValue, comparing: TValue) => {
    if (!this.bothValid(value, comparing)) {
      return false;
    }
    const fields = this.getFields(value);
    const other = this.comparingFields(value, comparing);
    return (
      fields.year === other.year &&
      fields.month === other.month &&
      fields.day === other.day &&
      fields.hour === other.hour
    );
  };

  public isAfterYear = (value: TValue, comparing: TValue) =>
    this.bothValid(value, comparing) &&
    this.getFields(value).year > this.comparingFields(value, comparing).year;

  public isBeforeYear = (value: TValue, comparing: TValue) =>
    this.bothValid(value, comparing) &&
    this.getFields(value).year < this.comparingFields(value, comparing).year;

  private compareDayParts = (value: TValue, comparing: TValue): number => {
    const fields = this.getFields(value);
    const other = this.comparingFields(value, comparing);
    return fields.year - other.year || fields.month - other.month || fields.day - other.day;
  };

  public isAfterDay = (value: TValue, comparing: TValue) =>
    this.bothValid(value, comparing) && this.compareDayParts(value, comparing) > 0;

  public isBeforeDay = (value: TValue, comparing: TValue) =>
    this.bothValid(value, comparing) && this.compareDayParts(value, comparing) < 0;
}
