import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeCategory, setActiveCategory, menuItems, setMenuItems }) => {
  const { user } = useAuth();
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddMenuItem = (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    
    const newItem = {
      id: `custom-${Date.now()}`,
      label: newSectionTitle,
      icon: 'FolderPlus'
    };
    
    setMenuItems([...menuItems, newItem]);
    setNewSectionTitle('');
    setShowAddModal(false);
  };

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl text-white">
          <Icons.ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight">Gestión PRL</h1>
          <p className="text-xs text-slate-400">Control Documental</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Estructura documental
        </div>

        {menuItems.map((item) => {
          const IconComponent = Icons[item.icon] || Icons.FileText;
          const isActive = activeCategory === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition text-left ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}

        {user.isSuperAdmin && (
          <div className="pt-4 border-t border-slate-800 mt-4">
            <div className="px-3 py-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Control Superadmin
            </div>
            <button
              onClick={() => setActiveCategory('menu-checks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition text-left ${
                activeCategory === 'menu-checks'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 border border-purple-800/50'
              }`}
            >
              <Icons.CheckSquare className="w-4 h-4 text-purple-300" />
              <span>MENÚ DE CHECKS</span>
            </button>
          </div>
        )}
      </nav>

      {user.isSuperAdmin && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          {showAddModal ? (
            <form onSubmit={handleAddMenuItem} className="space-y-2">
              <input 
                type="text" 
                placeholder="Nombre de la sección..."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 text-white text-xs rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-1 bg-blue-600 text-white rounded text-xs font-bold">Añadir</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">Cancelar</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700"
            >
              <Icons.Plus className="w-4 h-4 text-blue-400" /> Ampliar Menú
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
