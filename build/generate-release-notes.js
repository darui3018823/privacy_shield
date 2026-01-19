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
    
    console.error(`Fetching commits between ${sanitizedFrom} and ${sanitizedTo}`);
    
    // Get commit hashes and messages
    // Use ^fromTag to exclude it but include toTag
    const gitLog = execSync(
      `git log ^${sanitizedFrom} ${sanitizedTo} --format=%H%n%B%n--END-COMMIT--`,
      { encoding: 'utf-8' }
    );
    
    console.error(`Found git log output of ${gitLog.length} characters`);
    
    const commits = [];
    const commitBlocks = gitLog.split('--END-COMMIT--').filter(b => b.trim());
    
    console.error(`Parsed ${commitBlocks.length} commit blocks`);
    
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
    
    console.error(`Successfully parsed ${commits.length} commits`);
    
    return commits;
  } catch (error) {
    console.error('Error getting commits:', error.message);
    return [];
  }
}

/**
 * Get the current version tag
 * @returns {string|null} Current tag name or null
 */
function getCurrentVersion() {
  try {
    // Try to get current tag from git describe (annotated/signed tags)
    try {
      const currentTag = execSync('git describe --exact-match --tags', { encoding: 'utf-8' }).trim();
      console.error(`Current version detected: ${currentTag}`);
      return currentTag;
    } catch (e) {
      console.error('Could not detect current tag with git describe');
    }
    
    // Fallback: get the most recent tag
    const allTags = execSync('git tag --sort=-creatordate', { encoding: 'utf-8' })
      .split('\n')
      .filter(t => t.trim());
    
    if (allTags.length > 0) {
      console.error(`Using most recent tag as version: ${allTags[0]}`);
      return allTags[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current version:', error.message);
    return null;
  }
}

/**
 * Get the previous tag
 * In GitHub Actions, when triggered by 'on: push: tags:', the current tag
 * is checked out, but we need to compare it with the previous one.
 * @returns {string|null} Previous tag name or null
 */
function getPreviousTag() {
  try {
    // Get the current tag from git describe or environment
    let currentTag = null;
    
    // Try to get current tag from git describe (annotated/signed tags)
    try {
      currentTag = execSync('git describe --exact-match --tags', { encoding: 'utf-8' }).trim();
      console.error(`Current tag detected: ${currentTag}`);
    } catch (e) {
      console.error('Could not detect current tag with git describe');
    }
    
    // Use creatordate for chronological sorting
    // This handles pre-release tags better than version:refname
    const allTags = execSync('git tag --sort=-creatordate', { encoding: 'utf-8' })
      .split('\n')
      .filter(t => t.trim());
    
    console.error(`All tags (chronological): ${allTags.slice(0, 5).join(', ')}`);
    
    if (allTags.length === 0) {
      return null;
    }
    
    // If we detected the current tag and it's the first in the list,
    // return the second tag (the previous release)
    if (currentTag && allTags[0] === currentTag && allTags.length > 1) {
      console.error(`Previous tag: ${allTags[1]}`);
      return allTags[1];
    }
    
    // Otherwise, assume the first tag in the sorted list is the current tag
    // and return the second one
    if (allTags.length > 1) {
      console.error(`Previous tag (assuming): ${allTags[1]}`);
      return allTags[1];
    }
    
    return null;
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
  let previousTag = args[0];
  
  console.error('=== Release Notes Generation ===');
  console.error(`Arguments passed: ${args.length > 0 ? args.join(', ') : 'none'}`);
  
  // Get current version for title
  const currentVersion = getCurrentVersion();
  const versionTitle = currentVersion ? `# Universal Privacy Shield ${currentVersion}` : '# Universal Privacy Shield';
  
  if (!previousTag) {
    console.error('No explicit previous tag provided, auto-detecting...');
    previousTag = getPreviousTag();
  }
  
  if (!previousTag) {
    console.error('No previous tag found. This might be the first release.');
    console.log(`${versionTitle}\n\n## 🎉 Initial Release\n\nThis is the first release of the project.`);
    return;
  }
  
  console.error(`Generating release notes from ${previousTag} to HEAD...`);
  
  const commits = getCommits(previousTag);
  
  if (commits.length === 0) {
    console.error('No commits found in the range.');
    console.log('## Release Notes\n\nNo changes in this release.');
    return;
  }
  
  console.error(`Processing ${commits.length} commits...`);
  
  const categories = categorizeCommits(commits);
  
  console.error('Commit categorization:');
  console.error(`  - Breaking: ${categories.breaking.length}`);
  console.error(`  - Features: ${categories.feat.length}`);
  console.error(`  - Fixes: ${categories.fix.length}`);
  console.error(`  - Performance: ${categories.perf.length}`);
  console.error(`  - Refactors: ${categories.refactor.length}`);
  console.error(`  - Docs: ${categories.docs.length}`);
  console.error(`  - Other: ${categories.other.length}`);
  
  const releaseNotes = generateReleaseNotes(categories);
  
  console.log(`${versionTitle}\n\n${releaseNotes}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  parseCommit,
  getCommits,
  getCurrentVersion,
  getPreviousTag,
  categorizeCommits,
  generateReleaseNotes
};
