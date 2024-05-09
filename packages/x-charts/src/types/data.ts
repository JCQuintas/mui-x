export type DatasetWithIndex<T extends CompoundType = CompoundType> = {
  data: T[];
  index: string;
};

type BaseType = number | string | Date | null | undefined | boolean;

type CompoundType =
  | BaseType // [1,2,3]
  | BaseType[] // [[1,2,3],[4,5,6]]
  | { [key: string]: BaseType }; // [{x:1,y:2}, {x:3,y:4}]

export type Dataset<T extends CompoundType = CompoundType> = T[] | T[][] | DatasetWithIndex<T>[];
// T[][] is for supporting:
// [ [[1,2],[3,4]] , [[5,6],[7,8]] ]
// [ [{x:1,y:2},{x:3,y:4}] , [{x:5,y:6},{x:7,y:8}] ]

type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
    ? T
    : T extends object
      ? DeepReadonlyObject<T>
      : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export type ChartProps<
  T extends DeepReadonly<Dataset> = DeepReadonly<Dataset>,
  DI = T[number] extends DeepReadonly<{ index: infer I }> ? I | number : number,
  SK = T[number] extends DeepReadonly<{ data: infer D }>
    ? D extends ReadonlyArray<ReadonlyArray<any>>
      ? number
      : D extends ReadonlyArray<DeepReadonly<{ [key: string]: any }>>
        ? keyof D[number]
        : number
    : T[number] extends ReadonlyArray<infer A>
      ? A extends ReadonlyArray<any> | BaseType
        ? number
        : keyof A
      : number,
> = {
  dataset: T;
  series: {
    datasetIndex: DI;
    seriesKey: SK;
    label: string;
  }[];
};
