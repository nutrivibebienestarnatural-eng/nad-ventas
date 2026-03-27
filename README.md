# NAD Argentina · App de Ventas

App web para gestión de ventas, stock, pedidos y envíos de NAD Argentina.

---

## Cómo poner la app en funcionamiento (paso a paso)

### PASO 1 — Crear tu base de datos en Firebase (gratis)

1. Entrá a **https://firebase.google.com** e iniciá sesión con tu cuenta de Google
2. Hacé clic en **"Ir a la consola"** → **"Crear un proyecto"**
3. Poné un nombre (ej: `nad-argentina-ventas`) → seguí los pasos y finalizá
4. En el menú izquierdo, hacé clic en **"Firestore Database"** → **"Crear base de datos"**
   - Elegí **modo de producción** → seleccioná la región `us-central` → listo
5. En el menú izquierdo, hacé clic en **"Configuración del proyecto"** (ícono de engranaje)
6. Bajá hasta la sección **"Tus apps"** → hacé clic en el ícono `</>` (web)
7. Poné un nombre (ej: `ventas-app`) y hacé clic en **"Registrar app"**
8. Firebase te va a mostrar un bloque de código con tu configuración. Copiá estos valores:

```js
apiKey: "...",
authDomain: "...",
projectId: "...",
storageBucket: "...",
messagingSenderId: "...",
appId: "..."
```

9. Abrí el archivo **`app.js`** con el Bloc de Notas
10. Buscá la sección que dice `// 🔧 CONFIGURACIÓN FIREBASE` y reemplazá los valores

---

### PASO 2 — Configurar permisos de Firestore

1. En Firebase, andá a **Firestore Database** → pestaña **"Reglas"**
2. Reemplazá el contenido con esto y hacé clic en **"Publicar"**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ Estas reglas permiten acceso libre. Para producción real, agregá autenticación.

---

### PASO 3 — Subir los archivos a GitHub

1. Entrá a **https://github.com** con tu cuenta
2. Hacé clic en **"+"** → **"New repository"**
3. Nombre: `nad-ventas` → dejalo en **Public** → **"Create repository"**
4. Hacé clic en **"uploading an existing file"**
5. Arrastrá los 3 archivos: `index.html`, `style.css`, `app.js`
6. Hacé clic en **"Commit changes"**

---

### PASO 4 — Publicar la app con Netlify (gratis)

1. Entrá a **https://netlify.com** → **"Sign up"** → elegí **"GitHub"**
2. Hacé clic en **"Add new site"** → **"Import an existing project"** → **"GitHub"**
3. Elegí el repositorio `nad-ventas`
4. Dejá todo como está → hacé clic en **"Deploy site"**
5. En 1 minuto Netlify te da una dirección como `https://nad-ventas-xyz.netlify.app`

¡Listo! Podés entrar desde cualquier celular o computadora con esa dirección.

---

## Estructura de archivos

```
nad-ventas/
├── index.html   → estructura de la app
├── style.css    → estilos visuales
├── app.js       → lógica + conexión a Firebase
└── README.md    → este archivo
```

---

## Funcionalidades incluidas

- ✅ Resumen del día con estadísticas
- ✅ Lista de pedidos con filtros por estado
- ✅ Creación de nuevos pedidos con búsqueda de productos
- ✅ Gestión de stock con alertas de stock bajo
- ✅ Descuento automático de stock al crear pedido
- ✅ Módulo de envíos con tracking
- ✅ Exportación a CSV para Correo Argentino
- ✅ Importación de códigos de seguimiento desde CSV
- ✅ Catálogo completo de 34 productos de NAD Argentina
- ✅ Funciona en celular y computadora
