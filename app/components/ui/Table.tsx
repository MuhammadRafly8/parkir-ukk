import React from 'react'
import { cn } from '@/app/lib/utils'

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <table className={cn('min-w-full divide-y divide-slate-700/50', className)} {...props}>
      {children}
    </table>
  )
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => {
  return (
    <thead className={cn('bg-slate-800/50', className)} {...props}>
      {children}
    </thead>
  )
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className, ...props }) => {
  return (
    <tbody className={cn('divide-y divide-slate-700/30', className)} {...props}>
      {children}
    </tbody>
  )
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => {
  return (
    <tr className={cn('hover:bg-slate-800/30 transition-colors', className)} {...props}>
      {children}
    </tr>
  )
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-slate-100', className)} {...props}>
      {children}
    </td>
  )
}

interface TableHeaderCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className, ...props }) => {
  return (
    <th className={cn('px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider', className)} {...props}>
      {children}
    </th>
  )
}
