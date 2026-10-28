import Sortable from 'sortablejs';
import { ProcessedFile } from '../types/renamer.types';

export class FileListUI {
  private readonly container: HTMLElement;
  private readonly fileCountEl: HTMLElement;
  private readonly appContent: HTMLElement;
  private sortableInstance: Sortable | null = null;

  constructor(
    containerId: string,
    fileCountId: string,
    appContentId: string,
    private readonly onReorder: (oldIndex: number, newIndex: number) => void,
    private readonly onDelete: (index: number) => void
  ) {
    this.container = this.getElementOrThrow(containerId);
    this.fileCountEl = this.getElementOrThrow(fileCountId);
    this.appContent = this.getElementOrThrow(appContentId);
    this.initSortable();
  }

  /**
   * Asegura que los elementos críticos del DOM existen para evitar errores de tipo `null` en TS.
   */
  private getElementOrThrow(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`[FileListUI]: No se pudo encontrar el elemento con ID "${id}" en el DOM.`);
    }
    return el;
  }

  private initSortable(): void {
    this.sortableInstance = Sortable.create(this.container, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'bg-indigo-50',
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
          this.onReorder(evt.oldIndex, evt.newIndex);
        }
      },
    });
  }

  public render(processedFiles: readonly ProcessedFile[]): void {
    // Limpiamos el contenedor de forma segura
    this.container.innerHTML = '';
    this.fileCountEl.textContent = processedFiles.length.toString();

    if (processedFiles.length === 0) {
      this.appContent.classList.add('hidden');
      return;
    }

    this.appContent.classList.remove('hidden');

    // Construcción eficiente mediante un DocumentFragment para evitar reflujos innecesarios del DOM
    const fragment = document.createDocumentFragment();

    processedFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = "flex items-center justify-between p-3 bg-slate-50 border rounded-lg hover:border-indigo-300 transition group";
      
      item.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden">
          <span class="drag-handle cursor-grab text-slate-400 group-hover:text-indigo-600 font-bold px-1">⋮⋮</span>
          <div class="truncate">
            <p class="text-xs text-slate-400 line-through">${this.escapeHTML(file.originalFile.name)}</p>
            <p class="text-sm font-semibold text-indigo-900 truncate">${this.escapeHTML(file.newName)}</p>
          </div>
        </div>
        <button type="button" class="delete-btn text-slate-300 hover:text-red-500 font-bold px-2 transition cursor-pointer" data-index="${index}" aria-label="Eliminar archivo">✕</button>
      `;

      // Vincular evento de borrado de forma limpia
      item.querySelector('.delete-btn')?.addEventListener('click', () => {
        this.onDelete(index);
      });

      fragment.appendChild(item);
    });

    this.container.appendChild(fragment);
  }

  /**
   * Pequeña función auxiliar para prevenir XSS básico al renderizar nombres de archivos inyectados en HTML.
   */
  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}