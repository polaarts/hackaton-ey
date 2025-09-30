const fs = require('fs');
const path = require('path');

// Leer el archivo de comunas completo
console.log('Leyendo archivo comunas.geojson...');
const comunasData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/comunas.geojson'), 'utf8'));

// Filtrar comunas de la Región Metropolitana de Santiago
const comunasRM = comunasData.features.filter(feature => 
  feature.properties && 
  feature.properties.Region === 'Región Metropolitana de Santiago'
);

console.log(`Encontradas ${comunasRM.length} comunas de la Región Metropolitana de Santiago`);

// Crear directorio data si no existe
const dataDir = path.join(__dirname, 'src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Función para normalizar nombres de archivos
function normalizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Crear un archivo JSON para cada comuna
comunasRM.forEach(comuna => {
  const comunaName = comuna.properties.Comuna;
  const fileName = normalizeFileName(comunaName) + '.json';
  const filePath = path.join(dataDir, fileName);
  
  // Crear el objeto Feature individual
  const comunaFeature = {
    type: "Feature",
    properties: comuna.properties,
    geometry: comuna.geometry
  };
  
  // Escribir archivo
  fs.writeFileSync(filePath, JSON.stringify(comunaFeature, null, 2), 'utf8');
  console.log(`✓ Creado: ${fileName} (${comunaName})`);
});

console.log(`\n✅ Proceso completado. Se crearon ${comunasRM.length} archivos JSON.`);

// Mostrar lista de comunas creadas
console.log('\n📍 Comunas de la Región Metropolitana de Santiago:');
comunasRM.forEach(comuna => {
  console.log(`- ${comuna.properties.Comuna} (${comuna.properties.Provincia})`);
});
