// @ts-check
import * as React from 'react';
import { FunnelChart } from '@mui/x-charts-pro/FunnelChart';
import ChartsUsageDemo from 'docsx/src/modules/components/ChartsUsageDemo';
import Stack from '@mui/material/Stack';
import { populationByEducationLevelPercentageSeries } from './populationByEducationLevel';

const curveTypes = ['bumpY', 'bumpX', 'linear', 'step'];

export default function FunnelCurvesNoSnap() {
  return (
    <ChartsUsageDemo
      componentName="Pie shape"
      data={[
        {
          propName: `curveType`,
          knob: 'radio',
          options: curveTypes,
          defaultValue: curveTypes[0],
        },
      ]}
      renderDemo={(
        /** @type {{ curveType: 'linear' | 'step' | 'bumpY' | 'bumpX' }} */
        props,
      ) => (
        <Stack sx={{ width: '100%' }}>
          <FunnelChart
            series={[
              {
                curve: props.curveType,
                layout: 'vertical',
                ...populationByEducationLevelPercentageSeries,
                data: [
                  {
                    value: 100,
                  },
                  {
                    value: 50,
                  },
                  {
                    value: 40,
                  },
                  { value: 5 },
                ],
              },
            ]}
            height={300}
            slotProps={{ legend: { direction: 'vertical' } }}
          />
          <FunnelChart
            series={[
              {
                curve: props.curveType,
                layout: 'horizontal',
                ...populationByEducationLevelPercentageSeries,
                data: [
                  {
                    value: 100,
                  },
                  {
                    value: 50,
                  },
                  {
                    value: 40,
                  },
                  { value: 5 },
                ],
              },
            ]}
            height={300}
            slotProps={{ legend: { direction: 'vertical' } }}
          />
        </Stack>
      )}
      getCode={(
        /** @type {{props:{ curveType: 'linear' | 'step' | 'bumpY' | 'bumpX' }}} */
        { props },
      ) => {
        return `import { FunnelChart } from '@mui/x-charts-pro/FunnelChart';

<FunnelChart
  series={[
    {
      curve: '${props.curveType}',
      // ...
    },
  ]}
/>
`;
      }}
    />
  );
}
