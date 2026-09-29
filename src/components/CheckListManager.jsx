import React, { useState } from 'react';
import { Plus, CheckSquare, Upload } from 'lucide-react';

export const CheckListManager = () => {
  const [checklists, setChecklists] = useState([
    { id: 1, title: "Checklist Inspección Anual Extintores", items: 12, date: "2026-01-10" },
    { id: 2, title: "Revisión de Arneses y Líneas de Vida", items: 8, date: "2026-02-04" }
  ]);
  const [showUpload, setShowUpload] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreateChecklist = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setChecklists([
      ...checklists, 
      { id: Date.now(), title: newTitle, items: 10, date: "2026-03-24" }
    ]);
    setNewTitle('');
    setShowUpload(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full">Solo Superadmin</span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">MENÚ DE CHECKS (Listas de Chequeo)</h2>
        </div>
        
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nueva Lista
        </button>
      </div>

      {showUpload && (
        <form onSubmit={handleCreateChecklist} className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Nombre de la lista..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-purple-300 rounded-md"
              required
            />
            <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-sm font-medium rounded-md">
              Generar Checklist
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklists.map((check) => (
          <div key={check.id} className="p-4 border border-slate-200 rounded-lg flex items-start gap-3 bg-slate-50/50">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">{check.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{check.items} Puntos • Creado: {check.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
