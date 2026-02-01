#!/usr/bin/env node

/**
 * ============================================================
 * STATE REGISTRY VALIDATION & DRY-RUN AUTOMATION SCRIPT
 * ============================================================
 * 
 * PURPOSE: Validate state registry integrity and simulate page generation
 *          WITHOUT writing any files (PREP-ONLY mode)
 * 
 * MODE: DRY_RUN (hardcoded to true)
 * SAFETY: Script aborts if DRY_RUN is set to false
 * 
 * WHAT THIS SCRIPT DOES:
 * 1. Validates /public/states/registry.json structure
 * 2. Checks all 50 states are present
 * 3. Validates slug safety (lowercase, kebab-case, unique)
 * 4. Cross-checks registry entries against filesystem
 * 5. Logs intended actions for future page generation
 * 6. Reports missing, extra, or mismatched states
 * 
 * WHAT THIS SCRIPT DOES NOT DO:
 * - Does NOT create or modify any files
 * - Does NOT publish or deploy anything
 * - Does NOT change Supabase or database
 * - Does NOT assume publishing works
 * 
 * VERSION: 1.0.0-prep
 * CREATED: 2026-02-01
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// SAFETY GUARDRAILS
// ============================================================

const DRY_RUN = true; // HARDCODED - DO NOT CHANGE IN PREP MODE

if (!DRY_RUN) {
  console.error('\n❌ CRITICAL ERROR: DRY_RUN is set to FALSE');
  console.error('❌ This script is designed for PREP-ONLY mode');
  console.error('❌ File generation is BLOCKED until publishing is ready');
  console.error('\n🛑 ABORTING EXECUTION\n');
  process.exit(1);
}

console.log('\n' + '='.repeat(70));
console.log('🔒 SAFETY MODE: DRY_RUN = TRUE');
console.log('✓ No files will be created or modified');
console.log('✓ All actions are simulated and logged only');
console.log('='.repeat(70) + '\n');

// ============================================================
// CONFIGURATION
// ============================================================

const REGISTRY_PATH = path.join(process.cwd(), 'public', 'states', 'registry.json');
const STATES_DIR = path.join(process.cwd(), 'public', 'states');
const EXPECTED_STATE_COUNT = 50;

// Validation results
const results = {
  timestamp: new Date().toISOString(),
  mode: 'DRY_RUN',
  registry: {
    found: false,
    valid: false,
    stateCount: 0,
    errors: [],
    warnings: []
  },
  slugValidation: {
    allValid: true,
    issues: []
  },
  filesystem: {
    existingStates: [],
    missingFromRegistry: [],
    missingFromFilesystem: [],
    matched: []
  },
  dryRunActions: []
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function log(emoji, message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`${emoji} [${level}] ${message}`);
}

function logAction(action, status, details) {
  const prefix = status === 'SAFE' ? '✓' : '⚠️';
  const line = `${prefix} [${status}] ${action}: ${details}`;
  console.log(line);
  results.dryRunActions.push({ action, status, details });
}

function validateSlug(slug) {
  const errors = [];
  
  // Check lowercase
  if (slug !== slug.toLowerCase()) {
    errors.push('Contains uppercase characters');
  }
  
  // Check URL-safe (only lowercase letters, numbers, and hyphens)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Contains invalid characters (must be a-z, 0-9, or hyphens only)');
  }
  
  // Check no consecutive hyphens
  if (/--/.test(slug)) {
    errors.push('Contains consecutive hyphens');
  }
  
  // Check doesn't start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Starts or ends with hyphen');
  }
  
  // Check minimum length
  if (slug.length < 2) {
    errors.push('Too short (minimum 2 characters)');
  }
  
  return errors;
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// ============================================================
// PHASE 1: VALIDATE REGISTRY.JSON
// ============================================================

console.log('\n' + '─'.repeat(70));
console.log('📋 PHASE 1: REGISTRY.JSON VALIDATION');
console.log('─'.repeat(70) + '\n');

log('🔍', `Looking for registry at: ${REGISTRY_PATH}`);

if (!checkFileExists(REGISTRY_PATH)) {
  log('❌', 'Registry file not found', 'ERROR');
  results.registry.errors.push('Registry file does not exist');
  results.registry.found = false;
} else {
  log('✓', 'Registry file found');
  results.registry.found = true;
  
  try {
    const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
    const registry = JSON.parse(registryContent);
    
    log('✓', 'Registry JSON parsed successfully');
    
    // Check structure
    if (!registry.states || !Array.isArray(registry.states)) {
      log('❌', 'Invalid structure: "states" array not found', 'ERROR');
      results.registry.errors.push('Missing or invalid "states" array');
    } else {
      const states = registry.states;
      results.registry.stateCount = states.length;
      
      log('📊', `Found ${states.length} states in registry`);
      
      // Check count
      if (states.length !== EXPECTED_STATE_COUNT) {
        log('❌', `Expected ${EXPECTED_STATE_COUNT} states, found ${states.length}`, 'ERROR');
        results.registry.errors.push(`State count mismatch: expected ${EXPECTED_STATE_COUNT}, found ${states.length}`);
      } else {
        log('✓', `State count correct: ${EXPECTED_STATE_COUNT} states`);
      }
      
      // Validate each state
      const slugsSeen = new Set();
      const namesSeen = new Set();
      
      console.log('\n🔍 Validating individual state entries...\n');
      
      states.forEach((state, index) => {
        const stateNum = index + 1;
        const errors = [];
        const warnings = [];
        
        // Check required fields
        if (!state.state_slug) {
          errors.push('Missing state_slug field');
        } else {
          const slug = state.state_slug;
          
          // Validate slug format
          const slugErrors = validateSlug(slug);
          if (slugErrors.length > 0) {
            slugErrors.forEach(err => {
              errors.push(`Slug "${slug}": ${err}`);
              results.slugValidation.allValid = false;
              results.slugValidation.issues.push({ slug, error: err });
            });
          }
          
          // Check uniqueness
          if (slugsSeen.has(slug)) {
            errors.push(`Duplicate slug: "${slug}"`);
          } else {
            slugsSeen.add(slug);
          }
        }
        
        if (!state.state_name) {
          errors.push('Missing state_name field');
        } else {
          const name = state.state_name;
          
          // Check non-empty
          if (!name.trim()) {
            errors.push('state_name is empty');
          }
          
          // Check proper case
          if (name === name.toLowerCase() && name !== name.toUpperCase()) {
            warnings.push(`state_name appears to be all lowercase: "${name}"`);
          }
          
          // Check uniqueness
          if (namesSeen.has(name)) {
            errors.push(`Duplicate state_name: "${name}"`);
          } else {
            namesSeen.add(name);
          }
        }
        
        // Report issues
        if (errors.length > 0 || warnings.length > 0) {
          console.log(`State #${stateNum}: ${state.state_name || 'UNKNOWN'} (${state.state_slug || 'MISSING'})`);
          
          errors.forEach(err => {
            console.log(`  ❌ ERROR: ${err}`);
            results.registry.errors.push(`State #${stateNum}: ${err}`);
          });
          
          warnings.forEach(warn => {
            console.log(`  ⚠️  WARNING: ${warn}`);
            results.registry.warnings.push(`State #${stateNum}: ${warn}`);
          });
          
          console.log('');
        }
      });
      
      if (results.registry.errors.length === 0) {
        log('✅', 'All registry validations passed!');
        results.registry.valid = true;
      } else {
        log('❌', `Registry validation failed with ${results.registry.errors.length} errors`, 'ERROR');
      }
    }
    
  } catch (err) {
    log('❌', `Failed to parse registry: ${err.message}`, 'ERROR');
    results.registry.errors.push(`JSON parse error: ${err.message}`);
  }
}

// ============================================================
// PHASE 2: FILESYSTEM CONSISTENCY CHECK
// ============================================================

console.log('\n' + '─'.repeat(70));
console.log('📁 PHASE 2: FILESYSTEM CONSISTENCY CHECK');
console.log('─'.repeat(70) + '\n');

log('🔍', `Scanning directory: ${STATES_DIR}`);

if (!checkFileExists(STATES_DIR)) {
  log('❌', 'States directory not found', 'ERROR');
} else {
  try {
    const items = fs.readdirSync(STATES_DIR, { withFileTypes: true });
    
    // Filter directories only, excluding registry.json and other files
    const existingDirs = items
      .filter(item => item.isDirectory())
      .map(item => item.name)
      .sort();
    
    results.filesystem.existingStates = existingDirs;
    log('📊', `Found ${existingDirs.length} existing state directories`);
    
    if (existingDirs.length > 0) {
      console.log('\nExisting state directories:');
      existingDirs.forEach(dir => console.log(`  📁 ${dir}/`));
    }
    
    // Cross-check with registry
    if (results.registry.found && results.registry.valid) {
      console.log('\n🔄 Cross-checking registry ↔ filesystem...\n');
      
      const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
      const registry = JSON.parse(registryContent);
      const registrySlugs = registry.states.map(s => s.state_slug);
      
      // Find states in filesystem but not in registry
      const extraStates = existingDirs.filter(dir => !registrySlugs.includes(dir));
      if (extraStates.length > 0) {
        log('⚠️', `Found ${extraStates.length} states in filesystem NOT in registry:`, 'WARNING');
        extraStates.forEach(slug => {
          console.log(`  ⚠️  ${slug}`);
          results.filesystem.missingFromRegistry.push(slug);
        });
        console.log('');
      }
      
      // Find states in registry but not in filesystem
      const missingStates = registrySlugs.filter(slug => !existingDirs.includes(slug));
      if (missingStates.length > 0) {
        log('⚠️', `Found ${missingStates.length} states in registry NOT in filesystem:`, 'WARNING');
        missingStates.forEach(slug => {
          console.log(`  ⚠️  ${slug}`);
          results.filesystem.missingFromFilesystem.push(slug);
        });
        console.log('');
      }
      
      // Find matched states
      const matchedStates = registrySlugs.filter(slug => existingDirs.includes(slug));
      results.filesystem.matched = matchedStates;
      
      if (extraStates.length === 0 && missingStates.length === 0) {
        log('✅', 'Perfect sync: Registry and filesystem match exactly!');
      } else {
        console.log('📊 Summary:');
        console.log(`   Matched: ${matchedStates.length}`);
        console.log(`   Missing from filesystem: ${missingStates.length}`);
        console.log(`   Extra in filesystem: ${extraStates.length}`);
      }
    }
    
  } catch (err) {
    log('❌', `Failed to read states directory: ${err.message}`, 'ERROR');
  }
}

// ============================================================
// PHASE 3: DRY-RUN AUTOMATION SIMULATION
// ============================================================

console.log('\n' + '─'.repeat(70));
console.log('🔬 PHASE 3: DRY-RUN AUTOMATION SIMULATION');
console.log('─'.repeat(70) + '\n');

log('📝', 'Simulating page generation actions (NO FILES WILL BE WRITTEN)');
console.log('');

if (results.registry.found && results.registry.valid) {
  const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const registry = JSON.parse(registryContent);
  
  registry.states.forEach((state, index) => {
    const { state_slug, state_name } = state;
    const stateDir = path.join(STATES_DIR, state_slug);
    const indexHtml = path.join(stateDir, 'index.html');
    const exists = checkFileExists(indexHtml);
    
    console.log(`─────────────────────────────────────────────────────────────────`);
    console.log(`State #${index + 1}: ${state_name}`);
    console.log(`Slug: ${state_slug}`);
    console.log('');
    
    // Log intended directory
    logAction(
      'CREATE_DIRECTORY',
      'SAFE',
      `Would create: ${stateDir}`
    );
    
    // Log intended file
    logAction(
      'WRITE_FILE',
      'BLOCKED',
      `Would write: ${indexHtml} (exists: ${exists})`
    );
    
    // Log intended CONFIG values
    console.log('\n   Intended CONFIG values:');
    console.log(`   {`);
    console.log(`     STATE_NAME: "${state_name}",`);
    console.log(`     STATE_SLUG: "${state_slug}",`);
    console.log(`     META_TITLE: "${state_name} Exotic Pet Laws & Regulations",`);
    console.log(`     META_DESCRIPTION: "Comprehensive guide to exotic pet ownership laws in ${state_name}...",`);
    console.log(`     CANONICAL_URL: "https://yourdomain.com/states/${state_slug}/"`);
    console.log(`   }`);
    console.log('');
    
    // Status
    if (exists) {
      logAction('FILE_STATUS', 'SAFE', 'Page already exists - would skip or update');
    } else {
      logAction('FILE_STATUS', 'BLOCKED', 'Page missing - would create (BLOCKED in prep mode)');
    }
    
    console.log('');
  });
  
  console.log('='.repeat(70));
  log('✅', `Simulation complete: Processed ${registry.states.length} states`);
  
} else {
  log('⚠️', 'Skipping simulation - registry validation failed', 'WARNING');
}

// ============================================================
// PHASE 4: FINAL SUMMARY REPORT
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('📊 FINAL VALIDATION REPORT');
console.log('='.repeat(70) + '\n');

console.log('🔒 MODE: DRY_RUN (PREP-ONLY)');
console.log(`🕐 Timestamp: ${results.timestamp}\n`);

console.log('Registry Validation:');
console.log(`  Found: ${results.registry.found ? '✓' : '✗'}`);
console.log(`  Valid: ${results.registry.valid ? '✓' : '✗'}`);
console.log(`  State Count: ${results.registry.stateCount} / ${EXPECTED_STATE_COUNT}`);
console.log(`  Errors: ${results.registry.errors.length}`);
console.log(`  Warnings: ${results.registry.warnings.length}\n`);

console.log('Slug Validation:');
console.log(`  All Valid: ${results.slugValidation.allValid ? '✓' : '✗'}`);
console.log(`  Issues: ${results.slugValidation.issues.length}\n`);

console.log('Filesystem Consistency:');
console.log(`  Existing States: ${results.filesystem.existingStates.length}`);
console.log(`  Matched: ${results.filesystem.matched.length}`);
console.log(`  Missing from Filesystem: ${results.filesystem.missingFromFilesystem.length}`);
console.log(`  Extra in Filesystem: ${results.filesystem.missingFromRegistry.length}\n`);

console.log('Dry-Run Actions:');
console.log(`  Total Simulated Actions: ${results.dryRunActions.length}`);
console.log(`  SAFE Actions: ${results.dryRunActions.filter(a => a.status === 'SAFE').length}`);
console.log(`  BLOCKED Actions: ${results.dryRunActions.filter(a => a.status === 'BLOCKED').length}\n`);

// Overall status
const hasErrors = results.registry.errors.length > 0 || results.slugValidation.issues.length > 0;

if (hasErrors) {
  console.log('❌ VALIDATION FAILED');
  console.log('   Fix errors above before proceeding to live generation\n');
  process.exit(1);
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('   Ready for live generation once publishing is unblocked\n');
  process.exit(0);
}
