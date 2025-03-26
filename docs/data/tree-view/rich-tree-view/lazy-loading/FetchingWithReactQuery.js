import * as React from 'react';
import { RichTreeViewPro } from '@mui/x-tree-view-pro/RichTreeViewPro';
import {
  randomInt,
  randomName,
  randomId,
  randomBoolean,
} from '@mui/x-data-grid-generator';

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

const items = [];

const fetchData = async (_parentId) => {
  const length = randomInt(5, 10);
  const rows = Array.from({ length }, () => ({
    id: randomId(),
    label: randomName({}, {}),
    ...(randomBoolean() ? { childrenCount: length } : {}),
  }));

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(rows);
    }, 1000);
  });
};

export function FetchChildren() {
  const myQueryClient = useQueryClient();

  const fetchTreeItems = async (parentId) => {
    const queryKey = parentId ? ['treeItems', parentId] : ['treeItems', 'root'];
    const data = await myQueryClient.fetchQuery({
      queryKey,
      queryFn: () => fetchData(parentId),
    });
    return data;
  };

  return (
    <RichTreeViewPro
      items={items}
      dataSource={{
        getChildrenCount: (item) => item?.childrenCount,
        getTreeItems: fetchTreeItems,
      }}
    />
  );
}

export default function FetchingWithReactQuery() {
  return (
    <QueryClientProvider client={queryClient}>
      <FetchChildren />
    </QueryClientProvider>
  );
}
