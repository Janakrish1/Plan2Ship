import { useState } from 'react';

interface StageSectionProps {
  stageNumber: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function StageSection({ stageNumber, title, children, defaultOpen = false }: StageSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
            {stageNumber}
          </span>
          <span className="font-semibold text-gray-900">{title}</span>
        </span>
        <span className="text-gray-500 text-sm">{open ? '▼ Collapse' : '▶ Expand'}</span>
      </button>
      {open && <div className="p-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}
