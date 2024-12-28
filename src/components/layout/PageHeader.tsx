import { Breadcrumb } from './Breadcrumb'

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbItems: Array<{
    label: string;
    href?: string;
  }>;
}

export function PageHeader({ title, description, breadcrumbItems }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 pb-8">
      <div className="container mx-auto px-6 max-w-5xl pt-8">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl">{description}</p>
      </div>
    </div>
  );
} 