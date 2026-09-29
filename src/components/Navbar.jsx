import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, switchUser, allUsers } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Centro': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Zona': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Global': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-slate-400" />
        <h1 className="font-bold text-slate-700 text-sm">Dashboard de Seguridad y Salud Laboral</h1>
      </div>

      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-2 rounded-xl">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-500">Cambiar Usuario de Prueba:</span>
          <select 
            value={user.id} 
            onChange={(e) => switchUser(e.target.value)}
            className="bg-white text-xs font-bold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} — Permiso: {u.role}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-300" />
          <div>
            <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
              Nivel: {user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
