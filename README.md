# Abasto y Variedades Nueva Vida

Página web de una tienda mayorista de barrio en El Pozón, Cartagena de Indias.
Proyecto final de **Mi emprendimiento digital** (Jóvenes creaTIvos, ruta básica).

La idea: el cliente arma su pedido en el catálogo, entra con su cuenta, pulsa **Pedir por WhatsApp** y se
crea un **ticket** (por ejemplo `NV-0001`) y se abre una conversación con la tienda con el mensaje ya escrito
(productos, cantidades y total estimado). Una persona de la tienda confirma precios y coordina el domicilio.

## Qué tiene

- Inicio estilo supermercado en línea: banners que rotan, categorías de colores y filas de ofertas, productos próximos a vencer, más vendidos y recomendados.
- Catálogo con buscador, filtros y precio por presentación (paca, bulto...) o por unidad suelta.
- Contacto con mapa, horarios y medios de pago.
- Cuentas de clientes (correo y contraseña): el catálogo y las ofertas se ven sin cuenta, pero para pedir hay que entrar.
- Pedido (carrito) que se guarda en el navegador y se envía por WhatsApp. Cada pedido recibe un número de ticket aunque no se termine el mensaje.
- «Mis pedidos»: historial del cliente con fecha, productos, total, estado, botón para cancelar (mientras la tienda no lo confirme) y para reclamar dentro del plazo (24 horas por defecto). El reclamo queda registrado en la página y sigue por WhatsApp.
- El carrito de un cliente se guarda en su cuenta, así lo ve desde cualquier celular o computador.
- Sobre nosotros, política de privacidad, términos y reclamos, con pie de página en columnas.
- Animaciones suaves: elementos que aparecen al bajar, franja que corre, zoom lento del banner y tarjetas que se levantan (se apagan si el sistema pide menos movimiento).
- Ayuda con IA (Gemini) en el catálogo: el cliente cuenta qué necesita y se le sugieren productos reales. Se apoya en las **etiquetas** (#snack, #merienda…) que el admin le pone a cada producto. Si Gemini falla, se usa una búsqueda básica con las mismas etiquetas.
- Categorías (catálogos) que crea el admin, con dibujito y foto opcional.
- «Sobre nosotros» editable desde el panel (textos, fotos, equipo).
- Menú «Mi cuenta» (pedidos, modo oscuro, cambiar de cuenta, cerrar sesión, entrar como administrador), página de gracias con el ticket, página 404, títulos por página y vista previa al compartir (Open Graph).
- Contador de visitas opcional con GoatCounter (sin cookies).
- Formulario de contacto que guarda el mensaje en la base de datos (y avisa por correo si se configura Resend).
- Con la sesión de administrador el menú cambia (sin carrito ni categorías) y aparece una campana de notificaciones: pedidos nuevos, cancelaciones, clientes nuevos, poco stock, mensajes y reclamos. Cada una lleva a su pestaña.
- Fotos de productos y banners: se arrastran o se buscan en el computador, se achican en el navegador y se guardan en la base de datos.
- Las imágenes se recortan en el navegador (se elige qué parte se ve) antes de subirlas.
- Un solo tipo de sesión a la vez: al entrar como administrador se cierra la de cliente, y salir pide confirmación.
- Panel de administración con login: resumen con gráficos, pedidos (cambiar estado), clientes (bloquear, contraseña temporal), productos (precios, ofertas con fecha, stock, ocultar rápido), banners, ajustes de la tienda (horarios, pagos, pedido mínimo, domicilio, plazo de reclamo), mensajes y cambio de contraseña.
- Pedido mínimo configurable y animación al cambiar de sección.
- Modo oscuro, diseño para celular y botón flotante de WhatsApp.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | React 18 + Vite, react-router-dom (HashRouter) |
| Backend | Node.js + Express |
| Base de datos | MongoDB Atlas (con Mongoose) |
| IA | API gratuita de Gemini (Google AI Studio) |
| Publicación | GitHub Pages (frontend) y Render (backend) |

## Estructura

```
├── frontend/            página en React
│   ├── public/img/      fotos de los productos
│   └── src/
│       ├── components/  Header, Footer, Carrito, AyudaCompra, Aparecer, Marquesina...
│       ├── pages/       Inicio, Catalogo, Contacto, Sobre, Legal, Cuenta, MisPedidos, AdminLogin, AdminPanel
│       │   └── admin/   Resumen, Pedidos, Clientes, Productos, Banners, Ajustes, Mensajes, Seguridad
│       └── utils/       api.js, formato.js, imagen.js
├── backend/             servidor y API
│   ├── index.js
│   ├── scripts/         crearAdmin.js, sembrar.js
│   └── src/             config, models, middlewares, controllers, routes, services
└── .github/workflows/   despliegue automático a GitHub Pages
```

## Cómo correrlo en tu computador

Necesitas Node 20 o más y una base de datos en MongoDB Atlas.

```bash
# 1. backend
cd backend
npm install
cp .env.example .env      # en Windows: copy .env.example .env  (y llena los valores)
npm run sembrar           # productos de ejemplo
npm run admin             # crea el administrador con ADMIN_EMAIL y ADMIN_PASSWORD
npm run productos         # carga los productos reales con fotos y precios de referencia (-- --quitar-ejemplos borra los de ejemplo)
npm run modelos           # (si la ayuda con IA falla) lista los modelos de Gemini disponibles
npm run dev               # http://localhost:3000

# 2. frontend (otra terminal)
cd frontend
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

## Variables de entorno

Backend (`backend/.env`):

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto del servidor |
| `MONGO_URI` | Conexión a MongoDB Atlas |
| `JWT_SECRET` | Clave para firmar el login del admin |
| `CORS_ORIGIN` | Páginas que pueden usar la API (separadas por coma) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Ayuda con IA (sin clave, se usa la búsqueda básica) |
| `GEMINI_FALLBACK_MODEL` | Modelo de respaldo si el principal falla (opcional) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Solo para `npm run admin` |
| `RESEND_API_KEY` / `CORREO_AVISOS` | Aviso por correo (opcional) |

Frontend (`frontend/.env`): `VITE_API_URL` (dirección del backend), `VITE_WHATSAPP` (número con indicativo) y, opcional, `VITE_GOATCOUNTER` (código de tu cuenta en goatcounter.com).

## API

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| GET | `/api/productos` | público | Lista los productos disponibles |
| GET | `/api/productos?todos=1` | admin | Lista todos, incluso ocultos |
| POST / PUT / DELETE | `/api/productos` y `/api/productos/:id` | admin | Crea, edita, elimina |
| GET | `/api/banners` | público | Banners activos del inicio |
| POST / PUT / DELETE | `/api/banners` y `/api/banners/:id` | admin | Crea, edita, elimina |
| GET | `/api/categorias` | público | Categorías visibles (con `?todas=1` el admin ve todas) |
| POST / PUT / DELETE | `/api/categorias` y `/api/categorias/:id` | admin | Crea, edita, elimina (no se borra si tiene productos) |
| PUT | `/api/config/sobre` | admin | Cambia los textos y fotos de «Sobre nosotros» |
| GET | `/api/config` | público | Horarios, pagos, pedido mínimo, domicilio |
| PUT | `/api/config` | admin | Cambia los ajustes de la tienda |
| POST | `/api/auth/login` | público (5 intentos / 15 min) | Devuelve un token de admin |
| GET | `/api/auth/me` | admin | Comprueba la sesión |
| POST | `/api/auth/password` | admin | Cambia la contraseña del admin |
| POST | `/api/clientes/registro` y `/api/clientes/login` | público (límites) | Crea cuenta / entra |
| GET / PUT | `/api/clientes/yo` | cliente | Ver y cambiar sus datos |
| POST | `/api/clientes/password` | cliente | Cambia su contraseña |
| GET | `/api/clientes` | admin | Lista de clientes |
| PATCH | `/api/clientes/:id/bloqueo` | admin | Bloquea o desbloquea |
| POST | `/api/clientes/:id/reiniciar-password` | admin | Crea una contraseña temporal |
| GET / PUT | `/api/clientes/carrito` | cliente | Trae y guarda el carrito del cliente |
| PATCH | `/api/pedidos/:id/cancelar` | cliente | Cancela un pedido que sigue en estado nuevo |
| POST | `/api/pedidos/:id/reclamo` | cliente | Registra un reclamo dentro del plazo |
| GET | `/api/notificaciones` | admin | Avisos del panel (y `POST /leer-todas`, `PATCH /:id/leida`) |
| POST | `/api/imagenes` | admin | Sube una foto (ya reducida) |
| GET | `/api/imagenes/:id` | público | Muestra una foto subida |
| POST | `/api/pedidos` | cliente | Crea el pedido y su ticket (precios recalculados en el servidor) |
| GET | `/api/pedidos/mios` | cliente | Historial del cliente |
| GET | `/api/pedidos` | admin | Lista de pedidos (`?estado=` o `?ticket=`) |
| PATCH | `/api/pedidos/:id/estado` | admin | Cambia el estado y mueve el stock |
| GET | `/api/resumen` | admin | Números y gráficos del panel |
| POST | `/api/contacto` | público (5 / hora) | Guarda un mensaje |
| GET / PATCH / DELETE | `/api/contacto`, `/api/contacto/:id` | admin | Ver, marcar leído, eliminar |
| POST | `/api/ayuda` | público (30 / 10 min) | Sugiere productos según lo que escribe el cliente |

## Decisiones técnicas

- **Backend aparte:** GitHub Pages solo sirve páginas estáticas, así que el servidor va en Render y la base de datos en Atlas.
- **Clave de Gemini en el backend:** si estuviera en el frontend, cualquiera podría verla y usarla.
- **Contraseñas encriptadas** con bcrypt y sesión con token (JWT): 2 horas para el admin y 7 días para los clientes. El token lleva un `rol`, así que uno no sirve en las rutas del otro.
- **Precios del pedido calculados en el servidor** con los de la base de datos; lo que mande el navegador no cuenta.
- **Ticket único** con un contador atómico en la base de datos. El pedido se guarda antes de abrir WhatsApp.
- **Stock:** se descuenta cuando el admin confirma o entrega el pedido y se devuelve si lo cancela. Los clientes solo ven si el producto está agotado, no las cantidades.
- **Contra el spam:** límites de peticiones, campo trampa (`sitioWeb`) en el formulario y validación en el servidor.
- **HashRouter:** GitHub Pages no sabe de rutas internas; con `#` el recargar la página no da error 404.
- **Total estimado:** los precios son de referencia; la tienda confirma precios y domicilio por WhatsApp.
- **Render gratis se duerme:** la primera petición puede tardar cerca de un minuto, y la página lo avisa.

## Publicación

1. **MongoDB Atlas:** crea un cluster gratis, un usuario y permite acceso desde cualquier IP (`0.0.0.0/0`). Copia la cadena de conexión.
2. **Gemini:** crea una clave en https://aistudio.google.com/apikey.
3. **Render:** New > Web Service, conecta este repositorio, *Root Directory* `backend`, *Build* `npm install`, *Start* `npm start`. Agrega las variables del backend. En `CORS_ORIGIN` pon la dirección de GitHub Pages (sin `/` al final).
4. **Crear el admin:** con el `.env` local apuntando a Atlas, corre `npm run admin` (y `npm run sembrar` si quieres datos de ejemplo).
5. **GitHub Pages:** en el repositorio, Settings > Pages > *Source: GitHub Actions*. Luego Settings > Secrets and variables > Actions > Variables, y crea `VITE_API_URL` (dirección de Render), `VITE_WHATSAPP` y, si usas GoatCounter, `VITE_GOATCOUNTER`.
6. Haz push a `main`: el workflow compila y publica solo.

Si cambias el nombre del repositorio, actualiza `base` en `frontend/vite.config.js`.

## Páginas legales

Los textos de privacidad, términos y reclamos están en `frontend/src/contenido.js`. Son un borrador general:
antes de usar la tienda en serio conviene revisarlos con el dueño del negocio (y con un abogado si crece).
El NIT y las redes sociales se agregan en `frontend/src/config.js` y solo se muestran si tienen valor.
Fotos del equipo: `frontend/public/img/equipo/pedro.jpg`, `equipo1.jpg`, `equipo2.jpg`, `equipo3.jpg`.

## Autor

Samuel Salcedo — Jóvenes creaTIvos, 2026.
