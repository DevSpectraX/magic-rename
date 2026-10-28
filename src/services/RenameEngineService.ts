import { RenameOptions } from '../types/renamer.types';

export class RenameEngineService {
  /**
   * Genera el nuevo nombre respetando la inmutabilidad
   */
  public static processFileName(originalName: string, index: number, options: RenameOptions): string {
    const { name, ext } = this.parseFileName(originalName);

    let processedName = name;
    processedName = this.applyAccentCleanup(processedName, options.cleanAccents);
    processedName = this.applySpaceReplacement(processedName, options.spaceReplace);
    processedName = this.applyTextCase(processedName, options.textCase);
    processedName = this.applyAffixes(processedName, options.prefix, options.suffix);
    processedName = this.applySequentialNumbering(processedName, index, options);

    return `${processedName}${ext}`;
  }

  private static parseFileName(fileName: string): { name: string; ext: string } {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return { name: fileName, ext: '' };
    }
    return {
      name: fileName.substring(0, lastDotIndex),
      ext: fileName.substring(lastDotIndex),
    };
  }

  private static applyAccentCleanup(text: string, enabled: boolean): string {
    if (!enabled) return text;
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N')
      .replace(/[^a-zA-Z0-9\s\-_]/g, '');
  }

  private static applySpaceReplacement(text: string, spaceOption: string): string {
    if (spaceOption === 'keep') return text;
    return text.replace(/\s+/g, spaceOption);
  }

  private static applyTextCase(text: string, textCase: string): string {
    switch (textCase) {
      case 'lower':
        return text.toLowerCase();
      case 'upper':
        return text.toUpperCase();
      case 'title':
        return text.toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase());
      default:
        return text;
    }
  }

  private static applyAffixes(text: string, prefix: string, suffix: string): string {
    return `${prefix}${text}${suffix}`;
  }

  private static applySequentialNumbering(text: string, index: number, options: RenameOptions): string {
    if (!options.enableNum) return text;

    const formattedNumber = (index + 1).toString().padStart(options.numPadding, '0');
    return options.numPos === 'start' 
      ? `${formattedNumber}_${text}` 
      : `${text}_${formattedNumber}`;
  }
}