import type React from 'react';

export const inputClass = (error?: boolean) =>
  `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
  }`;

export const selectClass = () =>
  `w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors`;

export function Field({
  label, children, error, required, hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

export function today() {
  return new Date().toISOString().split('T')[0];
}
