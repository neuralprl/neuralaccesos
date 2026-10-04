import { useState } from "react";
import {
  METODOLOGIA_VERSION,
  METODOLOGIA_FECHA,
  SECCIONES,
  FUENTES,
  MATRIZ,
  NIVELES,
  CONSECUENCIAS,
  PROBABILIDADES,
  MATRIZ_PAC,
  NIVELES_DEFICIENCIA,
  PRIORIDADES_PAC,
} from "./metodologiaContenido";

// Pestaña de solo lectura. Uso en la pantalla de evaluación:
//   <MetodologiaTab versionEvaluacion={evaluacion.metodologia_version} />

const fechaLarga = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const NIVEL_POR_CODIGO = Object.fromEntries(NIVELES.map((n) => [n.codigo, n]));
const PLAZO_PAC = Object.fromEntries(PRIORIDADES_PAC.map((p) => [p.nombre, p.plazo]));

function Tabla({ fuente, columnas }) {
  const filas = FUENTES[fuente] || [];
  return (
    <div className="met-tabla-wrap">
      <table className="met-tabla">
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c} scope="col">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i}>
              {fila.map((celda, j) =>
                j === 0 ? (
                  <th key={j} scope="row">{celda}</th>
                ) : (
                  <td key={j}>{celda}</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrizRiesgo() {
  const [sel, setSel] = useState({ p: "M", c: "D" });
  const nivel = NIVEL_POR_CODIGO[MATRIZ[sel.p][sel.c]];
  return (
    <div className="met-matriz">
      <div className="met-tabla-wrap">
        <table className="met-grid" aria-label="Matriz de probabilidad por consecuencias">
          <thead>
            <tr>
              <td />
              {CONSECUENCIAS.map((c) => (
                <th key={c.codigo} scope="col">{c.nombre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...PROBABILIDADES].reverse().map((p) => (
              <tr key={p.codigo}>
                <th scope="row">Probabilidad {p.nombre.toLowerCase()}</th>
                {CONSECUENCIAS.map((c) => {
                  const cod = MATRIZ[p.codigo][c.codigo];
                  const activo = sel.p === p.codigo && sel.c === c.codigo;
                  return (
                    <td key={c.codigo}>
                      <button
                        type="button"
                        className={`met-celda met-n-${cod}${activo ? " met-activa" : ""}`}
                        aria-pressed={activo}
                        onClick={() => setSel({ p: p.codigo, c: c.codigo })}
                      >
                        {NIVEL_POR_CODIGO[cod].nombre}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`met-detalle met-borde-${nivel.codigo}`} aria-live="polite">
        <p className="met-detalle-titulo">
          {nivel.nombre} ({nivel.codigo}): plazo {nivel.plazo.toLowerCase()}
        </p>
        <p>{nivel.actuacion}</p>
      </div>
      <p className="met-ayuda">Pulsa una casilla para ver cómo se actúa en ese nivel.</p>
    </div>
  );
}

function MatrizPac() {
  return (
    <div className="met-tabla-wrap">
      <table className="met-grid" aria-label="Prioridad de las incidencias del PAC">
        <thead>
          <tr>
            <td />
            {CONSECUENCIAS.map((c) => (
              <th key={c.codigo} scope="col">{c.nombre}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...NIVELES_DEFICIENCIA].reverse().map((d) => (
            <tr key={d.codigo}>
              <th scope="row">{d.nombre}</th>
              {CONSECUENCIAS.map((c) => {
                const pr = MATRIZ_PAC[d.codigo][c.codigo];
                return (
                  <td key={c.codigo}>
                    <div className={`met-celda met-pac-${pr}`}>
                      {pr}
                      <span>{PLAZO_PAC[pr]}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bloque({ b }) {
  switch (b.tipo) {
    case "p":
      return <p>{b.texto}</p>;
    case "subtitulo":
      return <h3>{b.texto}</h3>;
    case "lista":
      return (
        <ul>
          {b.items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      );
    case "pasos":
      return (
        <ol className="met-pasos">
          {b.items.map((s, i) => (
            <li key={i}>
              <strong>{s.titulo}.</strong> {s.texto}
            </li>
          ))}
        </ol>
      );
    case "tabla":
      return <Tabla fuente={b.fuente} columnas={b.columnas} />;
    case "matriz":
      return <MatrizRiesgo />;
    case "matrizPac":
      return <MatrizPac />;
    default:
      return null;
  }
}

export default function MetodologiaTab({ versionEvaluacion, onBiblioteca }) {
  const distinta = versionEvaluacion && versionEvaluacion !== METODOLOGIA_VERSION;
  return (
    <div className="met">
      <style>{CSS}</style>

      <header className="met-cabecera">
        <h2>Metodología del Sistema</h2>
        <p>
          Versión {METODOLOGIA_VERSION}, vigente desde el {fechaLarga(METODOLOGIA_FECHA)}
        </p>
        <button type="button" className="met-imprimir" onClick={() => window.print()}>
          Imprimir metodología
        </button>
        {onBiblioteca && (
          <button type="button" className="met-imprimir" onClick={onBiblioteca} style={{ marginLeft: 8 }}>
            Biblioteca de referencia (guías INSST, NTP, UNE)
          </button>
        )}
      </header>

      {distinta && (
        <p className="met-aviso" role="note">
          Esta evaluación se realizó con la versión {versionEvaluacion} de la metodología.
        </p>
      )}

      <div className="met-cuerpo">
        <nav className="met-indice" aria-label="Índice de la metodología">
          <ol>
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a href={`#met-${s.id}`}>{s.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="met-texto">
          {SECCIONES.map((s, i) => (
            <section key={s.id} id={`met-${s.id}`}>
              <h2>
                <span className="met-num">{i + 1}</span>
                {s.titulo}
              </h2>
              {s.bloques.map((b, j) => (
                <Bloque key={j} b={b} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

// Colores de nivel sobreescribibles desde la app con variables CSS
const CSS = `
.met{
  --met-tinta:#1f2a33; --met-suave:#5b6873; --met-linea:#d9dfe3; --met-fondo:#f6f8f9;
  --met-tr:#dcefd8; --met-tr-t:#24521f;
  --met-to:#f5e9b0; --met-to-t:#5f4a0c;
  --met-mo:#f6cfa6; --met-mo-t:#6e370b;
  --met-im:#eba198; --met-im-t:#5e1510;
  --met-in:#b8322a; --met-in-t:#ffffff;
  color:var(--met-tinta); line-height:1.6; font-size:15px;
}
.met-cabecera{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;
  padding-bottom:16px;border-bottom:1px solid var(--met-linea);margin-bottom:24px}
.met-cabecera h2{margin:0;font-size:1.5rem;font-weight:650;flex-basis:100%}
.met-cabecera p{margin:0;color:var(--met-suave)}
.met-imprimir{margin-left:auto;font:inherit;font-size:.9rem;padding:6px 14px;
  border:1px solid var(--met-linea);border-radius:6px;background:#fff;cursor:pointer}
.met-imprimir:hover{background:var(--met-fondo)}
.met-aviso{background:var(--met-to);color:var(--met-to-t);padding:10px 14px;border-radius:6px}

.met-cuerpo{display:grid;grid-template-columns:230px minmax(0,1fr);gap:40px;align-items:start}
.met-indice{position:sticky;top:calc(var(--alto-cabecera, 0px) + 16px);font-size:.9rem}
.met-indice ol{list-style:none;margin:0;padding:0;counter-reset:i}
.met-indice li{counter-increment:i}
.met-indice a{display:block;padding:5px 8px;border-radius:4px;color:var(--met-suave);text-decoration:none}
.met-indice a::before{content:counter(i) ". ";color:var(--met-suave);font-weight:600}
.met-indice a:hover{background:var(--met-fondo);color:var(--met-tinta)}

.met-texto{max-width:78ch}
.met-texto section{scroll-margin-top:16px;margin-bottom:40px}
.met-texto h2{font-size:1.2rem;font-weight:650;margin:0 0 12px;display:flex;gap:10px;align-items:baseline}
.met-num{color:var(--met-suave);font-weight:500;font-variant-numeric:tabular-nums}
.met-texto h3{font-size:1rem;font-weight:650;margin:24px 0 8px}
.met-texto p{margin:0 0 12px}
.met-texto ul{margin:0 0 12px;padding-left:20px}
.met-texto li{margin-bottom:4px}
.met-pasos{padding-left:22px}
.met-pasos li{margin-bottom:10px}

.met-tabla-wrap{overflow-x:auto;margin:8px 0 16px}
.met-tabla{border-collapse:collapse;width:100%;font-size:.9rem}
.met-tabla th,.met-tabla td{border-bottom:1px solid var(--met-linea);padding:8px 10px;text-align:left;vertical-align:top}
.met-tabla thead th{color:var(--met-suave);font-weight:600;border-bottom:2px solid var(--met-linea)}
.met-tabla tbody th{font-weight:600;white-space:nowrap}

.met-grid{border-collapse:separate;border-spacing:4px;font-size:.88rem;min-width:520px}
.met-grid th{font-weight:600;color:var(--met-suave);text-align:center;padding:4px}
.met-grid tbody th{text-align:left;white-space:nowrap}
.met-grid td{padding:0;width:28%}
.met-celda{box-sizing:border-box;display:block;width:100%;padding:14px 8px;border:2px solid transparent;border-radius:6px;
  font:inherit;font-weight:650;text-align:center}
button.met-celda{cursor:pointer}
.met-celda span{display:block;font-weight:400;font-size:.78rem;margin-top:2px}
.met-celda:focus-visible{outline:3px solid var(--met-tinta);outline-offset:2px}
.met-activa{border-color:var(--met-tinta)}
.met-n-T,.met-pac-Baja{background:var(--met-tr);color:var(--met-tr-t)}
.met-n-TO,.met-pac-Media{background:var(--met-to);color:var(--met-to-t)}
.met-n-MO{background:var(--met-mo);color:var(--met-mo-t)}
.met-n-IM,.met-pac-Alta{background:var(--met-im);color:var(--met-im-t)}
.met-n-IN,.met-pac-Inmediata{background:var(--met-in);color:var(--met-in-t)}

.met-detalle{border-left:5px solid;padding:10px 14px;background:var(--met-fondo);border-radius:0 6px 6px 0;margin-top:8px}
.met-detalle p{margin:0}
.met-detalle-titulo{font-weight:650;margin-bottom:4px!important}
.met-borde-T{border-color:var(--met-tr-t)} .met-borde-TO{border-color:#c9a51c}
.met-borde-MO{border-color:#d9822b} .met-borde-IM{border-color:#c4483c} .met-borde-IN{border-color:var(--met-in)}
.met-ayuda{font-size:.82rem;color:var(--met-suave);margin-top:6px!important}

@media (max-width:820px){
  .met-cuerpo{grid-template-columns:1fr;gap:16px}
  .met-indice{position:static;border-bottom:1px solid var(--met-linea);padding-bottom:12px}
}
@media print{
  .met-indice,.met-imprimir,.met-ayuda{display:none}
  .met-cuerpo{display:block}
  .met-texto{max-width:none}
  .met-texto section{break-inside:avoid-page}
  .met-celda,.met-detalle{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`;
