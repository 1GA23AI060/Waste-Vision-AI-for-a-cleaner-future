import React from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Truck, 
  UserCheck, 
  Biohazard, 
  Cpu, 
  Package, 
  Recycle, 
  Leaf, 
  HelpCircle 
} from 'lucide-react';

export function PriorityBadge({ priority, score, showScore = true }) {
  const p = (priority || 'Medium').toLowerCase();
  
  if (p === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        Critical
        {showScore && score !== undefined && (
          <span className="ml-1 px-1.5 py-0.2 bg-rose-200/70 text-rose-800 rounded font-mono text-[10px]">
            {Math.round(score)}
          </span>
        )}
      </span>
    );
  }

  if (p === 'high') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        High
        {showScore && score !== undefined && (
          <span className="ml-1 px-1.5 py-0.2 bg-amber-200/70 text-amber-800 rounded font-mono text-[10px]">
            {Math.round(score)}
          </span>
        )}
      </span>
    );
  }

  if (p === 'medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
        <Clock className="w-3.5 h-3.5 text-yellow-600" />
        Medium
        {showScore && score !== undefined && (
          <span className="ml-1 px-1.5 py-0.2 bg-yellow-200/70 text-yellow-900 rounded font-mono text-[10px]">
            {Math.round(score)}
          </span>
        )}
      </span>
    );
  }

  // Low
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      Low
      {showScore && score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-emerald-200/70 text-emerald-800 rounded font-mono text-[10px]">
          {Math.round(score)}
        </span>
      )}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = (status || 'Pending').toLowerCase();

  if (s === 'resolved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Resolved
      </span>
    );
  }

  if (s === 'in progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
        <Truck className="w-3.5 h-3.5 text-purple-600" />
        In Progress
      </span>
    );
  }

  if (s === 'assigned') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
        Assigned
      </span>
    );
  }

  // Pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
      Pending
    </span>
  );
}

export function CategoryBadge({ category }) {
  const c = (category || 'Other').toLowerCase();

  if (c === 'hazardous') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <Biohazard className="w-3.5 h-3.5 text-red-600" />
        Hazardous
      </span>
    );
  }

  if (c === 'plastic') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Recycle className="w-3.5 h-3.5 text-emerald-600" />
        Plastic
      </span>
    );
  }

  if (c === 'e-waste' || c === 'ewaste') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Cpu className="w-3.5 h-3.5 text-blue-600" />
        E-waste
      </span>
    );
  }

  if (c === 'wet') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <Leaf className="w-3.5 h-3.5 text-amber-600" />
        Wet Waste
      </span>
    );
  }

  if (c === 'dry') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        <Package className="w-3.5 h-3.5 text-slate-500" />
        Dry Waste
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
      <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
      {category || 'Other'}
    </span>
  );
}
