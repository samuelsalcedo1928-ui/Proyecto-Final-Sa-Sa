// Textos de las páginas legales. Son un borrador general: revísalos con el dueño del negocio
// y, si la tienda crece, con un abogado. Aquí se cambian sin tocar el resto del código.

export const FECHA_LEGAL = "noviembre de 2026";

export const LEGAL = {
  privacidad: {
    titulo: "Política de privacidad",
    intro:
      "En Abasto y Variedades Nueva Vida cuidamos tus datos. Esta política explica qué información guardamos cuando usas la página, para qué la usamos y cómo puedes pedir que la corrijamos o la borremos (Ley 1581 de 2012 de Colombia).",
    secciones: [
      {
        t: "Quién es el responsable",
        p: [
          "El responsable de los datos es Abasto y Variedades Nueva Vida, ubicado en {direccion}. Puedes escribirnos al correo {correo} o por WhatsApp al {telefono}.",
        ],
      },
      {
        t: "Qué datos guardamos",
        p: [
          "Al crear tu cuenta: tu correo electrónico, tu contraseña (guardada cifrada, nadie puede leerla) y, si quieres, tu nombre.",
          "Al hacer un pedido: los productos, las cantidades, el total, la fecha y el número de ticket.",
          "Si nos escribes por el formulario de contacto: tu nombre, correo, teléfono (si lo pones) y tu mensaje.",
          "Si usas la ayuda para elegir productos del catálogo: el texto que escribes (por ejemplo «algo para limpiar el piso»).",
          "No te pedimos datos sensibles ni bancarios. Tampoco los escribas en la ayuda ni en los mensajes.",
          "En tu navegador se guarda tu sesión, tu carrito y si prefieres el modo oscuro. Son datos técnicos para que la página funcione; no usamos cookies de publicidad.",
        ],
      },
      {
        t: "Para qué los usamos",
        p: [
          "Para que puedas hacer pedidos y ver tu historial, para coordinar la entrega de tus pedidos por WhatsApp, para responder tus mensajes y reclamos y para mejorar el servicio. No vendemos tus datos ni los usamos para publicidad de otras empresas.",
        ],
      },
      {
        t: "Con quién se comparten",
        p: [
          "Usamos servicios de terceros para que la página funcione: el alojamiento del servidor, la base de datos en la nube y, para la ayuda de elegir productos, Google (Gemini), que recibe el texto que escribes para sugerirte productos; por eso no escribas datos personales ahí. Si está activado, usamos GoatCounter para contar visitas: no usa cookies ni guarda datos personales. Al pedir por WhatsApp, el mensaje pasa por WhatsApp. Solo compartimos lo necesario para ese servicio.",
        ],
      },
      {
        t: "Tus derechos",
        p: [
          "Puedes conocer qué datos tuyos tenemos, actualizarlos, corregirlos, pedir que los eliminemos o retirar tu autorización cuando quieras. Para hacerlo escríbenos por WhatsApp o al correo. Respondemos las consultas en máximo 10 días hábiles y los reclamos sobre tus datos en máximo 15 días hábiles.",
          "Al crear tu cuenta marcas que aceptas esta política; guardamos la fecha en que lo hiciste.",
        ],
      },
      {
        t: "Cuánto tiempo los guardamos",
        p: [
          "Guardamos tu cuenta y tus pedidos mientras la cuenta esté activa o sea necesario para atender reclamos. Si pides que los borremos, lo hacemos salvo lo que la ley nos obligue a conservar.",
        ],
      },
      {
        t: "Cambios",
        p: ["Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha."],
      },
    ],
  },

  terminos: {
    titulo: "Términos y condiciones",
    intro:
      "Al usar esta página aceptas estas condiciones. Son sencillas: la página sirve para conocer los productos y enviar pedidos; la entrega se coordina después por WhatsApp.",
    secciones: [
      {
        t: "Sobre la página",
        p: [
          "Abasto y Variedades Nueva Vida es una tienda que vende al por mayor (bultos, pacas y cajas) y también algunas unidades sueltas. Esta página muestra el catálogo y permite enviar pedidos.",
        ],
      },
      {
        t: "Cuenta de cliente",
        p: [
          "Cualquier persona puede registrarse con un correo y una contraseña. Eres responsable de guardar tu contraseña y de lo que se haga con tu cuenta. La tienda puede bloquear cuentas que se usen de mala forma. Para ver el catálogo y las ofertas no necesitas cuenta; para enviar un pedido sí.",
        ],
      },
      {
        t: "Precios y pedidos",
        p: [
          "Los precios son los publicados en la página al momento de hacer el pedido. Pueden cambiar con el tiempo, pero cada pedido guarda los precios que tenía cuando se envió. Por WhatsApp solo se coordina el lugar, la fecha y la hora de la entrega, según la disponibilidad de ambas partes.",
          "Cada pedido recibe un número de ticket (por ejemplo NV-0001) aunque no termines el mensaje de WhatsApp. Ese número sirve para cualquier consulta o reclamo.",
          "Hay un pedido mínimo, que puede cambiar, y los productos agotados no se pueden pedir.",
          "Puedes cancelar un pedido desde «Mis pedidos» mientras la tienda no lo haya confirmado.",
        ],
      },
      {
        t: "Domicilio y pagos",
        p: [
          "El domicilio, las zonas de entrega y los medios de pago aceptados se muestran en la página y se acuerdan por WhatsApp al coordinar la entrega.",
        ],
      },
      {
        t: "Reclamos",
        p: [
          "Los reclamos se hacen por WhatsApp como explica la página de Reclamos. El plazo de 24 horas es una política de la tienda.",
          "Si compras como consumidor final, conservas los derechos que te da la Ley 1480 de 2011, como la garantía legal y, cuando aplique a ventas a distancia, el derecho de retracto.",
        ],
      },
      {
        t: "Uso adecuado",
        p: [
          "No se puede usar la página para hacer pedidos falsos, intentar entrar a lo que no te corresponde o enviar spam. Podemos bloquear el acceso si ocurre.",
        ],
      },
      {
        t: "Responsabilidad",
        p: [
          "Hacemos lo posible por mantener la información al día, pero la página puede tener errores o estar fuera de servicio por momentos. Esto no afecta los derechos que la ley le da a los consumidores.",
        ],
      },
      {
        t: "Ley aplicable",
        p: ["Estas condiciones se rigen por las leyes de Colombia."],
      },
    ],
  },

  reclamos: {
    titulo: "Reclamos y garantías",
    intro:
      "Si algo salió mal con tu pedido, queremos saberlo. Todos los reclamos se atienden por WhatsApp.",
    secciones: [
      {
        t: "Cómo reclamar",
        p: [
          "1. Entra a «Mis pedidos» y busca el pedido. Verás el número de ticket y el botón «Hacer un reclamo».",
          "2. Se abre WhatsApp con un mensaje que ya trae el número de ticket. Cuéntanos qué pasó y, si puedes, envía una foto.",
          "3. Una persona de la tienda te responde por el mismo chat.",
        ],
      },
      {
        t: "Plazo",
        p: [
          "Tienes {plazo} horas desde que hiciste el pedido para contactarnos por WhatsApp con tu reclamo. Cada pedido en «Mis pedidos» muestra hasta qué hora puedes reclamar.",
        ],
      },
      {
        t: "Garantías",
        p: [
          "La tienda no ofrece garantías adicionales por defecto, pero cada caso se revisa por WhatsApp. Esto no limita los derechos que la ley colombiana le da al consumidor (Ley 1480 de 2011), como la garantía legal de los productos.",
        ],
      },
      {
        t: "Quejas ante las autoridades",
        p: [
          "Si no quedas conforme con nuestra respuesta, puedes acudir a la Superintendencia de Industria y Comercio (SIC), que es la autoridad de protección al consumidor en Colombia.",
        ],
      },
    ],
  },
};
