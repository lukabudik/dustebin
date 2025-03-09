import prettier from 'prettier';

// Languages that can be formatted with Prettier
const FORMATTABLE_LANGUAGES = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'json',
  'html',
  'css',
];

// Maps our language identifiers to Prettier parser names
const PARSER_MAP: Record<string, string> = {
  'javascript': 'babel',
  'typescript': 'typescript',
  'jsx': 'babel',
  'tsx': 'typescript',
  'json': 'json',
  'html': 'html',
  'css': 'css',
};

/**
 * Checks if a language can be formatted with Prettier
 * @param language The language identifier to check
 * @returns True if the language can be formatted
 */
export function isFormattable(language: string): boolean {
  return FORMATTABLE_LANGUAGES.includes(language);
}

/**
 * Formats code using Prettier with standardized options
 * @param code The code to format
 * @param language The language of the code
 * @returns Formatted code or original if formatting fails
 */
export async function formatCode(code: string, language: string): Promise<string> {
  if (!isFormattable(language)) {
    return code; // Return unmodified code for unsupported languages
  }

  try {
    const parser = PARSER_MAP[language] || 'babel';
    
    const formatted = await prettier.format(code, {
      parser,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      bracketSpacing: true,
      arrowParens: 'avoid',
    });
    
    return formatted;
  } catch (error) {
    console.error('Error formatting code:', error);
    return code; // Return unmodified code if formatting fails
  }
}
