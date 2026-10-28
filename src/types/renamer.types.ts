export type TextCaseOption = 'keep' | 'lower' | 'upper' | 'title';
export type SpaceReplaceOption = '_' | '-' | '' | 'keep';
export type NumPositionOption = 'start' | 'end';

export interface RenameOptions {
  readonly textCase: TextCaseOption;
  readonly cleanAccents: boolean;
  readonly spaceReplace: SpaceReplaceOption;
  readonly prefix: string;
  readonly suffix: string;
  readonly enableNum: boolean;
  readonly numPadding: number;
  readonly numPos: NumPositionOption;
}

export interface ProcessedFile {
  readonly id: string;
  readonly originalFile: File;
  readonly newName: string;
}