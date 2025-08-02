import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex items-center space-x-4">
        {children}
      </div>
    </header>
  );
};

export default PageHeader;