export const CommandType = {
  INSTALL: 'install',
  INSTALL_CHOOSE: 'install-choose',
  UNINSTALL: 'uninstall',
  UPDATE: 'update',
} as const;

export type CommandType = typeof CommandType[keyof typeof CommandType];

export interface SearchItem {
  guide_id: string;
  similarity: number;
}
