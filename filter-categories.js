// filter-categories.js - Filter out completed categories
import fs from 'fs';

const completedList = fs.readFileSync('completed_categories_list.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line);

const allCategories = fs.readFileSync('categories.csv', 'utf-8')
  .split('\n')
  .filter(line => line.trim());

console.log('✅ Completed categories:', completedList.length);
console.log('📋 Total categories in CSV:', allCategories.length);

// Extract category name from URL for matching
function getCategoryName(url) {
  // Extract the last part of the URL path
  const match = url.match(/\/c\/[^\/]+\/[^\/]+\/([^,\/]+)/);
  if (match) return match[1];
  
  // Try alternative pattern
  const match2 = url.match(/\/([^\/,]+),.*$/);
  if (match2) return match2[1];
  
  return null;
}

const remaining = allCategories.filter(line => {
  const catName = getCategoryName(line);
  if (!catName) return true; // Keep if we can't parse
  return !completedList.includes(catName);
});

fs.writeFileSync('categories_new_remaining.csv', remaining.join('\n'));

console.log('⏳ Remaining categories:', remaining.length);
console.log('✅ Created categories_new_remaining.csv');
console.log('');
console.log('Summary:');
console.log('  - Already complete: ' + completedList.length);
console.log('  - Need to scrape: ' + remaining.length);
console.log('  - Total: ' + (completedList.length + remaining.length));
