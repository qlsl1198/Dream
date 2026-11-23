import { matchSymbolEvidence } from '../data/dreamSymbols';

export type SymbolHistoryParams = { History: { symbolId?: string } | undefined };

export function findPersonalSymbolRecords<T extends { content: string }>(records: readonly T[], symbolId: string) {
  return records.flatMap(record => {
    const evidence = matchSymbolEvidence(record.content, symbolId)[0];
    return evidence ? [{ record, excerpt: evidence.excerpt }] : [];
  });
}
