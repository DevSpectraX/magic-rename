import JSZip from 'jszip';
import { ProcessedFile } from '../types/renamer.types';

export class ZipExportService {
  /**
   * Genera y dispara la descarga del paquete .ZIP de manera asíncrona
   */
  public static async downloadAsZip(
    files: readonly ProcessedFile[], 
    zipName: string = 'Archivos_MagicRename.zip'
  ): Promise<void> {
    if (files.length === 0) return;

    try {
      const zip = new JSZip();

      // Añadir cada archivo procesado al contenedor ZIP
      files.forEach(({ newName, originalFile }) => {
        zip.file(newName, originalFile);
      });

      // Generar el archivo binario comprimido (Blob)
      const blobContent = await zip.generateAsync({ type: 'blob' });
      this.triggerDownload(blobContent, zipName);
      
    } catch (error) {
      console.error('Error al generar el archivo ZIP:', error);
      throw new Error('No se pudo empaquetar el archivo ZIP.');
    }
  }

  // Simular un clic en un enlace invisible para forzar la descarga en el navegador
   
  private static triggerDownload(blob: Blob, fileName: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = objectUrl;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    
    // Limpiar el DOM
    document.body.removeChild(link);

    // Dejarle 100ms al navegador antes de revocar la URL del objeto
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 100);
  }
}