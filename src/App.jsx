import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, UserCheck, Calendar, Smartphone, ArrowLeft, AlertTriangle, Flame, Lock } from 'lucide-react';

// ⚠️ Asegúrate de que esta URL sea la correcta de tu despliegue actual de Google Apps Script
const SCRIPT_URL_QR = "https://script.google.com/macros/s/AKfycbz-0tXQixABYKrZ6uk7rUZ3BUUt4fbntpSKLQS_dXbccqKooqmU8bwqPWkfAtaKcEuc/exec";

export default function AppQR() {
  const [currentView, setCurrentView] = useState('form');

  const [readInf, setReadInf] = useState(false);
  const [readMed, setReadMed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successSent, setSuccessSent] = useState(false);
  const [expiryDateStr, setExpiryDateStr] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    empresa: '',
    centro: '',
    conformidad: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!readInf || !readMed) {
      alert("⚠️ Debes leer obligatoriamente la 'Información de Riesgos' y las 'Medidas de Emergencia' antes de continuar.");
      return;
    }

    if (!formData.conformidad) {
      alert("Debes marcar la casilla de aceptación y declaración responsable.");
      return;
    }

    setSubmitting(true);
    
    try {
      // LLAMADA REAL A GOOGLE APPS SCRIPT PARA GUARDAR EN SHEETS Y ENVIAR EMAIL
      const response = await fetch(SCRIPT_URL_QR, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (result.status === "success") {
        const fechaActual = new Date();
        fechaActual.setMonth(fechaActual.getMonth() + 6);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        setExpiryDateStr(fechaActual.toLocaleDateString('es-ES', opciones));
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

  // ==========================================
  // PÁGINA WEB: INFORMACIÓN DE RIESGOS (INF)
  // ==========================================
  if (currentView === 'inf') {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-4 font-sans text-slate-100 flex justify-center">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full flex flex-col">
          
          <div className="bg-emerald-700 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-600">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wide uppercase">Información de Riesgos a Terceros</h1>
                <p className="text-xs text-emerald-200">neuralinf.vercel.app • Grupo Neural</p>
              </div>
            </div>
            <button 
              onClick={() => { setReadInf(true); setCurrentView('form'); }}
              className="bg-white hover:bg-emerald-50 text-emerald-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Entendido y Volver
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300 overflow-y-auto max-h-[75vh]">
            <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-2xl text-emerald-200">
              <p className="font-semibold">
                Los proveedores y empresas concurrentes que accedan a las instalaciones deberán cumplir las normas de seguridad y salud establecidas por el centro, colaborando activamente en la coordinación de actividades empresariales y respetando las instrucciones del personal responsable.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> 1. Riesgos de Seguridad
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-white text-xs mb-1">Caídas al mismo nivel</h3>
                  <p className="text-slate-400 text-xs">Superficies resbaladizas por limpieza, derrames o climatología. Mantenga pasillos despejados y utilice calzado adecuado.</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-white text-xs mb-1">Caídas a distinto nivel</h3>
                  <p className="text-slate-400 text-xs">En escaleras interiores o accesos entre plantas. Utilice siempre los pasamanos y mantenga tres puntos de apoyo.</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-white text-xs mb-1">Golpes y choques contra objetos</h3>
                  <p className="text-slate-400 text-xs">Presencia de mobiliario, puertas, armarios o equipos clínicos. Evite dejar materiales en zonas de paso.</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-white text-xs mb-1">Riesgo eléctrico</h3>
                  <p className="text-slate-400 text-xs">Uso de equipos informáticos y climatización. Queda prohibido manipular cuadros eléctricos sin autorización.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> 2. Riesgos Higiénicos y Ambientales
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-white text-xs mb-1">Exposición a agentes biológicos</h3>
                  <p className="text-slate-400 text-xs">Presencia potencial de microorganismos en áreas sanitarias. Respete la higiene, lavado de manos y use los EPIs requeridos.</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-white text-xs mb-1">Exposición a productos químicos</h3>
                  <p className="text-slate-400 text-xs">Productos de limpieza y desinfección irritantes. Evite contacto directo y siga las fichas de seguridad.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button 
                onClick={() => { setReadInf(true); setCurrentView('form'); }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-900/50 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> He leído y comprendido - Volver al formulario
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PÁGINA WEB: MEDIDAS DE EMERGENCIA (MED)
  // ==========================================
  if (currentView === 'med') {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-4 font-sans text-slate-100 flex justify-center">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full flex flex-col">
          
          <div className="bg-purple-700 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-600">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wide uppercase">Medidas de Emergencia y Evacuación</h1>
                <p className="text-xs text-purple-200">neuralmed.vercel.app • Grupo Neural</p>
              </div>
            </div>
            <button 
              onClick={() => { setReadMed(true); setCurrentView('form'); }}
              className="bg-white hover:bg-purple-50 text-purple-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Entendido y Volver
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300 overflow-y-auto max-h-[75vh]">
            <div className="bg-purple-950/40 border border-purple-800/60 p-4 rounded-2xl text-purple-200">
              <p className="font-semibold">
                Las empresas proveedoras, contratistas y personal externo que accedan a las instalaciones deberán conocer y cumplir estrictamente las medidas de emergencia establecidas.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> 1. Actuación General
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <li><strong className="text-white">Mantener la calma</strong> en todo momento.</li>
                <li>Comunicar inmediatamente cualquier incidencia al personal responsable del centro.</li>
                <li>Seguir las instrucciones del responsable de emergencia o equipos de intervención.</li>
                <li>Facilitar la labor de los servicios de emergencia externos.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> 2. Normas de Evacuación
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <li>Abandonar el edificio de forma ordenada y sin correr por las vías señalizadas.</li>
                <li><strong className="text-white">Queda prohibido utilizar los ascensores.</strong></li>
                <li>No regresar a por objetos personales y dirigirse al Punto de Reunión Exterior.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> 3. Teléfonos de Emergencia Clave
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-rose-950/50 border border-rose-800/60 p-3 rounded-xl">
                  <span className="block text-rose-300 text-[10px] uppercase font-bold">Emergencias</span>
                  <span className="text-lg font-black text-white">112</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-700 p-3 rounded-xl">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Policía Nac.</span>
                  <span className="text-lg font-black text-white">091</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-700 p-3 rounded-xl">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Policía Local</span>
                  <span className="text-lg font-black text-white">092</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-700 p-3 rounded-xl">
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Guardia Civil</span>
                  <span className="text-lg font-black text-white">062</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button 
                onClick={() => { setReadMed(true); setCurrentView('form'); }}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-purple-900/50 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> He leído y comprendido - Volver al formulario
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA DE ÉXITO (PASE VALIDADO)
  // ==========================================
  if (successSent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 border-4 border-emerald-500">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Acceso Validado!</h2>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              Grupo Neural • Control de Acceso PRL
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs shadow-inner">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-400 font-semibold">Trabajador:</span>
              <span className="font-bold text-slate-800">{formData.nombre}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-400 font-semibold">DNI / NIE:</span>
              <span className="font-bold text-slate-800">{formData.dni}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-400 font-semibold">Empresa:</span>
              <span className="font-bold text-slate-800">{formData.empresa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Centro:</span>
              <span className="font-bold text-blue-600">{formData.centro}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-center gap-3 text-left">
            <Calendar className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-xs leading-snug">
              <span className="font-bold block">Validez del pase:</span>
              Válido hasta el <b>{expiryDateStr}</b> (6 meses de vigencia).
            </div>
          </div>

          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md text-xs font-bold leading-relaxed tracking-wide space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-100 uppercase text-[10px] tracking-widest">
              <Smartphone className="w-4 h-4" /> Acción Obligatoria
            </div>
            📷 HAZ UNA CAPTURA DE PANTALLA DE ESTE PASE Y ENSÉÑALA EN EL CENTRO PARA AUTORIZAR TU ENTRADA
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA PRINCIPAL: FORMULARIO
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 p-4 max-w-lg mx-auto justify-center">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
        
        <div className="bg-slate-800 text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">Grupo Neural</h1>
          <p className="text-xs text-slate-300">Control de Acceso y PRL para Trabajadores</p>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Paso 1: Consulta obligatoria previa</span>
              {readInf && readMed && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  ✓ Todo leído
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-1 gap-2.5">
              <button 
                type="button"
                onClick={() => setCurrentView('inf')}
                className={`p-3.5 border rounded-xl text-xs font-bold flex items-center justify-between transition shadow-sm w-full text-left ${
                  readInf 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Información de Riesgos
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg text-white font-bold ${readInf ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                  {readInf ? '✓ Leído' : 'Lectura obligatoria'}
                </span>
              </button>

              <button 
                type="button"
                onClick={() => setCurrentView('med')}
                className={`p-3.5 border rounded-xl text-xs font-bold flex items-center justify-between transition shadow-sm w-full text-left ${
                  readMed 
                    ? 'bg-purple-50 text-purple-800 border-purple-300' 
                    : 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Medidas de Emergencia
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg text-white font-bold ${readMed ? 'bg-purple-600' : 'bg-amber-600'}`}>
                  {readMed ? '✓ Leído' : 'Lectura obligatoria'}
                </span>
              </button>
            </div>
          </div>

          <hr />

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

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Centro de Trabajo</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Sede Central / Planta 2"
                value={formData.centro}
                onChange={e => setFormData({...formData, centro: e.target.value})}
              />
            </div>

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
              className={`w-full py-3.5 font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition ${
                (!readInf || !readMed) 
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {(!readInf || !readMed) ? (
                <>
                  <Lock className="w-4 h-4" /> Lee los documentos previos para desbloquear
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" /> {submitting ? 'Registrando acceso...' : 'Validar y Generar Pase de Entrada'}
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
