import * as React from 'react';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { rocketLaunches } from '../dataset/rocketLaunches';

export default function ContinuousGroupedAxes() {
  return (
    <ScatterChart
      xAxis={[
        {
          scaleType: 'log',
          height: 50,
          label: 'Mass to Low Earth Orbit (kg)',
          tickInterval: (v, index) => index % 3 === 0,
          getGrouping: (value: number) => [`${value}kg`, getRockerClass(value)],
        },
      ]}
      {...chartConfig}
    />
  );
}

const getRockerClass = (value: number) => {
  if (value < 2000) {
    return 'Small';
  }
  if (value < 20000) {
    return 'Medium';
  }
  return 'Heavy';
};

const chartConfig = {
  height: 200,
  margin: { left: 0, right: 30 },
  series: [
    {
      data: rocketLaunches.map((launch) => ({
        x: launch.mass_to_low_earth_orbit_kg,
        y: launch.total_launch_cost_in_millions,
      })),
    },
  ],
  yAxis: [
    {
      label: 'Total Launch Cost ($)',
      scaleType: 'log',
      valueFormatter: (v: number) => (v > 100 ? `$${v / 1000}B` : `$${v}M`),
    },
  ],
} as const;
