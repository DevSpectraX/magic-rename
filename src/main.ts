import { ProcessedFile, RenameOptions, TextCaseOption, SpaceReplaceOption, NumPositionOption } from './types/renamer.types';
import { RenameEngineService } from './services/RenameEngineService';
import { ZipExportService } from './services/ZipExportService';
import { FileListUI } from './ui/FileListUI';
import { DragAndDropUI } from './ui/DragAndDropUI';

class MagicRenameApp {
  private files: File[] = [];
  private fileListUI!: FileListUI;
  private dragAndDropUI!: DragAndDropUI;

  constructor() {
    this.initUIComponents();
    this.initEventListeners();
  }

  private initUIComponents(): void {
    // Inicializar el componente de lista y reordenamiento
    this.fileListUI = new FileListUI(
      'file-list',
      'file-count',
      'app-content',
      (oldIndex, newIndex) => this.reorderFiles(oldIndex, newIndex),
      (index) => this.removeFile(index)
    );

    // Inicializar el componente de Drag & Drop y selección
    this.dragAndDropUI = new DragAndDropUI(
      'drop-zone',
      'file-input',
      (fileList) => this.addFiles(fileList)
    );
  }

  private getOptionsFromDOM(): RenameOptions {
    const getValue = (id: string): string => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement).value;
    const isChecked = (id: string): boolean => (document.getElementById(id) as HTMLInputElement).checked;

    return {
      textCase: getValue('text-case') as TextCaseOption,
      cleanAccents: isChecked('clean-accents'),
      spaceReplace: getValue('space-replace') as SpaceReplaceOption,
      prefix: getValue('prefix'),
      suffix: getValue('suffix'),
      enableNum: isChecked('enable-num'),
      numPadding: parseInt(getValue('num-padding'), 10) || 3,
      numPos: getValue('num-pos') as NumPositionOption,
    };
  }

  private processFiles(): readonly ProcessedFile[] {
    const options = this.getOptionsFromDOM();
    return this.files.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      originalFile: file,
      newName: RenameEngineService.processFileName(file.name, index, options),
    }));
  }

  public addFiles(newFiles: FileList | File[]): void {
    this.files = [...this.files, ...Array.from(newFiles)];
    this.render();
  }

  public removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
    this.render();
  }

  public reorderFiles(oldIndex: number, newIndex: number): void {
    const updated = [...this.files];
    const [movedItem] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, movedItem);
    this.files = updated;
    this.render();
  }

  private render(): void {
    const processedFiles = this.processFiles();
    this.fileListUI.render(processedFiles);
  }

  private initEventListeners(): void {
    // Reactividad en tiempo real ante cualquier cambio en los inputs de reglas (tanto 'input' como 'change')
    document.querySelectorAll('input, select').forEach((element) => {
      element.addEventListener('input', () => this.render());
      element.addEventListener('change', () => this.render());
    });

    // Acción del botón de descarga masiva en ZIP con manejo seguro de errores
    const downloadBtn = document.getElementById('btn-download');
    downloadBtn?.addEventListener('click', async () => {
      const processedFiles = this.processFiles();
      if (processedFiles.length === 0) return;

      try {
        // Feedback visual temporal en el botón
        downloadBtn.textContent = '⏳ Generando ZIP...';
        downloadBtn.setAttribute('disabled', 'true');
        
        await ZipExportService.downloadAsZip(processedFiles);
      } catch (error) {
        console.error('Error al descargar el archivo ZIP:', error);
        alert('Hubo un error al empaquetar los archivos. Por favor, inténtalo de nuevo.');
      } finally {
        downloadBtn.textContent = '📦 Descargar Todo (.ZIP)';
        downloadBtn.removeAttribute('disabled');
      }
    });
  }
}

// Inicialización de la aplicación al cargar el DOM de manera segura
document.addEventListener('DOMContentLoaded', () => {
  new MagicRenameApp();
});