import * as React from 'react';
import { BarChartPro } from '@mui/x-charts-pro/BarChartPro';
import { BarChartProps } from '@mui/x-charts/BarChart';
import { useDrawingArea, useXAxes } from '@mui/x-charts/hooks';
import { usAirportPassengersData } from 'docsx/data/visual-regression-tests/airportData';

const defaultXAxis = {
  dataKey: 'code',
  height: 80,
  valueFormatter: (value: any) =>
    usAirportPassengersData.find((item) => item.code === value)!.fullName,
  label: '0deg Axis Title',
} as const;

const degrees = [-180, -135, -90, -45, 0, 45, 90, 135, 180];

type AxisPosition = NonNullable<BarChartProps['xAxis']>[number]['position'];

const xAxes = degrees
  .map((angle) => ({
    ...defaultXAxis,
    position: 'bottom' as AxisPosition,
    id: `angle${angle}`,
    label: `${angle}deg Axis Title`,
    tickLabelStyle: { angle },
  }))
  .concat(
    degrees.map((angle) => ({
      ...defaultXAxis,
      id: `top-angle${angle}`,
      label: `${angle}deg Axis Title`,
      position: 'top',
      tickLabelStyle: { angle },
    })),
  ) satisfies BarChartProps['xAxis'];

export default function XAxisTickLabelOverflow() {
  return (
    <BarChartPro
      xAxis={xAxes}
      // Other props
      height={1600}
      dataset={usAirportPassengersData}
      series={[
        { dataKey: '2018', label: '2018' },
        { dataKey: '2019', label: '2019' },
        { dataKey: '2020', label: '2020' },
        { dataKey: '2021', label: '2021' },
        { dataKey: '2022', label: '2022' },
      ]}
      hideLegend
      yAxis={[
        {
          valueFormatter: (value: number) => `${(value / 1000).toLocaleString()}k`,
          width: 60,
        },
      ]}
    >
      <AxisSizeVisualization />
    </BarChartPro>
  );
}

const colors = ['black', 'white'];

function AxisSizeVisualization() {
  const { left, top, height, width } = useDrawingArea();
  const axes = useXAxes();

  return (
    <React.Fragment>
      {axes.xAxisIds.map((id, i) => {
        const xAxis = axes.xAxis[id];
        if (xAxis.position === 'none') {
          return null;
        }

        const direction = xAxis.position === 'top' ? -1 : 1;
        const offset = xAxis.offset;
        const start =
          xAxis.position === 'top'
            ? top - xAxis.height + offset * direction
            : (top + height + offset) * direction;

        return (
          <rect
            key={id}
            x={left}
            y={start}
            width={width}
            height={xAxis.height ?? 0}
            fill={colors[(i + (xAxis.position === 'top' ? 1 : 0)) % colors.length]}
            opacity={0.1}
          />
        );
      })}
    </React.Fragment>
  );
}
