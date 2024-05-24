declare module 'bad-words' {
    class Filter {
      constructor(options?: { placeHolder?: string, regex?: RegExp, replaceRegex?: RegExp, list?: string[] });
      clean(text: string): string;
      isProfane(text: string): boolean;
      addWords(...words: string[]): void;
      removeWords(...words: string[]): void;
    }
  
    export = Filter;
  }
  