/**
 * Type declarations for wink-bm25-text-search
 */
declare module 'wink-bm25-text-search' {
  interface BM25Config {
    fldWeights?: Record<string, number>;
    bm25Params?: {
      k1?: number;
      b?: number;
    };
  }

  interface BM25Engine {
    defineConfig(config: BM25Config): void;
    definePrepTasks(tasks: Array<(input: any) => any>): void;
    addDoc(doc: Record<string, string>, id: string): void;
    consolidate(): void;
    search(query: string, limit?: number): Array<[string, number]>;
    exportJSON(): string;
    importJSON(json: string): void;
  }

  function bm25(): BM25Engine;
  export = bm25;
}

/**
 * Type declarations for wink-nlp-utils
 */
declare module 'wink-nlp-utils' {
  const nlp: {
    string: {
      lowerCase: (input: string) => string;
      upperCase: (input: string) => string;
      trim: (input: string) => string;
      removeExtraSpaces: (input: string) => string;
      retainAlphaNums: (input: string) => string;
      tokenize0: (input: string) => string[];
      tokenize: (input: string) => string[];
      sentences: (input: string) => string[];
    };
    tokens: {
      removeWords: (tokens: string[]) => string[];
      stem: (tokens: string[]) => string[];
      propagateNegations: (tokens: string[]) => string[];
      phonetize: (tokens: string[]) => string[];
      soundex: (tokens: string[]) => string[];
    };
  };
  export = nlp;
}
