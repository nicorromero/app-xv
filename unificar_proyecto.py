import os

# Configuración del script
OUTPUT_FILE = "mi_proyecto.md"
# Carpetas que no queremos que la IA analice (módulos, compilados o multimedia)
EXCLUDE_DIRS = {"node_modules", ".git", "dist", "build", ".firebase", "images", "book"}
# Extensiones de archivos de texto que componen tu código fuente
ALLOWED_EXTENSIONS = {".js", ".jsx", ".json", ".css", ".html", ".rules", ".md", ".example", ".txt", ".cjs"}

def generar_markdown_unificado():
    contador_archivos = 0
    
    print("Iniciando unificación de código fuente para IA...")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        # Encabezado inicial del documento Markdown
        outfile.write("# Contexto Unificado del Proyecto: App-XV\n\n")
        outfile.write("Este archivo contiene la estructura completa y el código fuente del proyecto optimizado para análisis de arquitectura y rendimiento.\n\n")
        
        # Mapeo de la estructura del proyecto en forma de árbol al inicio del archivo
        outfile.write("## 📂 Estructura de Archivos Incluidos\n```text\n")
        estructuras = []
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if os.path.splitext(file)[1] in ALLOWED_EXTENSIONS or file in ["firestore.rules", "firebase.json"]:
                    if file not in [OUTPUT_FILE, "unificar_proyecto.py", "package-lock.json"]:
                        rel_path = os.path.relpath(os.path.join(root, file), ".")
                        estructuras.append(f" 📄 {rel_path}")
        outfile.write("\n".join(estructuras))
        outfile.write("\n```\n\n---\n\n")
        
        # Recorrer y escribir el contenido de cada archivo
        for root, dirs, files in os.walk("."):
            # Filtrar directorios excluidos sobre la marcha
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                filepath = os.path.join(root, file)
                ext = os.path.splitext(file)[1]
                
                # Filtrar archivos permitidos y evitar recursión con el archivo de salida o el script
                if ext in ALLOWED_EXTENSIONS or file in ["firestore.rules", "firebase.json"]:
                    if file in [OUTPUT_FILE, "unificar_proyecto.py", "package-lock.json"]:
                        continue
                    
                    rel_path = os.path.relpath(filepath, ".")
                    
                    # Detectar lenguaje para el resaltado de sintaxis en Markdown
                    lang = ext.replace(".", "")
                    if lang in ["jsx", "cjs"]: lang = "javascript"
                    elif lang == "rules": lang = "javascript"
                    elif lang == "": lang = "json" if file.endswith(".json") else "text"
                    
                    try:
                        # Leer con 'ignore' para evitar caídas si hay caracteres extraños
                        with open(filepath, "r", encoding="utf-8", errors="ignore") as infile:
                            content = infile.read()
                        
                        # Escribir bloque formateado en el Markdown único
                        outfile.write(f"## 🛠️ Archivo: {rel_path}\n")
                        outfile.write(f"```{lang}\n")
                        outfile.write(content)
                        outfile.write("\n```\n\n---\n\n")
                        
                        contador_archivos += 1
                        print(f"✔ Agregado: {rel_path}")
                    except Exception as e:
                        print(f"❌ Error al leer {rel_path}: {e}")
                        
    print(f"\n¡Proceso finalizado con éxito!")
    print(f"Se han fusionado {contador_archivos} archivos de código en '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    generar_markdown_unificado()