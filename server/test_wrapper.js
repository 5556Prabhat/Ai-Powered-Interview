// Quick verification test for cppWrapper
const { generateCppDriver, parseFunctionSignature } = require('./src/execution/cppWrapper');

const code = `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (mp.find(complement) != mp.end()) {
            return {mp[complement], i};
        }
        mp[nums[i]] = i;
    }
    return {};
}`;

console.log('=== PARSED SIGNATURE ===');
const sig = parseFunctionSignature(code);
console.log(JSON.stringify(sig, null, 2));

console.log('\n=== GENERATED CODE ===');
const generated = generateCppDriver(code);
console.log(generated);
