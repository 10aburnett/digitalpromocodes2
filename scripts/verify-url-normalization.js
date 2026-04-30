#!/usr/bin/env node

/**
 * Verification script for URL normalization implementation
 * Tests case-sensitivity fixes for whop routes
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.SITE_URL || 'https://whoppromocodes.com';

// Test cases for verification
const TEST_CASES = [
  {
    name: 'Deal Flip Formula (Mixed Case)',
    url: '/whop/Deal-Flip-Formula-main',
    expectedRedirect: '/whop/deal-flip-formula-main',
    description: 'Should 301 redirect mixed-case to lowercase'
  },
  {
    name: 'Deal Flip Formula (Lowercase)',
    url: '/whop/deal-flip-formula-main',
    expectedStatus: 200,
    description: 'Lowercase URL should return 200 OK'
  },
  {
    name: 'Ayecon Academy (Mixed Case)',
    url: '/whop/AYECON-Academy-1:1-Mentorship',
    expectedRedirect: '/whop/ayecon-academy-1:1-mentorship',
    description: 'Should handle uppercase and preserve colons'
  }
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${BASE_URL}${url}`;
    const protocol = fullUrl.startsWith('https:') ? https : http;

    console.log(`🔍 Testing: ${fullUrl}`);

    const req = protocol.request(fullUrl, { method: 'HEAD' }, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        location: res.headers.location
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function verifyTestCase(testCase) {
  try {
    const response = await makeRequest(testCase.url);

    console.log(`📊 Result for "${testCase.name}":`);
    console.log(`   Status: ${response.statusCode}`);

    if (response.location) {
      console.log(`   Location: ${response.location}`);
    }

    // Check expectations
    let passed = true;
    let issues = [];

    if (testCase.expectedRedirect) {
      if (response.statusCode !== 301) {
        passed = false;
        issues.push(`Expected 301 redirect, got ${response.statusCode}`);
      }

      if (response.location && !response.location.endsWith(testCase.expectedRedirect)) {
        passed = false;
        issues.push(`Expected redirect to ${testCase.expectedRedirect}, got ${response.location}`);
      }
    }

    if (testCase.expectedStatus) {
      if (response.statusCode !== testCase.expectedStatus) {
        passed = false;
        issues.push(`Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
      }
    }

    if (passed) {
      console.log(`   ✅ PASS: ${testCase.description}`);
    } else {
      console.log(`   ❌ FAIL: ${testCase.description}`);
      issues.forEach(issue => console.log(`      - ${issue}`));
    }

    console.log('');
    return passed;

  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    console.log('');
    return false;
  }
}

async function verifySitemap() {
  console.log('🗺️ Verifying sitemap contains lowercase URLs...');

  try {
    const response = await makeRequest('/sitemap-offers.xml');

    if (response.statusCode !== 200) {
      console.log(`❌ Sitemap not accessible (${response.statusCode})`);
      return false;
    }

    console.log('✅ Sitemap accessible');
    console.log('ℹ️  Manual verification needed: Check that all offer URLs in sitemap are lowercase');
    console.log('');
    return true;

  } catch (error) {
    console.log(`💥 Error accessing sitemap: ${error.message}`);
    console.log('');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting URL normalization verification...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('');

  let allPassed = true;

  // Test individual cases
  for (const testCase of TEST_CASES) {
    const passed = await verifyTestCase(testCase);
    if (!passed) allPassed = false;
  }

  // Test sitemap
  const sitemapPassed = await verifySitemap();
  if (!sitemapPassed) allPassed = false;

  // Summary
  console.log('📋 SUMMARY:');
  if (allPassed) {
    console.log('✅ All tests PASSED! URL normalization is working correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy to production');
    console.log('2. Purge CDN cache for affected URLs');
    console.log('3. Submit lowercase URLs to Google Search Console');
    process.exit(0);
  } else {
    console.log('❌ Some tests FAILED. Review implementation and try again.');
    process.exit(1);
  }
}

// Handle CLI usage
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyTestCase, verifySitemap };