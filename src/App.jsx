import { useEffect, useState } from 'react'
import Marco from './Marco'
import Pendiente from './Pendiente'
import { MENU_TECNICO, buscarItem } from './menuSistema'
import { supabase, configOk } from './supabaseClient'
import Login from './Login'
import Centros from './Centros'
import Evaluaciones from './Evaluaciones'
import Pac from './Pac'
import PacLista from './PacLista'
import MetodologiaTab from './MetodologiaTab'
import FuncionesPuestos from './FuncionesPuestos'
import Agresiones from './Agresiones'
import HojasEvaluacion from './HojasEvaluacion'
import PapLista from './PapLista'
import InformacionRiesgos from './InformacionRiesgos'
import GestorDocumental from './GestorDocumental'
import Actualizar from './Actualizar'
import ControlCambios from './ControlCambios'
import MemoriaPrograma from './MemoriaPrograma'
import EquiposInstalaciones from './EquiposInstalaciones'
import EvaluacionEmbarazo from './EvaluacionEmbarazo'
import AppCentro from './AppCentro'
import AppEmpresa from './AppEmpresa'
import Cae from './Cae'
import Mantenimiento from './Mantenimiento'
import RequisitosLegales from './RequisitosLegales'
import Plantillas from './Plantillas'
import Biblioteca from './Biblioteca'
import Accidentes from './Accidentes'

export default function App() {
  const [sesion, setSesion] = useState(null)
  const [listo, setListo] = useState(false)
  const [seccion, setSeccion] = useState('evaluaciones')

  useEffect(() => {
    if (!configOk) { setListo(true); return }
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setListo(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!configOk) {
    return (
      <main className="aviso">
        <h1>Falta la conexión con Supabase</h1>
        <p>Añade VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en las variables
          de entorno de Vercel y vuelve a desplegar.</p>
      </main>
    )
  }

  const actual = buscarItem(MENU_TECNICO, seccion)

  if (!listo) return null
  if (!sesion) return <Login />
  if (sesion.user?.app_metadata?.rol === 'centro') return <AppCentro supabase={supabase} sesion={sesion} />
  if (sesion.user?.app_metadata?.rol === 'empresa') return <AppEmpresa supabase={supabase} sesion={sesion} />

  return (
    <Marco email={sesion.user.email} onSalir={() => supabase.auth.signOut()} menu={MENU_TECNICO} seccion={seccion} onElegir={setSeccion}>
        {seccion === 'centros' && <Centros supabase={supabase} />}
        {seccion === 'evaluaciones' && <Evaluaciones supabase={supabase} onActualizar={() => setSeccion('actualizar')} />}
        {seccion === 'ere' && <EvaluacionEmbarazo supabase={supabase} />}
        {seccion === 'pap' && <PapLista supabase={supabase} />}
        {seccion === 'pac' && <PacLista supabase={supabase} />}
        {seccion === 'agresiones' && <Agresiones supabase={supabase} />}
        {seccion === 'actualizar' && <Actualizar supabase={supabase} onIr={setSeccion} />}
        {seccion === 'epis' && <HojasEvaluacion supabase={supabase} modo="epis" />}
        {seccion === 'form' && <HojasEvaluacion supabase={supabase} modo="formacion" />}
        {seccion === 'ir' && <InformacionRiesgos supabase={supabase} />}
        {seccion === 'funciones' && <FuncionesPuestos key="puestos" vistaInicial="puestos" />}
        {seccion === 'metodologia' && <MetodologiaTab onBiblioteca={() => setSeccion('biblioteca')} />}
        {seccion === 'procedimientos' && <GestorDocumental supabase={supabase} ambito="general" onIrOtra={() => setSeccion('docs_centro')} />}
        {seccion === 'docs_centro' && <GestorDocumental supabase={supabase} ambito="centro" onIrOtra={() => setSeccion('procedimientos')} />}
        {seccion === 'cambios' && <ControlCambios supabase={supabase} />}
        {seccion === 'cae' && <Cae supabase={supabase} />}
        {seccion === 'mantenimiento' && <Mantenimiento supabase={supabase} />}
        {seccion === 'accidentes' && <Accidentes supabase={supabase} />}
        {seccion === 'legal' && <RequisitosLegales supabase={supabase} />}
        {seccion === 'plantillas' && <Plantillas onIr={setSeccion} />}
        {seccion === 'biblioteca' && <Biblioteca supabase={supabase} editable />}
        {seccion === 'memoria' && <MemoriaPrograma supabase={supabase} />}
        {seccion === 'equipos' && <EquiposInstalaciones supabase={supabase} />}
        {seccion === 'lugar' && <Pac supabase={supabase} />}
        {seccion === 'actividades' && <FuncionesPuestos key="actividades" vistaInicial="actividades" />}
        {actual?.pendiente && <Pendiente key={actual.id} apartado={actual} />}
    </Marco>
  )
}
