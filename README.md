# devacas_

**Sácale el máximo partido a tus vacaciones**

Optimiza tus días de vacaciones combinándolos estratégicamente con festivos y fines de semana. Convierte días sueltos en descansos significativos.

🔗 **[Ver demo en vivo](https://devacas.vercel.app)**

---

## ✨ Características

- **Optimización inteligente**: Algoritmo que maximiza días libres usando el mínimo de vacaciones
- **Festivos automáticos**: Detecta festivos nacionales y autonómicos por código postal
- **Personalización total**: Añade festivos de convenio, define tu horario laboral, marca bloques obligatorios
- **Calendario interactivo**: Edita manualmente días bloqueados o confirmados
- **Sin registro**: Todo se guarda localmente en tu navegador

---

## 🚀 Cómo funciona

1. **Configura tu situación**: país, código postal, año, días de vacaciones (laborables o naturales)
2. **Añade festivos extras**: festivos de convenio o locales no detectados automáticamente
3. **Personaliza tu calendario**: días que trabajas (L-V, L-S, aleatorios), si tienes bloques semanales obligatorios o si quieres priorizar verano o Navidad.
4. **Obtén tu calendario optimizado**: el algoritmo encuentra los mejores huecos para maximizar días libres
5. **Ajusta manualmente**: confirma, bloquea o libera días según tus necesidades

---

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Nager.Date API** - Festivos nacionales
- **LocalStorage** - Persistencia de datos

---

## 🏃‍♂️ Ejecutar localmente

```bash
# Clonar el repositorio
git clone https://github.com/claraiis/devacas_.git
cd devacas_

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📊 Algoritmo de optimización

El algoritmo prioriza **puentes** (gaps cortos entre festivos/fines de semana) según su ratio de eficiencia:

```
Eficiencia = (días libres totales conseguidos) / (días de vacaciones gastados)
```

**Ejemplo:** Usar 2 días de vacaciones entre un festivo y un fin de semana puede darte 9 días libres (eficiencia: 4.5x).

### Restricciones soportadas:
- Días naturales vs laborables
- Bloques semanales obligatorios (7 días naturales, 5-6 días laborables)
- Días confirmados manualmente (respetados en recálculos)
- Días bloqueados (excluidos del cálculo)

---

## 🗺️ Roadmap

- [ ] Soporte para más países (actualmente solo España con datos completos)
- [ ] Export a ICS (importar a Google Calendar, Outlook)
- [ ] Visualización de estadísticas (eficiencia por mes, comparativas)
- [ ] Modo "trabajo remoto" (fechas flexibles)
- [ ] PWA (app instalable)

---

## 🤝 Contribuciones

devacas_ es un proyecto de código abierto mantenido de forma esporádica.

- **Issues**: Bienvenidos para reportar bugs o sugerir mejoras
- **Pull Requests**: Aceptados, pero pueden tardar en revisarse
- **No hay garantía de soporte**: Respondo cuando puedo

Si quieres contribuir con algo grande, abre un issue primero para discutirlo.

### Cómo contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

MIT License - Puedes usar, modificar y distribuir este código libremente.

Ver [LICENSE](LICENSE) para más detalles.

---

## 🙏 Créditos

- **Festivos nacionales**: [Nager.Date API](https://date.nager.at/)
- **Inspiración**: [Stretch My Time Off](https://github.com/zachd/stretch-my-time-off)

---

## 💬 Contacto

Creado por **Clara** - [GitHub](https://github.com/claraiis)

Si encuentras útil esta herramienta, ¡dale una ⭐ al repo!

---

**Nota**: Esta herramienta no reemplaza consultar con tu departamento de RRHH. Verifica siempre las políticas de vacaciones de tu empresa.