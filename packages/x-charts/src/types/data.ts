export type DatasetWithIndex<T extends CompoundType = CompoundType> = {
  data: T[];
  index: string;
};

type Primitive = number | string | Date | null | undefined | boolean;

type CompoundType =
  | Primitive // [1,2,3]
  | Primitive[] // [[1,2,3],[4,5,6]]
  | { [key: string]: Primitive }; // [{x:1,y:2}, {x:3,y:4}]

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
      ? A extends ReadonlyArray<any> | Primitive
        ? number
        : keyof A
      : number,
> = {
  /**
   * Dataset to render. It is always an array, but can be an array of primitives, a nested array or an array of objects.
   *
   * @see {@link DatasetWithIndex} for information on how to use indexes.
   * @default []
   * @example
   * ```tsx
   * const dataset = [
   *   [1, 2, 3],
   *   [ [4, 5, 6] , [7, 8, 9] ],
   *   [ { x: 1, y: 2 } , { x: 2, y: 3 } ,
   * ] as const;
   * ```
   */
  dataset: T;
  series: {
    /**
     * Index of the dataset to use.
     * @default 0
     */
    datasetIndex?: DI;
    /**
     * Key of the series to use.
     * @default 0
     */
    seriesKey?: SK;
    /**
     * Label used for identifying the series.
     */
    label?: string;
    /**
     * Stack id to group series together.
     */
    stackId?: string;
  }[];
};
