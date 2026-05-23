/**
 * scripts/migrar-invitados.mjs
 *
 * Uso:
 *   node scripts/migrar-invitados.mjs <ruta-al-excel>
 *   node scripts/migrar-invitados.mjs invitados.xlsx
 *
 * Requiere:
 *   npm install xlsx firebase-admin
 *   Colocar el archivo serviceAccountKey.json en la raíz del proyecto
 *   (Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada)
 *
 * Columnas esperadas en el Excel (primera fila = encabezados):
 *   nombre | apellido | mesa | nota
 *   (los nombres de columna son case-insensitive)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import admin from 'firebase-admin';

// ── Paths ──────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SERVICE_ACCOUNT_PATH = resolve(ROOT, 'serviceAccountKey.json');
const COLLECTION = 'invitados';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Normaliza un string: minúsculas, sin acentos, sin espacios extra.
 * Ej: "Nicolás  Romero" → "nicolas romero"
 */
const normalize = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Lee el Excel y devuelve un array de objetos con las columnas mapeadas.
 * Ignora filas completamente vacías.
 */
const leerExcel = (filePath) => {
  const workbook = XLSX.readFile(resolve(process.cwd(), filePath));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rows
    .map((row) => {
      // Normalizar las keys del objeto para ser case-insensitive
      const normalized = {};
      for (const key of Object.keys(row)) {
        normalized[normalize(key)] = row[key];
      }
      return {
        nombre: String(normalized['nombre'] || '').trim(),
        apellido: String(normalized['apellido'] || '').trim(),
        mesa: normalized['mesa'] !== '' ? String(normalized['mesa']).trim() : null,
        nota: String(normalized['nota'] || '').trim() || null,
      };
    })
    .filter((r) => r.nombre || r.apellido); // Descartar filas vacías
};

// ── Main ───────────────────────────────────────────────────────────────────────

const main = async () => {
  const excelPath = process.argv[2];
  if (!excelPath) {
    console.error('❌  Especificá la ruta al archivo Excel como argumento.');
    console.error('   Ej: node scripts/migrar-invitados.mjs invitados.xlsx');
    process.exit(1);
  }

  // Inicializar Firebase Admin
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  } catch {
    console.error(`❌  No se encontró serviceAccountKey.json en: ${SERVICE_ACCOUNT_PATH}`);
    console.error('   Generalo desde Firebase Console → Configuración → Cuentas de servicio.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();

  // Leer Excel
  let filas;
  try {
    filas = leerExcel(excelPath);
  } catch (err) {
    console.error(`❌  Error leyendo el Excel: ${err.message}`);
    process.exit(1);
  }

  console.log(`📋  ${filas.length} filas encontradas en el Excel.`);

  // Cargar documentos existentes de Firestore (en bloques de 20 por regla)
  console.log('🔄  Cargando colección existente de Firestore...');
  const existingSnapshot = await db.collection(COLLECTION).get();

  // Mapear existentes por clave normalizada "nombre apellido"
  const existingMap = new Map(); // key: "nombre apellido" normalizado → { docRef, data }
  for (const docSnap of existingSnapshot.docs) {
    const data = docSnap.data();
    const key = normalize(`${data.nombre || ''} ${data.apellido || ''}`);
    existingMap.set(key, { ref: docSnap.ref, data });
  }

  console.log(`📂  ${existingMap.size} documentos existentes en Firestore.\n`);

  // Procesar en batches de máx 500 operaciones (límite de Firestore)
  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  const commitBatch = async () => {
    if (batchCount > 0) {
      await batch.commit();
      console.log(`   ✅  Batch de ${batchCount} operaciones commiteado.`);
      batch = db.batch();
      batchCount = 0;
    }
  };

  for (const fila of filas) {
    const key = normalize(`${fila.nombre} ${fila.apellido}`);

    if (!key.trim()) {
      totalSkipped++;
      continue;
    }

    if (existingMap.has(key)) {
      // UPDATE: Solo agrega/pisa mesa y nota
      const { ref } = existingMap.get(key);
      const updatePayload = {};
      if (fila.mesa !== null) updatePayload.mesa = fila.mesa;
      if (fila.nota !== null) updatePayload.nota = fila.nota;

      if (Object.keys(updatePayload).length > 0) {
        updatePayload.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        batch.update(ref, updatePayload);
        batchCount++;
        totalUpdated++;
        console.log(`   ✏️   UPDATE  → ${fila.nombre} ${fila.apellido} | Mesa: ${fila.mesa}`);
      } else {
        totalSkipped++;
        console.log(`   ⏭️   SKIP    → ${fila.nombre} ${fila.apellido} (sin datos nuevos)`);
      }
    } else {
      // CREATE: Documento nuevo
      const newRef = db.collection(COLLECTION).doc();
      const createPayload = {
        nombre: fila.nombre,
        apellido: fila.apellido,
        nombreNormalizado: normalize(fila.nombre),
        apellidoNormalizado: normalize(fila.apellido),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      if (fila.mesa !== null) createPayload.mesa = fila.mesa;
      if (fila.nota !== null) createPayload.nota = fila.nota;

      batch.set(newRef, createPayload);
      batchCount++;
      totalCreated++;
      console.log(`   ➕  CREATE  → ${fila.nombre} ${fila.apellido} | Mesa: ${fila.mesa}`);
    }

    // Commit parcial si se llega al límite
    if (batchCount >= BATCH_SIZE) {
      await commitBatch();
    }
  }

  // Commit final
  await commitBatch();

  console.log('\n─────────────────────────────────────');
  console.log(`✅  Migración completada.`);
  console.log(`   Creados  : ${totalCreated}`);
  console.log(`   Actualizados: ${totalUpdated}`);
  console.log(`   Omitidos : ${totalSkipped}`);
  console.log('─────────────────────────────────────');

  process.exit(0);
};

main().catch((err) => {
  console.error('❌  Error fatal:', err);
  process.exit(1);
});
