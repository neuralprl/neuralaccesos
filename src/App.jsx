import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileDown, CheckCircle2, UserCheck } from 'lucide-react';

const SCRIPT_URL_QR = "https://script.google.com/macros/s/AKfycbz-0tXQixABYKrZ6uk7rUZ3BUUt4fbntpSKLQS_dXbccqKooqmU8bwqPWkfAtaKcEuc/exec";

export default function AppQR() {
  const [globalFiles, setGlobalFiles] = useState({ inf: '', med: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successSent, setSuccessSent] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    empresa: '',
    conformidad: false
  });

  useEffect(() => {
    fetch(SCRIPT_URL_QR)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setGlobalFiles(data.globalFiles);
        }
      })
      .catch(err => {
        console.error("Error cargando archivos globales:", err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.conformidad) {
      alert("Debes marcar la casilla de aceptación y declaración responsable.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(SCRIPT_URL_QR, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (result.status === "success") {
        setSuccessSent(true);
      } else {
        alert("Error del servidor: " + (result.message || "No se pudo registrar el acceso"));
      }
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de conexión con el servidor. Comprueba tu red.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successSent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-white text-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">¡Acceso Validado!</h2>
          <p className="text-sm text-slate-600">
            Tus datos y tu declaración de conformidad han sido registrados correctamente en el sistema de seguridad de Grupo Neural. Ya puedes acceder al centro.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => { setSuccessSent(false); setFormData({ nombre: '', dni: '', empresa: '', conformidad: false }); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
            >
              Registrar otro acceso
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 p-4 max-w-lg mx-auto justify-center">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
        
        {/* Cabecera */}
        <div className="bg-slate-800 text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">Grupo Neural</h1>
          <p className="text-xs text-slate-300">Control de Acceso y PRL para Trabajadores</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Paso 1: Descarga de Documentos */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Paso 1: Consulta obligatoria previa
            </h2>
            
            <div className="grid grid-cols-1 gap-2.5">
              <a 
                href={globalFiles.inf || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => { if(!globalFiles.inf) { e.preventDefault(); alert("Documento de Información de Riesgos pendiente de configurar en la hoja de cálculo."); } }}
                className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-between transition shadow-sm"
              >
                <span className="flex items-center gap-2"><FileDown className="w-4 h-4" /> Información de Riesgos a Terceros</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded">Ver PDF</span>
              </a>

              <a 
                href={globalFiles.med || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => { if(!globalFiles.med) { e.preventDefault(); alert("Documento de Medidas de Emergencia pendiente de configurar en la hoja de cálculo."); } }}
                className="p-3.5 bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold flex items-center justify-between transition shadow-sm"
              >
                <span className="flex items-center gap-2"><FileDown className="w-4 h-4" /> Medidas de Emergencia</span>
                <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded">Ver PDF</span>
              </a>
            </div>
          </div>

          <hr />

          {/* Paso 2: Formulario y Declaración */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Paso 2: Datos y Declaración Responsable
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre y Apellidos</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Juan Pérez García"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">DNI / NIE</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. 12345678X"
                value={formData.dni}
                onChange={e => setFormData({...formData, dni: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Empresa Contratista</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Montajes Eléctricos S.L."
                value={formData.empresa}
                onChange={e => setFormData({...formData, empresa: e.target.value})}
              />
            </div>

            {/* Checkbox Legal */}
            <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  required
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                  checked={formData.conformidad}
                  onChange={e => setFormData({...formData, conformidad: e.target.checked})}
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Declaro bajo mi responsabilidad que he recibido, leído y comprendido la información de riesgos y medidas de emergencia, y que dispongo de los <b>EPIs adecuados, formación preventiva y aptitud médica (VS)</b> en vigor para los trabajos a realizar.
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition"
            >
              <UserCheck className="w-5 h-5" /> {submitting ? 'Validando acceso...' : 'Validar y Confirmar Acceso'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
