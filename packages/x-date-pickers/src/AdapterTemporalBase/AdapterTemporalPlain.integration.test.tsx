import * as React from 'react';
import { describe, it, expect } from 'vitest';
// The Temporal API is not yet available in every runtime, so the tests install the polyfill globally.
import 'temporal-polyfill/global';
import { createRenderer } from '@mui/internal-test-utils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateField } from '@mui/x-date-pickers/DateField';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { AdapterTemporalPlainDate } from '@mui/x-date-pickers/AdapterTemporalPlainDate';
import { AdapterTemporalPlainTime } from '@mui/x-date-pickers/AdapterTemporalPlainTime';
import { AdapterTemporalPlainDateTime } from '@mui/x-date-pickers/AdapterTemporalPlainDateTime';

describe('Temporal plain adapters - field integration', () => {
  const { render } = createRenderer();

  const renderField = (adapter: any, Field: any, value: any) => {
    render(
      <LocalizationProvider dateAdapter={adapter}>
        <Field value={value} />
      </LocalizationProvider>,
    );
    // The field renders editable sections plus a hidden input carrying the value.
    return document.querySelector('input')!.value;
  };

  it('should render a PlainDate in a DateField', () => {
    expect(
      renderField(AdapterTemporalPlainDate, DateField, Temporal.PlainDate.from('2022-04-17')),
    ).to.equal('04/17/2022');
  });

  it('should render a PlainTime in a TimeField', () => {
    expect(
      renderField(AdapterTemporalPlainTime, TimeField, Temporal.PlainTime.from('15:30')),
    ).to.equal('03:30 PM');
  });

  it('should render a PlainDateTime in a DateTimeField', () => {
    expect(
      renderField(
        AdapterTemporalPlainDateTime,
        DateTimeField,
        Temporal.PlainDateTime.from('2022-04-17T15:30'),
      ),
    ).to.equal('04/17/2022 03:30 PM');
  });

  it('should render an empty field for a null value', () => {
    expect(renderField(AdapterTemporalPlainDate, DateField, null)).to.equal('');
  });
});
