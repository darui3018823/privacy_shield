#!/usr/bin/env node

/**
 * Generate release notes from Conventional Commits
 * 
 * This script parses commit messages following Conventional Commits format
 * and generates categorized release notes for GitHub releases.
 */

const { execSync } = require('child_process');

/**
 * Parse a conventional commit message
 * @param {string} message - The commit message
 * @returns {Object} Parsed commit object
 */
function parseCommit(message) {
  // Remove Co-authored-by and other metadata
  const firstLine = message.split('\n')[0].trim();
  
  // Match conventional commit format: type(scope)!: subject
  // Allow optional whitespace after colon
  const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;
  const match = firstLine.match(conventionalRegex);
  
  if (!match) {
    return {
      type: 'other',
      scope: null,
      breaking: false,
      subject: firstLine,
      rawMessage: message
    };
  }
  
  const [, type, scope, exclamation, subject] = match;
  
  // Check for BREAKING CHANGE in body (must be at start of line, case insensitive)
  const hasBreakingInBody = /^BREAKING[ -]CHANGE:/im.test(message);
  
  return {
    type: type.toLowerCase(),
    scope: scope || null,
    breaking: !!exclamation || hasBreakingInBody,
    subject: subject.trim(),
    rawMessage: message
  };
}

/**
 * Get commits between two tags (or from tag to HEAD)
 * @param {string} fromTag - Starting tag
 * @param {string} toTag - Ending tag (optional, defaults to HEAD)
 * @returns {Array} Array of commit objects
 */
function getCommits(fromTag, toTag = 'HEAD') {
  try {
    // Sanitize inputs to prevent command injection
    const sanitizedFrom = fromTag.replace(/[^a-zA-Z0-9._\-\/]/g, '');
    const sanitizedTo = toTag.replace(/[^a-zA-Z0-9._\-\/]/g, '');
    
    // Get commit hashes and messages
    const gitLog = execSync(
      `git log ${sanitizedFrom}..${sanitizedTo} --format=%H%n%B%n--END-COMMIT--`,
      { encoding: 'utf-8' }
    );
    
    const commits = [];
    const commitBlocks = gitLog.split('--END-COMMIT--').filter(b => b.trim());
    
    for (const block of commitBlocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;
      
      const hash = lines[0];
      const message = lines.slice(1).join('\n').trim();
      
      const parsed = parseCommit(message);
      commits.push({
        hash: hash.substring(0, 7),
        ...parsed
      });
    }
    
    return commits;
  } catch (error) {
    console.error('Error getting commits:', error.message);
    return [];
  }
}

/**
 * Get the previous tag
 * @returns {string|null} Previous tag name or null
 */
function getPreviousTag() {
  try {
    // Use creatordate for more reliable sorting with pre-release tags
    const tags = execSync('git tag --sort=-creatordate', { encoding: 'utf-8' })
      .split('\n')
      .filter(t => t.trim());
    
    // Return the second tag (first is current, second is previous)
    return tags[1] || null;
  } catch (error) {
    console.error('Error getting previous tag:', error.message);
    return null;
  }
}

/**
 * Categorize commits by type
 * @param {Array} commits - Array of parsed commits
 * @returns {Object} Categorized commits
 */
function categorizeCommits(commits) {
  const categories = {
    breaking: [],
    feat: [],
    fix: [],
    perf: [],
    refactor: [],
    docs: [],
    other: []
  };
  
  for (const commit of commits) {
    if (commit.breaking) {
      categories.breaking.push(commit);
    } else if (commit.type === 'feat') {
      categories.feat.push(commit);
    } else if (commit.type === 'fix') {
      categories.fix.push(commit);
    } else if (commit.type === 'perf') {
      categories.perf.push(commit);
    } else if (commit.type === 'refactor') {
      categories.refactor.push(commit);
    } else if (commit.type === 'docs') {
      categories.docs.push(commit);
    } else {
      // build, ci, chore, test, style, and others
      categories.other.push(commit);
    }
  }
  
  return categories;
}

/**
 * Format a commit entry
 * @param {Object} commit - Commit object
 * @returns {string} Formatted commit line
 */
function formatCommit(commit) {
  const scopeText = commit.scope ? `**${commit.scope}**: ` : '';
  return `- ${scopeText}${commit.subject} (${commit.hash})`;
}

/**
 * Add a category section to the release notes
 * @param {string} title - Section title
 * @param {Array} commits - Array of commits for this category
 * @returns {string} Formatted section or empty string
 */
function addSection(title, commits) {
  if (commits.length === 0) {
    return '';
  }
  return `## ${title}\n\n${commits.map(formatCommit).join('\n')}`;
}

/**
 * Generate release notes markdown
 * @param {Object} categories - Categorized commits
 * @returns {string} Release notes in markdown format
 */
function generateReleaseNotes(categories) {
  const sections = [
    addSection('🚨 Breaking Changes', categories.breaking),
    addSection('🎉 New Features', categories.feat),
    addSection('🐛 Bug Fixes', categories.fix),
    addSection('⚡ Performance Improvements', categories.perf),
    addSection('♻️ Refactors', categories.refactor),
    addSection('📚 Documentation', categories.docs),
    addSection('🔧 Other Changes', categories.other)
  ].filter(section => section !== '');
  
  return sections.join('\n\n');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const previousTag = args[0] || getPreviousTag();
  
  if (!previousTag) {
    console.error('No previous tag found. This might be the first release.');
    console.log('## 🎉 Initial Release\n\nThis is the first release of the project.');
    return;
  }
  
  console.error(`Generating release notes from ${previousTag} to HEAD...`);
  
  const commits = getCommits(previousTag);
  
  if (commits.length === 0) {
    console.log('## Release Notes\n\nNo changes in this release.');
    return;
  }
  
  const categories = categorizeCommits(commits);
  const releaseNotes = generateReleaseNotes(categories);
  
  console.log(releaseNotes);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  parseCommit,
  getCommits,
  categorizeCommits,
  generateReleaseNotes
};
