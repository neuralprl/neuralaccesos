// Documentos de la CAE para imprimir o guardar en PDF: información de riesgos y medidas de emergencia para externos
// y plantilla del certificado CAE PRL Neural.
import { documentoHTML, esc, imprimir } from './documentos'
import { htmlTexto, fechaCorta } from './caeLogic'

export function imprimirContenido(c) {
  const cuerpo = `<h1>${esc(c.titulo)}</h1>
<p class="nota">Grupo Neural · Servicio de prevención · Versión ${esc(c.version)} de ${esc(fechaCorta(c.actualizado_en))}</p>
${htmlTexto(c.texto)}`
  imprimir(documentoHTML(c.titulo, cuerpo))
}

const linea = (v) => (v ? esc(v) : '_______________________________________')
export function imprimirCertificado(empresa = {}) {
  const cuerpo = `<h1>Certificado de cumplimiento en prevención de riesgos laborales y coordinación de actividades empresariales</h1>
<p class="nota">Documento CAE PRL Neural. Rellénalo, fírmalo y súbelo a la plataforma.</p>
<h2>Datos de la empresa</h2>
<p><b>Razón social:</b> ${linea(empresa.nombre)}</p>
<p><b>CIF:</b> ${linea(empresa.cif)}</p>
<p><b>Domicilio social:</b> ${linea()}</p>
<p><b>Actividad o servicio que presta:</b> ${linea(empresa.actividad)}</p>
<p><b>Representante legal:</b> ${linea()} &nbsp; <b>Cargo:</b> ${linea()}</p>
<p><b>Teléfono y correo de contacto:</b> ${linea(empresa.email)}</p>
<h2>Declaración</h2>
<p>En cumplimiento del artículo 24 de la Ley 31/1995, de Prevención de Riesgos Laborales, y del Real Decreto 171/2004, de coordinación de actividades empresariales, el representante legal de la empresa declara:</p>
<p><b>Primero. Información recibida y trasladada.</b> Que ha recibido la información de riesgos y las medidas de emergencia de los centros del Grupo Neural para trabajadores de empresas externas, y que la trasladará a todo su personal, propio, autónomo o subcontratado, antes de que empiece a trabajar en los centros.</p>
<p><b>Segundo. Cumplimiento en prevención.</b> Que el personal que acude a los centros:</p>
<ul>
<li>tiene la formación e información en prevención adecuadas a su puesto (arts. 18 y 19 de la Ley 31/1995);</li>
<li>dispone de los equipos de protección individual necesarios, con marcado CE, y sabe usarlos (Real Decreto 773/1997);</li>
<li>tiene ofrecida la vigilancia de la salud y, cuando es obligatoria, certificado de aptitud en vigor (art. 22 de la Ley 31/1995);</li>
<li>tiene las cualificaciones, carnés o autorizaciones que exige su trabajo.</li>
</ul>
<p><b>Tercero. Emergencias.</b> Que ha instruido a su personal en las medidas de emergencia del Grupo Neural para externos.</p>
<p><b>Cuarto. Obligaciones laborales.</b> Que cumple sus obligaciones laborales y de Seguridad Social, y las de subcontratación cuando sean aplicables.</p>
<p><b>Quinto. Comunicación.</b> Que comunicará de inmediato al responsable del centro y al servicio de prevención del Grupo Neural cualquier accidente, incidente o situación de riesgo grave durante los trabajos.</p>
<p style="margin-top:28px">En ____________________, a ____ de ______________ de 20___</p>
<p style="margin-top:56px">Firma y sello del representante legal</p>`
  imprimir(documentoHTML('Certificado CAE PRL Neural', cuerpo))
}
