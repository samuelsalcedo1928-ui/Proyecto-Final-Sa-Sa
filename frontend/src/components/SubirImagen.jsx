import { useState, useRef } from "react";
import { rutaImagen } from "../utils/imagen";

// lee el archivo y devuelve la imagen ya cargada
function leerImagen(archivo) {
  return new Promise((listo, fallo) => {
    const lector = new FileReader();
    lector.onerror = () => fallo(new Error("No se pudo leer el archivo."));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => fallo(new Error("Ese archivo no parece una imagen válida."));
      img.onload = () => listo(img);
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

// ventanita para elegir qué parte de la imagen se ve (arrastrar y acercar)
function Recortar({ img, proporcion, guia, ayuda, cancelar, aceptar }) {
  const ancho = Math.min(480, window.innerWidth - 64);
  const alto = ancho / proporcion;

  // la escala "cubrir" llena todo el marco; la "contener" deja ver la imagen entera
  const cubrir = Math.max(ancho / img.width, alto / img.height);
  const contener = Math.min(ancho / img.width, alto / img.height);
  const zoomMin = contener / cubrir;

  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const arrastre = useRef(null);

  // la imagen no puede dejar huecos en el marco (salvo que sea más chica que el marco)
  function limitar(p, z) {
    const w = img.width * cubrir * z;
    const h = img.height * cubrir * z;
    const maxX = Math.max(0, (w - ancho) / 2);
    const maxY = Math.max(0, (h - alto) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, p.x)),
      y: Math.min(maxY, Math.max(-maxY, p.y)),
    };
  }

  function cambiarZoom(valor) {
    const z = Number(valor);
    setZoom(z);
    setPos((p) => limitar(p, z));
  }

  function empezar(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { x: e.clientX, y: e.clientY, pos };
  }

  function mover(e) {
    if (!arrastre.current) return;
    const a = arrastre.current;
    setPos(limitar({ x: a.pos.x + e.clientX - a.x, y: a.pos.y + e.clientY - a.y }, zoom));
  }

  function terminar() {
    arrastre.current = null;
  }

  // dibuja en un canvas solo lo que se ve dentro del marco
  function confirmar() {
    const salidaAncho = 1200;
    const k = salidaAncho / ancho;
    const lienzo = document.createElement("canvas");
    lienzo.width = salidaAncho;
    lienzo.height = Math.round(alto * k);
    const c = lienzo.getContext("2d");
    c.fillStyle = "#fff";
    c.fillRect(0, 0, lienzo.width, lienzo.height);

    const w = img.width * cubrir * zoom;
    const h = img.height * cubrir * zoom;
    c.drawImage(img, (ancho / 2 + pos.x - w / 2) * k, (alto / 2 + pos.y - h / 2) * k, w * k, h * k);
    aceptar(lienzo.toDataURL("image/jpeg", 0.82));
  }

  const w = img.width * cubrir * zoom;
  const h = img.height * cubrir * zoom;

  return (
    <div className="recorte-fondo">
      <div className="recorte">
        <h3>Elige qué parte se ve</h3>
        <p className="nota">Arrastra la imagen para moverla y usa el control para acercar o alejar. Lo que ves dentro del marco es lo que se va a mostrar.</p>

        <div
          className="recorte-marco"
          style={{ width: ancho, height: alto }}
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerCancel={terminar}
        >
          <img
            src={img.src}
            alt="Imagen a recortar"
            draggable={false}
            style={{ width: w, height: h, left: ancho / 2 + pos.x - w / 2, top: alto / 2 + pos.y - h / 2 }}
          />
          {guia && <div className="recorte-guia" style={{ width: `${guia * 100}%` }} />}
        </div>

        <label className="recorte-zoom">Acercar
          <input type="range" min={zoomMin} max={4} step="0.01" value={zoom} onChange={(e) => cambiarZoom(e.target.value)} />
        </label>
        {ayuda && <p className="nota">{ayuda}</p>}

        <div className="recorte-botones">
          <button type="button" className="boton boton-borde" onClick={() => { setZoom(zoomMin); setPos({ x: 0, y: 0 }); }}>Ver imagen completa</button>
          <button type="button" className="boton boton-borde" onClick={() => { setZoom(1); setPos({ x: 0, y: 0 }); }}>Llenar el marco</button>
        </div>
        <div className="recorte-botones">
          <button type="button" className="boton boton-borde" onClick={cancelar}>Cancelar</button>
          <button type="button" className="boton" onClick={confirmar}>Usar esta imagen</button>
        </div>
      </div>
    </div>
  );
}

// zona para arrastrar una imagen o buscarla en el computador (también deja pegar un link)
// proporcion = ancho / alto de como se muestra la imagen en la página (4/3 en productos, 21/9 en el banner)
export default function SubirImagen({ valor, cambiar, llamar, alError, proporcion = 4 / 3, guia, ayuda }) {
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [aviso, setAviso] = useState("");
  const [pendiente, setPendiente] = useState(null);
  const entrada = useRef(null);

  // paso 1: se elige el archivo y se abre la ventana para recortar
  async function elegir(archivo) {
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      return setAviso("Elige un archivo de imagen (JPG, PNG o WEBP).");
    }
    setAviso("");
    try {
      setPendiente(await leerImagen(archivo));
    } catch (error) {
      setAviso(error.message);
    }
  }

  // paso 2: ya recortada se sube al servidor
  async function subir(dataUrl) {
    setPendiente(null);
    setSubiendo(true);
    try {
      const respuesta = await llamar("/api/imagenes", { method: "POST", body: { imagen: dataUrl } });
      cambiar(respuesta.url);
    } catch (error) {
      if (error.estado === 401) alError(error);
      else setAviso(error.message);
    } finally {
      setSubiendo(false);
    }
  }

  function soltar(e) {
    e.preventDefault();
    setArrastrando(false);
    elegir(e.dataTransfer.files[0]);
  }

  const foto = rutaImagen(valor);

  return (
    <div className="subir-imagen">
      <span className="subir-titulo">Imagen</span>
      <div
        className={arrastrando ? "zona-imagen arrastrando" : "zona-imagen"}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={soltar}
      >
        {foto ? <img src={foto} alt="Vista previa" /> : <span className="zona-icono">🖼️</span>}
        <div>
          <p>{subiendo ? "Subiendo imagen…" : "Arrastra una imagen aquí"}</p>
          <button type="button" className="boton boton-borde" onClick={() => entrada.current.click()} disabled={subiendo}>
            Buscar en mis archivos
          </button>{" "}
          {valor && (
            <button type="button" className="enlace peligro" onClick={() => cambiar("")}>Quitar imagen</button>
          )}
        </div>
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { elegir(e.target.files[0]); e.target.value = ""; }}
        />
      </div>
      {aviso && <p className="aviso">{aviso}</p>}
      {pendiente && (
        <Recortar img={pendiente} proporcion={proporcion} guia={guia} ayuda={ayuda} cancelar={() => setPendiente(null)} aceptar={subir} />
      )}

      <details>
        <summary>O pega un link de internet</summary>
        <input
          value={valor && valor.startsWith("http") ? valor : ""}
          onChange={(e) => cambiar(e.target.value)}
          placeholder="https://..."
        />
      </details>
    </div>
  );
}
