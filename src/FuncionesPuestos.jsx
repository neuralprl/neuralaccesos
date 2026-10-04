import { useEffect, useMemo, useRef, useState } from "react";
import {
  FUNCIONES_VERSION,
  FUNCIONES_FECHA,
  CATEGORIAS,
  PUESTOS_FUNCIONES,
  ACTIVIDADES_EVALUADAS,
} from "./funcionesContenido";
import { COLOR_VR, ETIQUETA_VR } from "./evalLogic";

// Capítulo de solo lectura. Uso: <FuncionesPuestos />
// Dos vistas: funciones de cada puesto y evaluación de las actividades que realizan.

const fechaLarga = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

const ESTADO = {
  documento: { texto: "Evaluada en el documento", clase: "fun-e-doc" },
  matriz: { texto: "Evaluada con la matriz actual", clase: "fun-e-mat" },
};
const ACT_POR_ID = Object.fromEntries(ACTIVIDADES_EVALUADAS.map((a) => [a.id, a]));
const quitar = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Insignia({ vr }) {
  return (
    <span className="fun-vr" style={{ background: COLOR_VR[vr] }} title={ETIQUETA_VR[vr]}>
      {vr}
    </span>
  );
}

function Condicion({ c }) {
  return (
    <details className="fun-cond">
      <summary>
        <span className="fun-r">{c.r}</span>
        <span className="fun-cond-texto">
          <strong>{c.riesgo}</strong>
          <span>{c.condicion}</span>
        </span>
        <span className="fun-pc">
          P {c.P} · C {c.C}
        </span>
        <Insignia vr={c.VR} />
      </summary>
      <ul className="fun-medidas">
        {c.medidas.map((m, i) => (
          <li key={i}>
            {m.tipo && <span className={`fun-tipo fun-tipo-${m.tipo}`}>{m.tipo === "P" ? "Preventiva" : "Correctiva"}</span>}
            {m.nueva && <span className="fun-tipo fun-tipo-nueva">Medida nueva</span>}
            {m.t}
            {(m.legal || m.id || (m.u != null && c.np > 1)) && (
              <small>
                {m.legal ? ` (${m.legal})` : ""}
                {m.id ? ` · ${m.id}` : ""}
                {m.u != null && c.np > 1 ? ` · usada en ${m.u} de ${c.np} puestos` : ""}
              </small>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

function VistaPuestos({ busca, irActividad, abierto, setAbierto }) {
  const q = quitar(busca.trim());
  const lista = PUESTOS_FUNCIONES.filter((p) => !q || quitar(p.nombre + " " + p.funciones).includes(q));
  return (
    <div>
      {lista.length === 0 && <p className="fun-vacio">Ningún puesto coincide.</p>}
      {lista.map((p) => (
        <details
          key={p.nombre}
          id={`fun-p-${p.nombre}`}
          className="fun-tarjeta"
          open={abierto === p.nombre}
          onToggle={(e) => {
            if (e.target.open && abierto !== p.nombre) setAbierto(p.nombre);
            if (!e.target.open && abierto === p.nombre) setAbierto(null);
          }}
        >
          <summary>
            <span className="fun-nombre">{p.nombre}</span>
            {!p.confirmada && <span className="fun-pend">Pendiente de confirmar</span>}
            <span className="fun-n">{p.actividades.length} {p.actividades.length === 1 ? "actividad" : "actividades"}</span>
          </summary>
          <div className="fun-cuerpo">
            <p className="fun-funciones">{p.funciones}</p>
            <h4>Tareas</h4>
            <ul>
              {p.tareas.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <p>
              <strong>Contacto con usuarios.</strong> {p.contacto}
            </p>
            {p.nota && (
              <p className="fun-nota">
                <strong>Observación.</strong> {p.nota}
              </p>
            )}
            {p.epi && (
              <p>
                <strong>EPI.</strong> {p.epi}
              </p>
            )}
            <h4>Actividades del puesto</h4>
            <div className="fun-chips">
              {p.actividades.map((id) => (
                <button key={id} type="button" className="fun-chip" onClick={() => irActividad(id)}>
                  {ACT_POR_ID[id].nombre}
                </button>
              ))}
            </div>
            {p.ajustes.length > 0 && (
              <>
                <h4>Valoraciones de este puesto distintas de las de la actividad</h4>
                <ul className="fun-ajustes">
                  {p.ajustes.map((x, i) => (
                    <li key={i}>
                      <button type="button" className="fun-enlace" onClick={() => irActividad(x.actividad_id)}>
                        {x.actividad}
                      </button>
                      {" · "}
                      <strong>{x.r}</strong> {x.condicion}:{" "}
                      <span className="fun-vr-mini" style={{ background: COLOR_VR[x.VR] }}>
                        {x.P}·{x.C} = {x.VR}
                      </span>{" "}
                      <small>(en la actividad, {x.base})</small>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {p.propios.length > 0 && (
              <>
                <h4>Riesgos propios del puesto</h4>
                <div className="fun-conds">
                  {p.propios.map((c, i) => (
                    <Condicion key={i} c={c} />
                  ))}
                </div>
              </>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function VistaActividades({ busca, categoria, setCategoria, irPuesto, abierta, setAbierta }) {
  const q = quitar(busca.trim());
  const visibles = ACTIVIDADES_EVALUADAS.filter(
    (a) => (!categoria || a.categoria === categoria) && (!q || quitar(a.nombre + " " + a.tareas).includes(q))
  );
  return (
    <div>
      <label className="fun-filtro">
        Categoría{" "}
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      {visibles.length === 0 && <p className="fun-vacio">Ninguna actividad coincide.</p>}
      {CATEGORIAS.map((cat) => {
        const grupo = visibles.filter((a) => a.categoria === cat);
        if (!grupo.length) return null;
        return (
          <section key={cat}>
            <h3 className="fun-cat">{cat}</h3>
            {grupo.map((a) => (
              <details
                key={a.id}
                id={`fun-a-${a.id}`}
                className="fun-tarjeta"
                open={abierta === a.id}
                onToggle={(e) => {
                  if (e.target.open && abierta !== a.id) setAbierta(a.id);
                  if (!e.target.open && abierta === a.id) setAbierta(null);
                }}
              >
                <summary>
                  <span className="fun-nombre">{a.nombre}</span>
                  <span className={`fun-estado ${ESTADO[a.estado].clase}`}>{ESTADO[a.estado].texto}</span>
                  <span className="fun-n">{a.condiciones.length} {a.condiciones.length === 1 ? "condición" : "condiciones"}</span>
                </summary>
                <div className="fun-cuerpo">
                  <p className="fun-funciones">{a.tareas}</p>
                  {a.nota && (
                    <p className="fun-nota">
                      <strong>Observación.</strong> {a.nota}
                    </p>
                  )}
                  {a.epi && (
                    <p>
                      <strong>EPI a proporcionar.</strong> {a.epi}
                    </p>
                  )}
                  <h4>Puestos que la realizan ({a.puestos.length})</h4>
                  <div className="fun-chips">
                    {a.puestos.map((p) => (
                      <button key={p} type="button" className="fun-chip" onClick={() => irPuesto(p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <h4>Evaluación</h4>
                  <div className="fun-conds">
                    {a.condiciones.map((c, i) => (
                      <Condicion key={i} c={c} />
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </section>
        );
      })}
    </div>
  );
}

export default function FuncionesPuestos({ vistaInicial = "puestos" }) {
  const [vista, setVista] = useState(vistaInicial);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [puestoAbierto, setPuestoAbierto] = useState(null);
  const [actAbierta, setActAbierta] = useState(null);
  const pendiente = useRef(null);

  const nPend = useMemo(() => PUESTOS_FUNCIONES.filter((p) => !p.confirmada).length, []);

  function irActividad(id) {
    pendiente.current = `fun-a-${id}`;
    setBusca("");
    setCategoria("");
    setActAbierta(id);
    setVista("actividades");
  }
  function irPuesto(nombre) {
    pendiente.current = `fun-p-${nombre}`;
    setBusca("");
    setPuestoAbierto(nombre);
    setVista("puestos");
  }
  useEffect(() => {
    if (!pendiente.current) return;
    const el = document.getElementById(pendiente.current);
    pendiente.current = null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [vista, puestoAbierto, actAbierta]);

  return (
    <div className="fun">
      <style>{CSS}</style>
      <header className="fun-cabecera">
        <h2>{vista === "puestos" ? "Funciones de cada puesto" : "Evaluación de actividades"}</h2>
        <p>
          Versión {FUNCIONES_VERSION}, {fechaLarga(FUNCIONES_FECHA)}
        </p>
      </header>

      {nPend > 0 && (
        <p className="fun-aviso" role="note">
          {nPend === 1 ? "Un puesto tiene" : `${nPend} puestos tienen`} una redacción propuesta que falta confirmar.
        </p>
      )}

      <div className="fun-barra">
        <div role="tablist" className="fun-pestanas">
          <button type="button" role="tab" aria-selected={vista === "puestos"} onClick={() => setVista("puestos")}>
            Puestos ({PUESTOS_FUNCIONES.length})
          </button>
          <button type="button" role="tab" aria-selected={vista === "actividades"} onClick={() => setVista("actividades")}>
            Actividades ({ACTIVIDADES_EVALUADAS.length})
          </button>
        </div>
        <input
          type="search"
          className="fun-busca"
          placeholder={vista === "puestos" ? "Buscar un puesto" : "Buscar una actividad"}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar"
        />
      </div>

      {vista === "puestos" ? (
        <VistaPuestos busca={busca} irActividad={irActividad} abierto={puestoAbierto} setAbierto={setPuestoAbierto} />
      ) : (
        <VistaActividades
          busca={busca}
          categoria={categoria}
          setCategoria={setCategoria}
          irPuesto={irPuesto}
          abierta={actAbierta}
          setAbierta={setActAbierta}
        />
      )}
    </div>
  );
}

const CSS = `
.fun{--f-tinta:#1f2a33;--f-suave:#5b6873;--f-linea:#d9dfe3;--f-fondo:#f6f8f9;color:var(--f-tinta);line-height:1.55;font-size:15px;text-align:left;max-width:1000px}
.fun-cabecera{padding-bottom:12px;border-bottom:1px solid var(--f-linea);margin-bottom:14px}
.fun-cabecera h2{margin:0 0 2px;font-size:1.5rem;font-weight:650}
.fun-cabecera p{margin:0;color:var(--f-suave)}
.fun-aviso{background:#f5e9b0;color:#5f4a0c;padding:10px 14px;border-radius:6px;margin:0 0 14px}
.fun-barra{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px}
.fun-pestanas{display:inline-flex;border:1px solid var(--f-linea);border-radius:8px;overflow:hidden}
.fun-pestanas button{font:inherit;padding:7px 16px;border:0;border-radius:0;background:#fff;color:var(--f-tinta);cursor:pointer;box-shadow:none}
.fun-pestanas button[aria-selected="true"]{background:#1f3864;color:#fff;font-weight:650}
.fun-busca{flex:1 1 220px;max-width:340px;padding:7px 10px;border:1px solid var(--f-linea);border-radius:6px;font:inherit}
.fun-filtro{display:block;margin:0 0 10px;font-size:.9rem;color:var(--f-suave)}
.fun-cat{margin:22px 0 8px;font-size:1.05rem;font-weight:650;border-left:5px solid #1f3864;padding-left:10px}
.fun-vacio{color:var(--f-suave)}
.fun-tarjeta{border:1px solid var(--f-linea);border-radius:8px;margin-bottom:8px;background:#fff;scroll-margin-top:12px}
.fun-tarjeta>summary{cursor:pointer;display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;padding:10px 14px;list-style:none}
.fun-tarjeta>summary::-webkit-details-marker{display:none}
.fun-tarjeta>summary::before{content:"▸";color:var(--f-suave)}
.fun-tarjeta[open]>summary::before{content:"▾"}
.fun-nombre{font-weight:650;flex:1 1 220px}
.fun-n{color:var(--f-suave);font-size:.85rem}
.fun-pend,.fun-estado{font-size:.78rem;font-weight:650;border-radius:12px;padding:2px 10px}
.fun-pend{background:#fde9c4;color:#7a4b00}
.fun-e-doc{background:#e3f2fd;color:#0d3c6e}
.fun-e-mat{background:#e8f5e9;color:#1b5e20}
.fun-e-nueva{background:#fde9c4;color:#7a4b00}
.fun-cuerpo{padding:2px 16px 14px;border-top:1px solid var(--f-linea)}
.fun-cuerpo h4{margin:14px 0 6px;font-size:.95rem}
.fun-cuerpo p{margin:8px 0}
.fun-cuerpo ul{margin:0 0 8px;padding-left:20px}
.fun-cuerpo li{margin-bottom:3px}
.fun-funciones{font-weight:500}
.fun-nota{background:var(--f-fondo);border-left:4px solid #b8860b;padding:7px 12px;border-radius:0 6px 6px 0}
.fun-chips{display:flex;flex-wrap:wrap;gap:6px}
.fun-chip{font:inherit;font-size:.85rem;padding:3px 10px;border:1px solid var(--f-linea);border-radius:14px;background:var(--f-fondo);color:var(--f-tinta);cursor:pointer;box-shadow:none}
.fun-chip:hover{background:#e6ecf5}
.fun-conds{display:flex;flex-direction:column;gap:6px}
.fun-ajustes li{margin-bottom:6px}
.fun-enlace{font:inherit;color:#1f3864;background:none;border:0;padding:0;text-decoration:underline;cursor:pointer;box-shadow:none}
.fun-vr-mini{color:#fff;font-weight:700;font-size:.78rem;border-radius:10px;padding:1px 8px}
.fun-cond{border:1px solid var(--f-linea);border-radius:6px;background:#fff}
.fun-cond>summary{cursor:pointer;display:flex;gap:10px;align-items:center;padding:7px 10px;list-style:none}
.fun-cond>summary::-webkit-details-marker{display:none}
.fun-r{font-weight:700;color:var(--f-suave);min-width:34px}
.fun-cond-texto{flex:1;display:flex;flex-direction:column;font-size:.9rem}
.fun-cond-texto span{color:var(--f-suave)}
.fun-pc{font-size:.8rem;color:var(--f-suave);white-space:nowrap}
.fun-vr{color:#fff;font-weight:700;font-size:.8rem;border-radius:12px;padding:2px 10px;min-width:28px;text-align:center}
.fun-medidas{margin:0;padding:8px 14px 10px 30px;border-top:1px solid var(--f-linea);font-size:.9rem}
.fun-medidas li{margin-bottom:5px}
.fun-medidas small{color:var(--f-suave)}
.fun-tipo{display:inline-block;font-size:.72rem;font-weight:700;border-radius:4px;padding:0 6px;margin-right:6px;background:#eceff1;color:#37474f}
.fun-tipo-C{background:#fde9c4;color:#7a4b00}
.fun-tipo-nueva{background:#fdecea;color:#b00020}
`;
