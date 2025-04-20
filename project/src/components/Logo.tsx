import React from 'react';
import { Square } from 'lucide-react';

export default function Logo() {
  return (
    <div className="relative flex items-center justify-center">
      <Square className="h-24 w-24 text-yellow-500 rotate-45" strokeWidth={1.5} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xl font-bold text-primary-950 bg-yellow-500 px-3 py-1 rounded transform -rotate-6">
          ClassPlane
        </div>
      </div>
    </div>
  );
}