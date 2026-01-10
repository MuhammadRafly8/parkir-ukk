'use client'

import React, { useId } from 'react'
import { cn } from '@/app/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string | number; label: string }>
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  id,
  ...props
}) => {
  const generatedId = useId()
  const selectId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
