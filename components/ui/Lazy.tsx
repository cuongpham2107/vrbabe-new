import React, { Suspense } from 'react';
import { DrawerProps } from './Drawer';

const Drawer = React.lazy(() => import('./Drawer'));

const Loading = () => <div className='px-2 py-1 text-sm'>Đang tải...</div>

export const DrawerLazy = (props: DrawerProps) => {
  return (
    <Suspense fallback={<Loading />}>
      <Drawer {...props} />
    </Suspense>
  );
}