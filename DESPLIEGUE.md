# Guía de despliegue — Glow & Glam

Tu proyecto tiene dos partes que van en servicios distintos:

- **Frontend** (React + Vite) → **Vercel**
- **Backend** (Spring Boot 3, Java 17) + **MySQL** → **Railway** (Vercel no corre Java)

El frontend habla con el backend a través de `/api`. En Vercel, un *rewrite* reenvía esas
llamadas al backend de Railway, así que el navegador lo ve como mismo origen y tus cookies de
sesión (login, wishlist) siguen funcionando sin cambios de CORS.

---

## Lo que ya dejé preparado

| Archivo | Cambio |
|---|---|
| `server/glowglam/src/main/resources/application.properties` | Datasource y puerto leídos de variables de entorno, con defaults locales |
| `server/glowglam/Dockerfile` | Build multi-stage Maven + JRE 17 para Railway |
| `frontend/vercel.json` | Proxy `/api` → backend + fallback SPA para react-router |
| `.gitignore` (raíz) | Ignora `node_modules`, `target`, `dist`, `.env` |

Sigues corriendo todo en local igual que antes (`docker-compose up`, `npm run dev`, backend en 8080).

---

## Paso 1 — Subir el proyecto a GitHub

Desde la raíz `ProyectoVersion3`:

```bash
git init
git add .
git commit -m "Preparar proyecto para despliegue"
```

Crea el repo en GitHub (github.com/new), llámalo por ejemplo `glowglam`, y luego:

```bash
git remote add origin https://github.com/TU_USUARIO/glowglam.git
git branch -M main
git push -u origin main
```

---

## Paso 2 — Backend + MySQL en Railway

1. Entra a **railway.app** → *New Project* → *Deploy from GitHub repo* → elige tu repo.
2. Cuando cree el servicio, abre **Settings** del servicio y pon:
   - **Root Directory**: `server/glowglam`  (para que encuentre el `Dockerfile`)
   - Builder: **Dockerfile** (Railway lo detecta solo).
3. Añade la base de datos: botón *New* → *Database* → **Add MySQL**.
4. En el servicio del **backend**, pestaña **Variables**, agrega estas 3
   (usan referencias al servicio MySQL; ajusta `MySQL` si tu servicio tiene otro nombre):

   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?serverTimezone=GMT-5
   SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
   SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   ```

   (No definas `PORT`: Railway la inyecta sola y tu app ya la usa.)
5. En **Settings → Networking** del backend, pulsa **Generate Domain** para obtener una URL
   pública, algo como `https://glowglam-production.up.railway.app`. **Cópiala.**
6. Espera a que el deploy termine en verde. Prueba en el navegador:
   `https://TU-BACKEND.up.railway.app/api/products` → debe devolver JSON (o `[]`).

> Nota: si tu base arranca vacía, tendrás que cargar categorías/productos igual que en local
> (por el panel admin o importando tu dump de MySQL al servicio de Railway).

---

## Paso 3 — Conectar el frontend al backend

Edita `frontend/vercel.json` y reemplaza el placeholder con tu URL real de Railway:

```json
{
  "source": "/api/:path*",
  "destination": "https://TU-BACKEND.up.railway.app/api/:path*"
}
```

Guarda y sube el cambio:

```bash
git add frontend/vercel.json
git commit -m "Apuntar frontend al backend de Railway"
git push
```

---

## Paso 4 — Frontend en Vercel

1. Entra a **vercel.com** → *Add New* → *Project* → importa tu repo de GitHub.
2. En la configuración del proyecto:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (lo detecta solo)
   - Build Command: `npm run build` · Output: `dist` (por defecto)
3. Pulsa **Deploy**.
4. Al terminar tendrás una URL tipo `https://glowglam.vercel.app`. Ábrela: debería cargar la
   tienda con productos, buscador y login funcionando.

---

## Verificación final

- La tienda carga y muestra productos → el proxy `/api` llega al backend.
- Puedes iniciar sesión y la wishlist persiste → las cookies de sesión funcionan.
- Si ves la tienda pero **sin productos**: abre F12 → *Network* y revisa que `/api/products`
  responda 200. Si da 404/502, revisa la URL en `vercel.json` y que el backend esté verde en Railway.

---

## Costos y advertencias (importante)

- **Railway ya no tiene plan gratuito permanente.** Los nuevos usuarios reciben **$5 de crédito
  de prueba** (30 días). Después, el plan **Hobby cuesta $5/mes**.
- Los builds de **Spring Boot con Maven consumen crédito rápido** porque son pesados; evita
  pushear cambios al backend muy seguido para no gastar los créditos.
- **Vercel es gratis** para el frontend en su plan Hobby (proyectos personales).
- **No subas secretos reales a GitHub.** Las credenciales de MySQL en `docker-compose.yaml` y los
  defaults en `application.properties` son solo para tu base local; en producción Railway inyecta
  las suyas. Si este repo fuera público, cámbialas.

---

## Alternativa si no quieres pagar

Si el crédito de Railway se agota, un backend Java + MySQL siempre necesita un host que corra
procesos (Render, Fly.io, Koyeb tienen tiers gratuitos limitados). Vercel por sí solo **no** puede
alojar el backend. Avísame y te comparo opciones según tu presupuesto.
