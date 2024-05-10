import * as React from 'react';
import { ChartProps, Dataset } from './data';

const multiDatasetWithId = [
  {
    index: 'first',
    data: [1, 2, 3],
  },
  {
    index: 'second',
    data: [
      [4, 5, 6],
      [7, 8, 9],
    ],
  },
  {
    index: 'third',
    data: [
      { x: 1, y: 2 },
      { x: 2, y: 3 },
    ],
  },
] as const;

const multiDataset = [
  [1, 2, 3],
  [
    [4, 5, 6],
    [7, 8, 9],
  ],
  [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
  ],
] as const;

const simpleDataset = [
  [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
  ],
] as const;

function Chart(props: ChartProps<typeof multiDataset>) {
  return <div>{JSON.stringify(props)}</div>;
}

function ChartId(props: ChartProps<typeof multiDatasetWithId>) {
  return <div>{JSON.stringify(props)}</div>;
}

function ChartSimple(props: ChartProps<typeof simpleDataset>) {
  return <div>{JSON.stringify(props)}</div>;
}

export function Render() {
  return (
    <React.Fragment>
      <Chart
        dataset={multiDataset}
        series={[
          { datasetIndex: 0, seriesKey: 0, label: 'right' },
          { datasetIndex: 2, seriesKey: 'x', label: 'right' },
          { datasetIndex: 0, seriesKey: 'x', label: 'wrong' },
        ]}
      />
      <ChartId
        dataset={multiDatasetWithId}
        series={[
          { datasetIndex: 'third', seriesKey: 'x', label: 'right' },
          { datasetIndex: 0, seriesKey: 0, label: 'right' },
          { datasetIndex: 1, seriesKey: 1, label: 'right' },
          { datasetIndex: 'second', seriesKey: 'y', label: 'wrong' },
          { datasetIndex: 1, seriesKey: 'y', label: 'wrong' },
        ]}
      />
      <ChartSimple
        dataset={simpleDataset}
        series={[
          { seriesKey: 'x', label: 'right' },
          { seriesKey: 0, label: 'wrong' },
        ]}
      />
    </React.Fragment>
  );
}
