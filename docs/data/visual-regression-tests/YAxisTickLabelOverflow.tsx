import * as React from 'react';
import { BarChartPro } from '@mui/x-charts-pro/BarChartPro';
import { BarChartProps } from '@mui/x-charts/BarChart';
import { useDrawingArea, useYAxes } from '@mui/x-charts/hooks';
import { usAirportPassengersData } from 'docsx/data/visual-regression-tests/airportData';

const defaultYAxis = {
  dataKey: 'code',
  width: 80,
  valueFormatter: (value: any) =>
    usAirportPassengersData.find((item) => item.code === value)!.fullName,
  label: '0deg Axis Title',
} as const;

const degrees = [-135, -45, 0, 45, 135];

type AxisPosition = NonNullable<BarChartProps['yAxis']>[number]['position'];

const yAxes = degrees
  .map((angle) => ({
    ...defaultYAxis,
    position: 'left' as AxisPosition,
    id: `angle${angle}`,
    label: `${angle}deg Axis Title`,
    tickLabelStyle: { angle },
  }))
  .concat(
    degrees.map((angle) => ({
      ...defaultYAxis,
      id: `right-angle${angle}`,
      label: `${angle}deg Axis Title`,
      position: 'right',
      tickLabelStyle: { angle },
    })),
  ) satisfies BarChartProps['yAxis'];

export default function YAxisTickLabelOverflow() {
  return (
    <BarChartPro
      yAxis={yAxes}
      // Other props
      width={850}
      height={400}
      dataset={usAirportPassengersData}
      layout="horizontal"
      series={[
        { dataKey: '2018', label: '2018' },
        { dataKey: '2019', label: '2019' },
        { dataKey: '2020', label: '2020' },
        { dataKey: '2021', label: '2021' },
        { dataKey: '2022', label: '2022' },
      ]}
      hideLegend
      xAxis={[
        {
          valueFormatter: (value: number) => `${(value / 1000).toLocaleString()}k`,
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
  const axes = useYAxes();

  return (
    <React.Fragment>
      {axes.yAxisIds.map((id, i) => {
        const yAxis = axes.yAxis[id];
        if (yAxis.position === 'none') {
          return null;
        }

        const direction = yAxis.position === 'left' ? -1 : 1;
        const offset = yAxis.offset;
        const start =
          yAxis.position === 'left'
            ? left - yAxis.width + offset * direction
            : (left + width + offset) * direction;

        return (
          <rect
            key={id}
            x={start}
            y={top}
            width={yAxis.width ?? 0}
            height={height}
            fill={colors[(i + (yAxis.position === 'left' ? 0 : 1)) % colors.length]}
            opacity={0.1}
          />
        );
      })}
    </React.Fragment>
  );
}
