import * as React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Unstable_FunnelChart as FunnelChart } from '@mui/x-charts-pro/FunnelChart';

import { populationByEducationLevelPercentageSeriesLabeled } from './populationByEducationLevel';

export default function HighlightFunnel() {
  const [highlight, setHighlight] = React.useState('item');
  const [fade, setFade] = React.useState('global');

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
        <FunnelChart
          series={[
            {
              ...populationByEducationLevelPercentageSeriesLabeled,
              highlightScope: {
                highlight,
                fade,
              },
            },
          ]}
          {...funnelChartParams}
        />
        <FunnelChart
          series={[
            {
              ...populationByEducationLevelPercentageSeriesLabeled,
              variant: 'outlined',
              highlightScope: {
                highlight,
                fade,
              },
            },
          ]}
          {...funnelChartParams}
        />
      </Stack>

      <Controls
        highlight={highlight}
        setHighlight={setHighlight}
        fade={fade}
        setFade={setFade}
      />
    </Stack>
  );
}

const funnelChartParams = {
  height: 300,
  hideLegend: true,
};

function Controls({ highlight, setHighlight, fade, setFade }) {
  return (
    <Stack
      direction={{ xs: 'row', xl: 'column' }}
      spacing={3}
      justifyContent="center"
      flexWrap="wrap"
      useFlexGap
    >
      <TextField
        select
        label="highlight"
        value={highlight}
        onChange={(event) => setHighlight(event.target.value)}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value={'none'}>none</MenuItem>
        <MenuItem value={'item'}>item</MenuItem>
        <MenuItem value={'series'}>series</MenuItem>
      </TextField>
      <TextField
        select
        label="fade"
        value={fade}
        onChange={(event) => setFade(event.target.value)}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value={'none'}>none</MenuItem>
        <MenuItem value={'series'}>series</MenuItem>
        <MenuItem value={'global'}>global</MenuItem>
      </TextField>
    </Stack>
  );
}
