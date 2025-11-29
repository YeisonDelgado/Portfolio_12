# 🚀 Guía de Deployment - Portfolio

Esta guía te ayudará a poner tu portafolio en línea usando **Vercel** (100% gratis).

## ✅ Pre-requisitos Completados

- [x] Build exitoso verificado
- [x] Proyecto configurado correctamente
- [x] `.gitignore` configurado

---

## 📋 Opción 1: Deployment con Vercel (Recomendado)

### Paso 1: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"** (recomendado)
4. Autoriza Vercel para acceder a tu cuenta de GitHub

### Paso 2: Subir tu código a GitHub

Si aún no has subido tu proyecto a GitHub:

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Portfolio ready for deployment"

# Crear repositorio en GitHub y conectarlo
# Ve a github.com y crea un nuevo repositorio llamado "portfolio"
# Luego ejecuta:
git remote add origin https://github.com/TU_USUARIO/portfolio.git
git branch -M main
git push -u origin main
```

### Paso 3: Importar proyecto en Vercel

1. En Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de GitHub **"portfolio"**
3. Vercel detectará automáticamente que es un proyecto Next.js
4. **Configuración importante:**
   - **Framework Preset:** Next.js (auto-detectado)
   - **Build Command:** `npm run build` (ya configurado)
   - **Output Directory:** `.next` (auto-detectado)
   - **Install Command:** `npm install` (auto-detectado)

### Paso 4: Variables de Entorno (si las necesitas)

Si tu proyecto usa Firebase o Google Genkit, necesitarás agregar las variables de entorno:

1. En la configuración del proyecto en Vercel, ve a **"Environment Variables"**
2. Agrega las siguientes variables (si las tienes en tu `.env.local`):
   - `GOOGLE_GENAI_API_KEY`
   - Cualquier otra variable de Firebase

### Paso 5: Deploy

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel construye tu proyecto
3. ¡Listo! Tu portafolio estará en línea en una URL como: `https://tu-proyecto.vercel.app`

### Paso 6: Dominio Personalizado (Opcional)

Si quieres un dominio personalizado como `tuportfolio.com`:

1. Ve a **Settings** → **Domains** en tu proyecto de Vercel
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los DNS

---

## 📋 Opción 2: Deployment con Netlify

### Paso 1: Crear cuenta en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**

### Paso 2: Importar proyecto

1. Haz clic en **"Add new site"** → **"Import an existing project"**
2. Selecciona **"GitHub"**
3. Selecciona tu repositorio
4. Configuración:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

### Paso 3: Deploy

1. Haz clic en **"Deploy site"**
2. Espera a que termine el build
3. Tu sitio estará en línea en: `https://random-name.netlify.app`

---

## 📋 Opción 3: GitHub Pages (Requiere exportación estática)

> ⚠️ **Nota:** Esta opción requiere configuración adicional porque GitHub Pages solo soporta sitios estáticos.

### Configuración necesaria:

1. Actualizar `next.config.ts`:

```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

2. Agregar script en `package.json`:

```json
"scripts": {
  "export": "next build && next export"
}
```

3. Crear archivo `.github/workflows/deploy.yml` para CI/CD automático

---

## 🎯 Recomendación Final

**Usa Vercel** porque:
- ✅ Es la plataforma oficial de Next.js
- ✅ Deploy automático en cada push a GitHub
- ✅ Preview deployments para cada PR
- ✅ SSL gratis
- ✅ CDN global
- ✅ Análisis de performance
- ✅ 100% gratis para proyectos personales

---

## 🔄 Actualizaciones Futuras

Una vez deployado en Vercel:

1. Haz cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```
3. Vercel automáticamente detectará los cambios y hará un nuevo deploy
4. En 2-3 minutos tus cambios estarán en línea

---

## 🆘 Solución de Problemas

### Error: "Build failed"
- Verifica que `npm run build` funcione localmente
- Revisa los logs en Vercel para ver el error específico

### Error: "Module not found"
- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que los imports usen rutas correctas

### Variables de entorno no funcionan
- Asegúrate de agregarlas en Vercel Dashboard
- Recuerda que las variables públicas deben empezar con `NEXT_PUBLIC_`

---

## 📞 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli) - Para deploy desde terminal

---

**¡Tu portafolio está listo para el mundo! 🌍**
