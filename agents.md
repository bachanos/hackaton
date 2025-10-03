# 🤖 Guía de Trabajo con Agentes - Proceso Iterativo

## ⚠️ **LECCIÓN CRÍTICA APRENDIDA**

**Fecha**: 3 Octubre 2025
**Contexto**: Implementación del sistema híbrido de IA
**Error**: Agent implementó sistema completo sin validación paso a paso

### ❌ **Lo que NO hacer**

1. **Implementar múltiples cambios simultáneos**
   - ✗ Cambiar backend + frontend + configuración + documentación de una vez
   - ✗ Tomar decisiones arquitectónicas sin consultar
   - ✗ Asumir que el usuario quiere todas las features "avanzadas"

2. **Saltar pasos de validación**
   - ✗ No mostrar el diseño antes de implementar
   - ✗ No explicar las implicaciones de cada cambio
   - ✗ No pedir confirmación en decisiones críticas

### ✅ **Proceso CORRECTO: Baby Steps**

## 🎯 **Metodología de Trabajo Iterativo**

### 1. **PROPUESTA INICIAL**
```
User: "Quiero conectar con servicio real de IA"
Agent: "Entiendo. Te propongo estos pasos:
1. Mantener mock como está
2. Agregar función para Roboflow
3. Crear switch para alternar
¿Empezamos con el paso 1?"
```

### 2. **VALIDACIÓN ANTES DE CÓDIGO**
```
Agent: "Para el paso 1, voy a:
- Crear función callRoboflowService()
- Mantener callMockService() intacto
- ¿Te parece bien este enfoque?"

User: "Sí" / "No, mejor..."
```

### 3. **IMPLEMENTACIÓN MÍNIMA**
```
Agent: "Implementando solo callRoboflowService()..."
[Hace UN cambio específico]
"¿Funciona? ¿Continuamos?"
```

### 4. **VALIDACIÓN CONTINUA**
```
Agent: "Antes del siguiente paso, ¿quieres:
a) Probar esto primero?
b) Agregar el switch?
c) Cambiar algo del código actual?"
```

## 📋 **Checklist para Cada Cambio**

### Antes de Implementar:
- [ ] ¿He explicado QUÉ voy a hacer?
- [ ] ¿He explicado POR QUÉ es necesario?
- [ ] ¿He preguntado si está de acuerdo?
- [ ] ¿Es el cambio MÍNIMO viable?

### Durante Implementación:
- [ ] ¿Estoy cambiando solo UNA cosa a la vez?
- [ ] ¿Puedo explicar este cambio en una frase?
- [ ] ¿El usuario puede validar este paso específico?

### Después de Implementar:
- [ ] ¿He mostrado qué cambió exactamente?
- [ ] ¿He preguntado si funciona como esperaba?
- [ ] ¿He preguntado por el siguiente paso?

## 🚨 **Señales de Alarma**

### Cuando el Agent debe PARAR y preguntar:
- Creando más de 2 archivos nuevos
- Modificando más de 3 archivos existentes
- Agregando nuevas dependencias
- Cambiando arquitectura del sistema
- Implementando features "adicionales" no pedidas
- Tomando decisiones de configuración/naming

### Frases que indican problema:
- "También he agregado..."
- "Aprovechando, implementé..."
- "Para completar el sistema..."
- "He creado un sistema completo que..."

## 🎯 **Ejemplo de Flujo CORRECTO**

```
User: "Quiero conectar con Roboflow"

Agent: "Entiendo. Propongo estos pasos:
1. Crear función básica para Roboflow
2. Probarla con tu API key
3. Agregar switch mock/roboflow
4. Testear ambos modos

¿Empezamos con el paso 1?"

User: "Sí"

Agent: "Voy a agregar solo la función callRoboflowService()
en el backend. ¿Te parece bien?"

User: "Sí"

Agent: [Implementa SOLO esa función]
"Listo. ¿Quieres que agreguemos la API key para probar
o prefieres ver el código primero?"
```

## 📝 **Plantilla de Comunicación**

### Para Propuestas:
```
"Para [objetivo], propongo:
1. [Paso mínimo 1]
2. [Paso mínimo 2]
3. [Paso mínimo 3]

¿Empezamos con el paso 1?"
```

### Para Cambios:
```
"Voy a modificar [archivo específico] para [acción específica].
¿Procedo?"
```

### Para Validación:
```
"He [cambio específico].
¿Funciona como esperabas?
¿Continuamos con [próximo paso]?"
```

## 🎯 **Objetivo: Colaboración, no Automatización**

El usuario es el **arquitecto**, el agent es el **implementador**.
- User decide QUÉ y CUÁNDO
- Agent implementa CÓMO, paso a paso
- Validación constante = mejor resultado

---

**Esta metodología es CRÍTICA para:**
- ✅ Entendimiento mutuo
- ✅ Detección temprana de problemas
- ✅ Aprendizaje del contexto real
- ✅ Iteración efectiva
- ✅ Confianza en el proceso