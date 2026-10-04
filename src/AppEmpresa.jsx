import { useEffect, useState } from 'react'
import Marco from './Marco'
import CaeDocumentos from './CaeDocumentos'
import VistaTexto from './VistaTexto'
import { cargarContenidos, cargarTipos, explicar } from './caeDatos'
import { URL_ACCESOS, resumenEmpresa } from './caeLogic'
import { imprimirCertificado, imprimirContenido } from './caeImprimir'

// Aplicación de una empresa externa (usuario con rol «empresa»): solo su documentación CAE,
// la información para sus trabajadores y el enlace de la web de accesos.
const MENU_EMPRESA = [
  { id: 'cae', titulo: 'Coordinación (CAE)', items: [
    { id: 'docs', titulo: 'Documentación de la empresa' },
    { id: 'info', titulo: 'Información para tus trabajadores' },
    { id: 'acceso', titulo: 'Pase de acceso a los centros' },
  ] },
]
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }

export default function AppEmpresa({ supabase, sesion }) {
  const [seccion, setSeccion] = useState('docs')
  const [empresa, setEmpresa] = useState(null)
  const [tipos, setTipos] = useState(null)
  const [textos, setTextos] = useState(null)
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const id = sesion.user.app_metadata?.empresa_id
        const [e, d, t, c] = await Promise.all([
          supabase.from('empresas_externas').select('*').eq('id', id).maybeSingle(),
          supabase.from('cae_documentos').select('*').eq('empresa_id', id).eq('vigente', true),
          cargarTipos(supabase), cargarContenidos(supabase),
        ])
        if (e.error) throw new Error(explicar(e.error))
        if (d.error) throw new Error(explicar(d.error))
        if (!e.data) throw new Error('Tu usuario no está vinculado a ninguna empresa. Contacta con el servicio de prevención del Grupo Neural.')
        setEmpresa({ ...e.data, docs: d.data }); setTipos(t); setTextos(c)
      } catch (err) { setError(err.message) }
    })()
  }, [supabase, sesion])

  const onDoc = (doc) => setEmpresa((e) => ({ ...e, docs: [...e.docs.filter((x) => x.id !== doc.id && x.tipo !== doc.tipo), doc] }))
  const r = empresa && tipos ? resumenEmpresa(tipos, empresa.docs) : null

  return (
    <Marco email={sesion.user.email} onSalir={() => supabase.auth.signOut()} menu={empresa ? MENU_EMPRESA : []} seccion={seccion} onElegir={setSeccion}>
      <div style={{ textAlign: 'left' }}>
        {error && <p style={aviso}>{error}</p>}
        {!error && !empresa && <p>Cargando...</p>}
        {empresa && (
          <>
            <h2 style={{ marginBottom: 4 }}>{empresa.nombre}</h2>
            <p style={{ margin: '0 0 14px', fontWeight: 600, color: r.obligPend.length ? '#8a5a00' : '#1b6e3c' }}>
              {r.obligPend.length ? `Faltan o han caducado ${r.obligPend.length} documentos: ${r.obligPend.map((t) => t.nombre).join(', ')}.` : 'La documentación de tu empresa está completa.'}
            </p>

            {seccion === 'docs' && (
              <>
                <p style={{ marginTop: 0, maxWidth: '75ch' }}>
                  Sube cada documento con su fecha de caducidad. El servicio de prevención del Grupo Neural lo revisará; si lo rechaza, verás el motivo.
                  Te recomendamos renovar los documentos antes de que caduquen.
                </p>
                <p><button className="secundario" onClick={() => imprimirCertificado(empresa)}>Descargar la plantilla del certificado CAE</button></p>
                <CaeDocumentos supabase={supabase} empresa={empresa} tipos={tipos} modo="empresa" onCambio={onDoc} />
              </>
            )}

            {seccion === 'info' && (
              <>
                <p style={{ marginTop: 0, maxWidth: '75ch' }}>Tu empresa debe trasladar esta información a todos sus trabajadores antes de que acudan a los centros. Es común a todos los centros del Grupo Neural.</p>
                {['ir_externos', 'emergencias_externos'].filter((k) => textos?.[k]).map((k) => (
                  <details key={k} style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: '10px 14px', background: '#fff', marginBottom: 12 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#1f3864' }}>{textos[k].titulo}</summary>
                    <p><button className="secundario" onClick={() => imprimirContenido(textos[k])}>PDF</button></p>
                    <VistaTexto texto={textos[k].texto} />
                  </details>
                ))}
              </>
            )}

            {seccion === 'acceso' && (
              <div style={{ maxWidth: '75ch' }}>
                <p style={{ marginTop: 0 }}>
                  Cada trabajador obtiene su pase personal en esta web, desde su móvil y sin usuario: lee la información de riesgos y las medidas de emergencia,
                  escribe su nombre, su DNI o NIE y el nombre de la empresa, y descarga la imagen del pase, válida 6 meses en cualquier centro del Grupo Neural.
                  Debe mostrarla en la entrada junto con su DNI.
                </p>
                <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a href={URL_ACCESOS} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, fontSize: 18 }}>{URL_ACCESOS.replace(/^https?:\/\//, '')}</a>
                  <button className="secundario" onClick={() => navigator.clipboard?.writeText(URL_ACCESOS).then(() => setCopiado(true))}>{copiado ? 'Copiado' : 'Copiar enlace'}</button>
                </p>
                <p>Pide a tus trabajadores que escriban el nombre de la empresa tal como figura aquí: <b>{empresa.nombre}</b>.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Marco>
  )
}
