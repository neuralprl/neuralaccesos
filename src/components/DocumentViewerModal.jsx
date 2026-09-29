import React from 'react';
import { X, Lock, AlertTriangle } from 'lucide-react';

export const DocumentViewerModal = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        <div className="bg-amber-500 text-slate-900 px-4 py-2 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>MODO LECTURA PROTEGIDA — Control de Seguridad Activo</span>
          </div>
          <span className="bg-amber-700/20 px-2 py-0.5 rounded text-[11px]">Prohibido Copiar/Descargar</span>
        </div>

        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{document.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded">{document.centerName}</span>
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{document.zoneName}</span>
              <span>Fecha: {document.date}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-500 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div 
          className="p-8 overflow-y-auto flex-1 bg-slate-100 select-none relative"
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
        >
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none">
            <p className="text-6xl font-black rotate-45 text-slate-900 uppercase">Copia No Autorizada</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 min-h-[400px] text-slate-800 font-mono text-sm relative z-10 whitespace-pre-line">
            {document.content}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Edición y guardado deshabilitados.
          </span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg">
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  );
};
