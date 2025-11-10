import type { PropsWithChildren } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen bg-brand-light">
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
