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
        /** @type {{ curveType: import('@mui/x-charts-pro/FunnelChart/funnel.types').FunnelCurveType }} */
        props,
      ) => (
        <Stack sx={{ width: '100%' }}>
          <FunnelChart
            series={[
              {
                curve: props.curveType,
                layout: 'vertical',
                ...populationByEducationLevelPercentageSeries,
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
              },
            ]}
            height={300}
            slotProps={{ legend: { direction: 'vertical' } }}
          />
        </Stack>
      )}
      getCode={(
        /** @type {{props:{ curveType: import('@mui/x-charts-pro/FunnelChart/funnel.types').FunnelCurveType }}} */
        { props },
      ) => {
        return `import { FunnelChart } from '@mui/x-charts-pro/FunnelChart';

<FunnelChart
  series={[{ curve: '${props.curveType}' }]}
/>
`;
      }}
    />
  );
}
