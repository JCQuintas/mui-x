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

const Chart = (props: ChartProps<typeof multiDataset>) => {
  return <></>;
};

const ChartId = (props: ChartProps<typeof multiDatasetWithId>) => {
  return <></>;
};

const Render = () => {
  return (
    <>
      <Chart dataset={multiDataset} series={[{ dataIndex: 0, seriesKey: 'x', label: 'Goals' }]} />
      <ChartId
        dataset={multiDatasetWithId}
        series={[
          { dataIndex: 'third', seriesKey: 'x', label: 'Goals' },
          { dataIndex: 0, seriesKey: 0, label: 'Goals' },
          { dataIndex: 'second', seriesKey: 'y', label: 'Goals' },
          { dataIndex: 1, seriesKey: 1, label: 'Goals' },
        ]}
      />
    </>
  );
};
