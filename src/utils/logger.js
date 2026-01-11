/**
 * Logger utility for unified error handling and logging
 * @module logger
 */

/**
 * Log levels
 * @enum {string}
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Extension name prefix for log messages
 * @constant {string}
 */
const LOG_PREFIX = '[Privacy Shield]';

/**
 * Logger class for unified logging across the extension
 */
class Logger {
  /**
   * Log an error message
   * @param {string} message - The error message
   * @param {Error|any} [error] - Optional error object or additional data
   */
  static error(message, error = null) {
    console.error(`${LOG_PREFIX} ${message}`, error || '');
  }

  /**
   * Log a warning message
   * @param {string} message - The warning message
   * @param {any} [data] - Optional additional data
   */
  static warn(message, data = null) {
    console.warn(`${LOG_PREFIX} ${message}`, data || '');
  }

  /**
   * Log an info message
   * @param {string} message - The info message
   * @param {any} [data] - Optional additional data
   */
  static info(message, data = null) {
    console.info(`${LOG_PREFIX} ${message}`, data || '');
  }

  /**
   * Log a debug message
   * @param {string} message - The debug message
   * @param {any} [data] - Optional additional data
   */
  static debug(message, data = null) {
    console.debug(`${LOG_PREFIX} ${message}`, data || '');
  }

  /**
   * Log a message with a specific level
   * @param {string} level - The log level
   * @param {string} message - The message
   * @param {any} [data] - Optional additional data
   */
  static log(level, message, data = null) {
    const logMethod = console[level.toLowerCase()] || console.log;
    logMethod.call(console, `${LOG_PREFIX} [${level}] ${message}`, data || '');
  }
}

export { Logger, LogLevel };
