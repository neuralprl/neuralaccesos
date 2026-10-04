import { useState } from 'react'
import { abrirDocumento, cambiarCaducidad, historial, revisarDocumento, subirDocumento } from './caeDatos'
import { estadoDoc, fechaCorta, hoyISO, sumarMeses } from './caeLogic'

// Documentación CAE de una empresa (ningún documento impide el pase de acceso de sus trabajadores).
// modo 'tecnico': sube, valida, rechaza y corrige la caducidad. modo 'empresa': ve y sube los suyos.
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }

function Chip({ est }) {
  return (
    <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10, color: est.color, background: est.fondo, whiteSpace: 'nowrap' }}>
      {est.texto}
    </span>
  )
}

function Fila({ supabase, empresa, tipo, doc, modo, onCambio }) {
  const [subiendo, setSubiendo] = useState(false)
  const [archivo, setArchivo] = useState(null)
  const [caduca, setCaduca] = useState('')
  const [trabajando, setTrabajando] = useState('')
  const [error, setError] = useState('')
  const [hist, setHist] = useState(null)
  const est = estadoDoc(doc)
  const tecnico = modo === 'tecnico'

  function empezar() { setSubiendo(true); setArchivo(null); setCaduca(sumarMeses(hoyISO(), tipo.meses_validez)); setError('') }
  async function hacer(nombre, fn) {
    setError(''); setTrabajando(nombre)
    try { await fn() } catch (e) { setError(e.message) }
    setTrabajando('')
  }
  const subir = () => hacer('subir', async () => {
    if (!archivo) throw new Error('Elige el archivo.')
    if (archivo.size > 20 * 1024 * 1024) throw new Error('El archivo supera los 20 MB.')
    onCambio(await subirDocumento(supabase, empresa.id, tipo.codigo, archivo, caduca))
    setSubiendo(false); setHist(null)
  })
  const validar = () => hacer('validar', async () => onCambio(await revisarDocumento(supabase, doc.id, 'validado')))
  const rechazar = () => {
    const motivo = window.prompt('Motivo del rechazo (lo verá la empresa):', doc?.motivo ?? '')
    if (motivo === null) return
    hacer('rechazar', async () => onCambio(await revisarDocumento(supabase, doc.id, 'rechazado', motivo)))
  }
  const corregirCaducidad = () => {
    const f = window.prompt('Nueva fecha de caducidad (AAAA-MM-DD). Déjala vacía si no caduca.', doc?.caduca_en ?? '')
    if (f === null) return
    if (f && !/^\d{4}-\d{2}-\d{2}$/.test(f.trim())) { setError('La fecha debe tener el formato AAAA-MM-DD.'); return }
    hacer('caducidad', async () => onCambio(await cambiarCaducidad(supabase, doc.id, f.trim())))
  }
  const verHistorial = () => (hist ? setHist(null) : hacer('hist', async () => setHist(await historial(supabase, empresa.id, tipo.codigo))))

  return (
    <div style={{ borderTop: '1px solid #e2e7ea', padding: '10px 14px' }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <strong>{tipo.nombre}</strong>
          {tipo.descripcion && <div style={{ fontSize: 13, color: '#55616b', marginTop: 2 }}>{tipo.descripcion}</div>}
          <div style={{ fontSize: 13, marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip est={est} />
            {doc?.caduca_en && <span style={{ color: est.pronto != null ? '#8a5a00' : '#55616b', fontWeight: est.pronto != null ? 700 : 400 }}>
              {est.clave === 'caducado' ? 'Caducó' : 'Caduca'} el {fechaCorta(doc.caduca_en)}{est.pronto != null ? ` (en ${est.pronto} días)` : ''}
            </span>}
            {doc && <span style={{ color: '#7b8790' }}>Subido el {fechaCorta(doc.subido_en)}</span>}
          </div>
          {doc?.estado === 'rechazado' && doc.motivo && <div style={{ fontSize: 13, color: '#b3261e', marginTop: 4 }}>Motivo: {doc.motivo}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {doc && <button className="secundario" onClick={() => hacer('ver', () => abrirDocumento(supabase, doc))} disabled={!!trabajando}>Ver</button>}
          {tecnico && doc && doc.estado !== 'validado' && <button className="secundario" onClick={validar} disabled={!!trabajando}>{trabajando === 'validar' ? '...' : 'Validar'}</button>}
          {tecnico && doc && doc.estado !== 'rechazado' && <button className="secundario" onClick={rechazar} disabled={!!trabajando}>Rechazar</button>}
          {tecnico && doc && <button className="secundario" onClick={corregirCaducidad} disabled={!!trabajando}>Caducidad</button>}
          {!subiendo && <button onClick={empezar} disabled={!!trabajando}>{doc ? 'Subir nueva versión' : 'Subir'}</button>}
          {tecnico && doc && <button className="secundario" onClick={verHistorial} disabled={!!trabajando} title="Versiones anteriores">{hist ? 'Ocultar historial' : 'Historial'}</button>}
        </div>
      </div>

      {subiendo && (
        <div style={{ marginTop: 10, padding: 10, background: '#f5f7f9', border: '1px solid #d9dfe3', borderRadius: 8, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ flex: '1 1 240px' }}>Archivo (PDF o imagen, hasta 20 MB)<br />
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setArchivo(e.target.files[0] ?? null)} />
          </label>
          <label>Fecha de caducidad del documento<br />
            <input type="date" value={caduca} onChange={(e) => setCaduca(e.target.value)} />
          </label>
          <button onClick={subir} disabled={!!trabajando}>{trabajando === 'subir' ? 'Subiendo...' : 'Guardar'}</button>
          <button className="secundario" onClick={() => setSubiendo(false)} disabled={!!trabajando}>Cancelar</button>
          <small style={{ flexBasis: '100%', color: '#55616b' }}>
            Pon la fecha de caducidad que figure en el documento. Si no tiene, se propone {tipo.meses_validez ? `a ${tipo.meses_validez} meses` : 'sin caducidad'}.
          </small>
        </div>
      )}
      {error && <p style={{ ...aviso, margin: '8px 0 0' }}>{error}</p>}
      {hist && (
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13 }}>
          {hist.map((h) => (
            <li key={h.id}>
              {fechaCorta(h.subido_en)} · {h.nombre_archivo} · {h.estado}{h.vigente ? ' (vigente)' : ''}{h.caduca_en ? ` · caduca ${fechaCorta(h.caduca_en)}` : ''}{' '}
              <button className="secundario" style={{ fontSize: 12, padding: '1px 6px' }} onClick={() => hacer('ver', () => abrirDocumento(supabase, h))}>Ver</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function CaeDocumentos({ supabase, empresa, tipos, modo, onCambio }) {
  const vig = new Map(empresa.docs.filter((d) => d.vigente).map((d) => [d.tipo, d]))
  const activos = tipos.filter((t) => t.activo)
  const grupo = (titulo, nota, lista) => (
    <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', background: '#f3f6fb' }}>
        <strong style={{ color: '#1f3864' }}>{titulo}</strong>
        <div style={{ fontSize: 13, color: '#55616b' }}>{nota}</div>
      </div>
      {lista.map((t) => <Fila key={t.codigo} supabase={supabase} empresa={empresa} tipo={t} doc={vig.get(t.codigo)} modo={modo} onCambio={onCambio} />)}
    </section>
  )
  const imp = activos.filter((t) => t.imprescindible)
  return (
    <>
      {imp.length > 0 && grupo('Documentos imprescindibles', 'Sin ellos en vigor, la empresa no puede trabajar en los centros.', imp)}
      {grupo('Documentación de la empresa', 'Documentos que la empresa debe tener en vigor para trabajar en los centros del Grupo Neural.', activos.filter((t) => !t.imprescindible))}
    </>
  )
}
