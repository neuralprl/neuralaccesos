import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, FileDown, CheckCircle2, UserCheck, Calendar, Download } from 'lucide-react';

const SCRIPT_URL_QR = "https://script.google.com/macros/s/AKfycbz-0tXQixABYKrZ6uk7rUZ3BUUt4fbntpSKLQS_dXbccqKooqmU8bwqPWkfAtaKcEuc/exec";

export default function AppQR() {
  const [globalFiles, setGlobalFiles] = useState({ inf: '', med: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successSent, setSuccessSent] = useState(false);
  const [expiryDateStr, setExpiryDateStr] = useState('');
  const passCardRef = useRef(null);

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

  // Función para descargar el pase como un archivo de texto con diseño o simular captura
  // Nota: Para descarga directa de imagen web sin dependencias pesadas, creamos un canvas o descargamos un certificado limpio.
  const handleDownloadPass = () => {
    const passContent = `==================================================
           GRUPO NEURAL - PASE OFICIAL DE ACCESO PRL
==================================================
ESTADO: AUTORIZADO / VALIDADO
--------------------------------------------------
- Trabajador: ${formData.nombre}
- DNI / NIE: ${formData.dni}
- Empresa: ${formData.empresa}
- Validez: 6 Meses (Hasta el ${expiryDateStr})
--------------------------------------------------
INSTRUCCIÓN PARA EL CENTRO:
"ENSEÑA ESTA IMAGEN AL CENTRO PARA QUE AUTORICE TU ENTRADA"
==================================================`;

    const blob = new Blob([passContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pase_Acceso_Neural_${formData.dni}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (successSent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div ref={passCardRef} className="bg-white text-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 border-4 border-emerald-500">
          
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Acceso Validado!</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
              Grupo Neural • Control de Acceso PRL
            </p>
          </div>

          {/* Tarjeta de validez y trabajador */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-400 font-semibold">Trabajador:</span>
              <span className="font-bold text-slate-800">{formData.nombre}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-400 font-semibold">DNI / NIE:</span>
              <span className="font-bold text-slate-800">{formData.dni}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Empresa:</span>
              <span className="font-bold text-slate-800">{formData.empresa}</span>
            </div>
          </div>

          {/* Aviso de Caducidad (6 meses) */}
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-center gap-3 text-left">
            <Calendar className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="text-xs leading-snug">
              <span className="font-bold block">Validez del pase:</span>
              Válida hasta el <b>{expiryDateStr}</b> (6 meses de vigencia).
            </div>
          </div>

          {/* Instrucción clara para el centro */}
          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-md text-xs font-bold leading-relaxed tracking-wide">
            📱 ENSEÑA ESTA IMAGEN AL CENTRO PARA QUE AUTORICE TU ENTRADA
          </div>

          {/* Botón de descarga / guardado */}
          <button 
            onClick={handleDownloadPass}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <Download className="w-4 h-4" /> Guardar Justificante de Pase
          </button>

          <p className="text-[11px] text-slate-400 italic">
            Esta página permanecerá bloqueada como justificante oficial hasta que la cierres.
          </p>

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
              <UserCheck className="w-5 h-5" /> {submitting ? 'Generando pase...' : 'Validar y Generar Pase de Entrada'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
