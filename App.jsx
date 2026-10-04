import { useEffect, useState } from 'react'
import { configOk, supabase } from './supabase'
import { dibujarPase, fechaLarga, paseABlob } from './pase'

// Acceso de trabajadores de empresas externas a los centros del Grupo Neural.
// Sin usuario: lee la información de riesgos y las medidas de emergencia generales, rellena sus datos
// (nombre, DNI o NIE y empresa) y descarga la imagen de su pase, válido 6 meses en todos los centros.

const LETRAS = 'TRWAGMYFPDXBNJZSQVHLCKE'
export function dniValido(v) {
  const s = String(v ?? '').toUpperCase().replace(/[\s.-]/g, '')
  let n
  if (/^\d{8}[A-Z]$/.test(s)) n = s.slice(0, 8)
  else if (/^[XYZ]\d{7}[A-Z]$/.test(s)) n = 'XYZ'.indexOf(s[0]) + s.slice(1, 8)
  else return false
  return LETRAS[Number(n) % 23] === s[s.length - 1]
}

function bloques(texto) {
  const out = []
  for (const linea of String(texto ?? '').split(/\r?\n/)) {
    const l = linea.trim()
    if (!l) continue
    if (l.startsWith('# ')) out.push({ t: 'h', x: l.slice(2) })
    else if (l.startsWith('- ')) { const u = out[out.length - 1]; if (u?.t === 'ul') u.items.push(l.slice(2)); else out.push({ t: 'ul', items: [l.slice(2)] }) }
    else out.push({ t: 'p', x: l })
  }
  return out
}
function Texto({ texto }) {
  return bloques(texto).map((b, i) => (b.t === 'h' ? <h3 key={i}>{b.x}</h3> : b.t === 'ul' ? <ul key={i}>{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul> : <p key={i}>{b.x}</p>))
}

function Cabecera() {
  return (
    <header className="cab">
      <svg width="34" height="36" viewBox="0 0 100 104" aria-hidden="true">
        <path d="M50 0 95 16v34c0 28-21 45-45 54C26 95 5 78 5 50V16Z" fill="#1b7a43" />
        <path d="m28 52 16 16 30-32" stroke="#fff" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <strong>Grupo Neural</strong>
        <span>Acceso de trabajadores de empresas externas</span>
      </div>
    </header>
  )
}

function Lectura({ c, onLeido, onVolver }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <main className="caja lectura">
      <button className="enlace" onClick={onVolver}>← Volver</button>
      <h2>{c.titulo}</h2>
      <Texto texto={c.texto} />
      <button className="principal ancho" onClick={onLeido}>He leído y entendido</button>
    </main>
  )
}

function Pase({ pase, onOtro }) {
  const [img, setImg] = useState('')
  const [blob, setBlob] = useState(null)
  useEffect(() => {
    const canvas = dibujarPase(pase)
    setImg(canvas.toDataURL('image/png'))
    paseABlob(canvas).then(setBlob)
    window.scrollTo(0, 0)
  }, [pase])
  const nombre = `pase-neural-${pase.codigo}.png`
  const archivo = blob ? new File([blob], nombre, { type: 'image/png' }) : null
  const puedeCompartir = archivo && navigator.canShare?.({ files: [archivo] })
  function descargar() {
    const a = document.createElement('a')
    a.href = img; a.download = nombre
    document.body.appendChild(a); a.click(); a.remove()
  }
  async function compartir() {
    try { await navigator.share({ files: [archivo], title: 'Pase de acceso Grupo Neural' }) } catch { /* cancelado */ }
  }
  return (
    <main className="caja">
      <div className="ok-cab">Pase emitido</div>
      <p>Guarda la imagen en tu móvil y muéstrala en la entrada de cualquier centro del Grupo Neural junto con tu DNI. Es válida hasta el <b>{fechaLarga(pase.valido_hasta)}</b>.</p>
      {img && <img src={img} alt={`Pase de acceso de ${pase.nombre}, válido hasta el ${fechaLarga(pase.valido_hasta)}, código ${pase.codigo}`} className="pase" />}
      <div className="botones">
        {puedeCompartir && <button className="principal" onClick={compartir}>Guardar en el móvil</button>}
        <button className={puedeCompartir ? 'secundario' : 'principal'} onClick={descargar} disabled={!img}>Descargar imagen</button>
      </div>
      <p className="nota">Si no se descarga, mantén pulsada la imagen y elige «Guardar imagen» o «Añadir a Fotos».</p>
      <button className="enlace" onClick={onOtro}>Registrar a otro trabajador</button>
    </main>
  )
}

export default function App() {
  const [textos, setTextos] = useState(null)
  const [error, setError] = useState('')
  const [vista, setVista] = useState('inicio')
  const [leido, setLeido] = useState({ ir_externos: false, emergencias_externos: false })
  const [f, setF] = useState({ nombre: '', dni: '', empresa: '', declaracion: false, privacidad: false })
  const [verPrivacidad, setVerPrivacidad] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [res, setRes] = useState(null)

  useEffect(() => {
    if (!configOk) { setError('La web no está configurada: faltan las variables de Supabase en Vercel.'); return }
    supabase.from('cae_contenidos').select('clave,titulo,texto,version')
      .then((c) => {
        if (c.error) throw new Error(c.error.message)
        setTextos(Object.fromEntries(c.data.map((x) => [x.clave, x])))
      })
      .catch(() => setError('No se ha podido cargar la información. Comprueba la conexión y vuelve a intentarlo.'))
  }, [])

  const dniOk = dniValido(f.dni)
  const listo = leido.ir_externos && leido.emergencias_externos
  const completo = listo && f.nombre.trim().split(/\s+/).length >= 2 && dniOk && f.empresa.trim().length >= 2 && f.declaracion && f.privacidad

  async function enviar(e) {
    e.preventDefault()
    if (!completo) return
    setError(''); setEnviando(true)
    const version = ['ir_externos', 'emergencias_externos', 'privacidad_accesos'].map((k) => `${k}:v${textos[k]?.version ?? '?'}`).join(' ')
    const { data, error: err } = await supabase.rpc('registrar_acceso_externo', {
      p_nombre: f.nombre, p_dni: f.dni, p_empresa: f.empresa, p_privacidad: f.privacidad, p_declaracion: f.declaracion, p_version_textos: version,
    })
    setEnviando(false)
    if (err) { setError(err.message || 'No se ha podido registrar el acceso.'); return }
    setRes(data)
    setVista('pase')
  }
  function reiniciar() {
    setF({ nombre: '', dni: '', empresa: '', declaracion: false, privacidad: false })
    setLeido({ ir_externos: false, emergencias_externos: false }); setRes(null); setVista('inicio'); window.scrollTo(0, 0)
  }

  if (vista === 'ir_externos' || vista === 'emergencias_externos') {
    return (<><Cabecera /><Lectura c={textos[vista]} onVolver={() => setVista('inicio')} onLeido={() => { setLeido({ ...leido, [vista]: true }); setVista('inicio') }} /></>)
  }
  if (vista === 'pase') return (<><Cabecera /><Pase pase={res} onOtro={reiniciar} /></>)

  return (
    <>
      <Cabecera />
      <main className="caja">
        <h1>Pase de acceso a los centros</h1>
        <p>Para trabajar en cualquier centro del Grupo Neural necesitas este pase. Tardas unos minutos: lee la información, rellena tus datos y guarda la imagen en tu móvil. Vale 6 meses.</p>
        {error && <p className="error" role="alert">{error}</p>}
        {!textos && !error && <p>Cargando...</p>}
        {textos && (
          <>
            <ol className="pasos">
              {['ir_externos', 'emergencias_externos'].map((k, i) => (
                <li key={k} className={leido[k] ? 'hecho' : ''}>
                  <span className="num" aria-hidden="true">{leido[k] ? '✓' : i + 1}</span>
                  <span className="txt">{textos[k]?.titulo}<small>{leido[k] ? 'Leído' : 'Obligatorio'}</small></span>
                  <button className={leido[k] ? 'secundario' : 'principal'} onClick={() => setVista(k)}>{leido[k] ? 'Volver a leer' : 'Leer'}</button>
                </li>
              ))}
            </ol>

            <form onSubmit={enviar} className={listo ? '' : 'apagado'} aria-disabled={!listo}>
              <h2><span className="num" aria-hidden="true">3</span> Tus datos</h2>
              {!listo && <p className="nota">Lee primero la información de riesgos y las medidas de emergencia.</p>}
              <fieldset disabled={!listo}>
                <label>Nombre y apellidos
                  <input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} autoComplete="name" required maxLength={120} />
                </label>
                <label>DNI o NIE
                  <input value={f.dni} onChange={(e) => setF({ ...f, dni: e.target.value.toUpperCase() })} autoComplete="off" required maxLength={12} inputMode="text"
                    aria-invalid={f.dni.length >= 9 && !dniOk} />
                  {f.dni.length >= 9 && !dniOk && <small className="mal">Revisa el DNI o NIE: la letra no coincide.</small>}
                </label>
                <label>Empresa para la que trabajas
                  <input value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} autoComplete="organization" required maxLength={150} />
                </label>

                <label className="check">
                  <input type="checkbox" checked={f.declaracion} onChange={(e) => setF({ ...f, declaracion: e.target.checked })} />
                  <span>{textos.declaracion_accesos?.texto?.trim()}</span>
                </label>
                <label className="check">
                  <input type="checkbox" checked={f.privacidad} onChange={(e) => setF({ ...f, privacidad: e.target.checked })} />
                  <span>He leído el <button type="button" className="enlace" onClick={() => setVerPrivacidad(!verPrivacidad)}>aviso de protección de datos</button>.</span>
                </label>
                {verPrivacidad && <div className="privacidad"><Texto texto={textos.privacidad_accesos?.texto} /></div>}

                <button type="submit" className="principal ancho" disabled={!completo || enviando}>{enviando ? 'Comprobando...' : 'Obtener mi pase'}</button>
              </fieldset>
            </form>
          </>
        )}
      </main>
    </>
  )
}
