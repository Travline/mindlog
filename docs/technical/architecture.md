# Arquitectura de proyecto
Todo se basa en un morepo donde se usará pnpm packages para manejar tipos compartidos

```plaintext
mindlog/
├── apps/
│   ├── api/         # Backend Express
│   └── mobile/      # Mobile Expo
└── packages/
    └── types/       # Paquete compartido de tipos
```

# pnpm packages
Dentro de packages se tendrán distintos modules funcionando como `/shared` para todo el monorepo.
Para que esto funcione se debe hacer `pnpm install` en el root del monorepo y también en el del modulo compartido como es el de `/types`, con esto se iniciará la configuración necesaria para exportar lo que esté en ese modulo para el resto del monorepo.
Puede ser que no logre autocompletar los imports de tipos a veces pero si funciona.

```javascript
import { User } from '@mindlog/types';

const user: User = {
  "oal": "oal_1",
}
```

Por último mencionar que eso no solo se limita a a interfaces o types, se puede hacer modulos con logica compartida como `/utils` o aplicar lógica de validación con zod a los tipos de `/types`. Además, se debe utilizar si o sí pnpm en este proceso ya que la configuración es especialmente para este.


# Arquitectura Backend
Para esta parte se hará una arquitectura por modulos junto a una arquitectura por capas.

```plaintext
api/
├── src/
│   ├── config/             # Variables de entorno y Singletons (DB, Logger)
│   │   └── env.ts
│   ├── modules/            # Módulos por dominio / característica
│   │   └── users/          # Capas CSR
│   │       ├── user.controller.ts  # Solo recibe peticiones y entrega las respuestas
│   │       ├── user.service.ts     # Puramente lógica de la función
│   │       ├── user.repository.ts  # Incluirá el contrato para Repository Pattern
│   │       ├── user.model.ts       # No DTOs de controller (estos en el /types)
│   │       └── user.routes.ts      # Expone las rutas del controller
│   ├── shared/             # Middlewares y utilidades globales
│   │   ├── middlewares/    # Error handler, auth, Validation
│   │   └── errors/         # Clases de errores personalizados
│   ├── app.ts              # Configuración de Express (Middlewares, Rutas)
│   └── server.ts           # Punto de entrada (Listen, Graceful Shutdown)
├── .env.example
├── tsconfig.json
└── package.json
```

# Arquitectura Mobile
Esta seguirá la convención de expo de separación por tipos y así hacer uso de su router por archivo.

```plaintext
mobile/
├── app/
│   ├── _layout.tsx  # Layout inicial que redirecciona según si hay credenciales guardadas válidas
│   ├── index.tsx    # Pantalla inicial para acceder a identificarse
│   ├── (auth)/      # Agrupa archivos pero no modifica la ruta
|   |   └── login.tsx
|   └── (tabs)/      # Para manejar el resto de pantallas
├── components/      # Agrupa app y style components 
|   └── ui/          # Componentes de Gluestack
└── hooks/           # Hooks y stores de estado de la app
```