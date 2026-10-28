export class DragAndDropUI {
  private dropZone: HTMLElement;
  private fileInput: HTMLInputElement;

  constructor(
    dropZoneId: string,
    fileInputId: string,
    private onFilesSelected: (files: FileList) => void
  ) {
    this.dropZone = document.getElementById(dropZoneId)!;
    this.fileInput = document.getElementById(fileInputId)! as HTMLInputElement;
    this.initListeners();
  }

  private initListeners(): void {
    // 1. Clic en la zona abre el explorador de archivos
    this.dropZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    // 2. Cambio en el input de tipo file
    this.fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.onFilesSelected(target.files);
        target.value = ''; // Resetea el input para permitir seleccionar el mismo archivo de nuevo si se desea
      }
    });

    // 3. Efectos visuales al arrastrar sobre la zona (Drag Over)
    this.dropZone.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.add('bg-indigo-50', 'border-indigo-500');
    });

    // 4. Quitar efectos al salir (Drag Leave)
    this.dropZone.addEventListener('dragleave', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove('bg-indigo-50', 'border-indigo-500');
    });

    // 5. Soltar archivos (Drop)
    this.dropZone.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove('bg-indigo-50', 'border-indigo-500');

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.onFilesSelected(e.dataTransfer.files);
      }
    });
  }
}