/**
 * Console message configuration utility
 * Controls console logging behavior based on environment
 */

type SuppressionPatterns = string[];

// Messages to suppress in all environments
const GLOBAL_SUPPRESSION_PATTERNS: SuppressionPatterns = [
  'Host validation failed',
  'Host is not supported',
  'Host is not valid or supported',
  'insights whitelist',
  'THREE.FBXLoader:'
];

// Additional messages to suppress only in production
const PRODUCTION_SUPPRESSION_PATTERNS: SuppressionPatterns = [
  'Warning: componentWill',
  'Warning: React does not recognize',
  'Warning: Invalid DOM property',
  'Failed to load resource',
  'The AudioContext was not allowed to start'
];

/**
 * Determines if the current environment is production
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD || 
    window.location.hostname !== 'localhost' && 
    !window.location.hostname.includes('127.0.0.1');
};

/**
 * Configures console messages to filter out unnecessary warnings and errors
 */
export function configureConsoleMessages(): void {
  const originalWarn = console.warn;
  const originalError = console.error;
  const isDev = !isProduction();

  // Store the original console log methods to avoid interfering with other code
  const originalConsole = {
    warn: originalWarn,
    error: originalError
  };

  // Create a function to check if a message should be suppressed
  const shouldSuppressMessage = (msg: any): boolean => {
    if (typeof msg !== 'string') return false;

    // Check against global patterns
    const isGlobalSuppressed = GLOBAL_SUPPRESSION_PATTERNS.some(pattern => 
      msg.includes(pattern)
    );
    
    if (isGlobalSuppressed) return true;
    
    // In production, also check production-specific patterns
    if (!isDev) {
      return PRODUCTION_SUPPRESSION_PATTERNS.some(pattern => 
        msg.includes(pattern)
      );
    }
    
    return false;
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    if (shouldSuppressMessage(args[0])) {
      return;
    }
    originalConsole.warn.apply(console, args);
  };

  // Override console.error
  console.error = (...args: any[]) => {
    if (shouldSuppressMessage(args[0])) {
      return;
    }
    originalConsole.error.apply(console, args);
  };
}
