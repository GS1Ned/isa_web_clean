export interface AskIsaCitationSourceLike {
  title: string;
  url?: string | null;
  sourceLocator?: string | null;
  immutableUri?: string | null;
  citationLabel?: string | null;
  sourceChunkLocator?: string | null;
  sourceRole?: string | null;
  publicationStatus?: string | null;
  evidenceKey?: string | null;
  needsVerification?: boolean;
}

export function getAskIsaSourceHref(source: AskIsaCitationSourceLike) {
  return source.sourceLocator || source.immutableUri || source.url || undefined;
}

export function getAskIsaSourceDisplayLabel(source: AskIsaCitationSourceLike) {
  return source.citationLabel || source.title;
}

export function getAskIsaSourceLocatorLabel(source: AskIsaCitationSourceLike) {
  return source.sourceChunkLocator || source.sourceLocator || source.immutableUri || null;
}

export function hasReviewerUsableAskIsaCitation(source: AskIsaCitationSourceLike) {
  return Boolean(
    getAskIsaSourceDisplayLabel(source) &&
      (getAskIsaSourceHref(source) || getAskIsaSourceLocatorLabel(source)),
  );
}
