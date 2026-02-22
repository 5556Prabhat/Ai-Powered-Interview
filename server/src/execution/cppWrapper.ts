// ─── C++ Wrapper Generator ───────────────────────────────────────────────────
// Transforms LeetCode-style function-only C++ code into a complete executable
// by parsing the function signature and generating a main() driver that reads
// test case input from stdin, calls the function, and prints formatted output.

// ─── Types ───────────────────────────────────────────────────────────────────

interface FunctionParam {
    type: string;       // e.g. "vector<int>", "int", "string", "bool"
    name: string;       // e.g. "nums", "target"
    isRef: boolean;     // whether it's passed by reference
}

interface FunctionSignature {
    returnType: string;     // e.g. "vector<int>", "bool", "int"
    functionName: string;   // e.g. "twoSum", "isValid"
    params: FunctionParam[];
    isClassMethod: boolean; // whether it's inside class Solution {}
}

// ─── Signature Parser ────────────────────────────────────────────────────────

/**
 * Parses the first public method from user's C++ code.
 * Handles both standalone functions and class Solution methods.
 */
export function parseFunctionSignature(code: string): FunctionSignature | null {
    // Check if code is inside a class (LeetCode style)
    const isClassMethod = /class\s+Solution\s*\{/.test(code);

    // Regex for function signature - handles templates like vector<int>, vector<vector<int>>, etc.
    // Pattern: returnType functionName(params...)
    const funcRegex = /(?:public:\s*)?\s*((?:vector\s*<\s*(?:vector\s*<\s*\w+\s*>|\w+)\s*>|[\w:]+)(?:\s*\*)?)\s+(\w+)\s*\(([\s\S]*?)\)\s*\{/;

    const match = code.match(funcRegex);
    if (!match) return null;

    const returnType = match[1].replace(/\s+/g, ' ').trim();
    const functionName = match[2].trim();
    const paramsStr = match[3].trim();

    // Skip if we matched 'main'
    if (functionName === 'main') return null;

    // Parse parameters
    const params: FunctionParam[] = [];
    if (paramsStr) {
        // Split by comma, but respect angle brackets
        const paramParts = splitParams(paramsStr);

        for (const part of paramParts) {
            const trimmed = part.trim();
            if (!trimmed) continue;

            // Match: type [&] name
            const paramMatch = trimmed.match(/^([\w\s<>:,*]+?)\s*(&)?\s*(\w+)$/);
            if (paramMatch) {
                params.push({
                    type: paramMatch[1].replace(/\s+/g, ' ').trim(),
                    name: paramMatch[3],
                    isRef: paramMatch[2] === '&',
                });
            }
        }
    }

    return { returnType, functionName, params, isClassMethod };
}

/**
 * Splits parameter string by commas, respecting nested angle brackets.
 */
function splitParams(paramsStr: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = '';

    for (const ch of paramsStr) {
        if (ch === '<') depth++;
        else if (ch === '>') depth--;
        else if (ch === ',' && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }
        current += ch;
    }
    if (current.trim()) parts.push(current);

    return parts;
}

// ─── Code Detection ──────────────────────────────────────────────────────────

/**
 * Checks if user code already contains a main() function.
 */
export function hasMainFunction(code: string): boolean {
    return /\bint\s+main\s*\(/.test(code);
}

// ─── Include Management ─────────────────────────────────────────────────────

/**
 * Returns required #include directives that are NOT already in user's code.
 */
function getRequiredIncludes(code: string, sig: FunctionSignature): string[] {
    // Scan BOTH the signature types AND the full user code body for types that need includes
    const signatureTypes = [sig.returnType, ...sig.params.map(p => p.type)].join(' ');
    const scanTarget = signatureTypes + ' ' + code;
    const needed = new Set<string>();

    // Always need iostream for cout, string for getline, sstream for parsing
    needed.add('#include <iostream>');
    needed.add('#include <string>');
    needed.add('#include <sstream>');

    if (scanTarget.includes('vector')) needed.add('#include <vector>');
    if (scanTarget.includes('unordered_map')) needed.add('#include <unordered_map>');
    if (scanTarget.includes('unordered_set')) needed.add('#include <unordered_set>');
    if (/\bmap\b/.test(scanTarget) && !scanTarget.includes('unordered_map'))
        needed.add('#include <map>');
    if (/\bset\b/.test(scanTarget) && !scanTarget.includes('unordered_set'))
        needed.add('#include <set>');
    if (scanTarget.includes('queue')) needed.add('#include <queue>');
    if (scanTarget.includes('stack')) needed.add('#include <stack>');
    if (scanTarget.includes('sort(') || scanTarget.includes('min(') || scanTarget.includes('max('))
        needed.add('#include <algorithm>');
    if (scanTarget.includes('pair')) needed.add('#include <utility>');
    if (scanTarget.includes('INT_MAX') || scanTarget.includes('INT_MIN'))
        needed.add('#include <climits>');

    // Filter out includes already present in user code
    return Array.from(needed).filter(inc => !code.includes(inc));
}

// ─── Input Parser Generators ──────────────────────────────────────────────────

/**
 * Returns C++ helper function code for parsing stdin input into typed values.
 */
function getParserFunctions(sig: FunctionSignature): string {
    const allTypes = [sig.returnType, ...sig.params.map(p => p.type)].join(' ');
    const parsers: string[] = [];

    // Trim function (always needed)
    parsers.push(`
string trimStr(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\r\\n");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\r\\n");
    return s.substr(start, end - start + 1);
}`);

    // Vector<int> parser
    if (allTypes.includes('vector<int>') || allTypes.includes('vector< int >')) {
        parsers.push(`
vector<int> parseVectorInt(const string& s) {
    vector<int> result;
    string trimmed = trimStr(s);
    if (trimmed.size() < 2) return result;
    // Remove [ and ]
    string inner = trimmed.substr(1, trimmed.size() - 2);
    if (inner.empty()) return result;
    stringstream ss(inner);
    string token;
    while (getline(ss, token, ',')) {
        string t = trimStr(token);
        if (!t.empty()) result.push_back(stoi(t));
    }
    return result;
}`);
    }

    // Vector<string> parser
    if (allTypes.includes('vector<string>')) {
        parsers.push(`
vector<string> parseVectorString(const string& s) {
    vector<string> result;
    string trimmed = trimStr(s);
    if (trimmed.size() < 2) return result;
    string inner = trimmed.substr(1, trimmed.size() - 2);
    if (inner.empty()) return result;
    stringstream ss(inner);
    string token;
    while (getline(ss, token, ',')) {
        string t = trimStr(token);
        // Remove quotes if present
        if (t.size() >= 2 && t.front() == '"' && t.back() == '"')
            t = t.substr(1, t.size() - 2);
        result.push_back(t);
    }
    return result;
}`);
    }

    // Vector<vector<int>> parser
    if (allTypes.includes('vector<vector<int>>')) {
        parsers.push(`
vector<vector<int>> parseVectorVectorInt(const string& s) {
    vector<vector<int>> result;
    string trimmed = trimStr(s);
    if (trimmed.size() < 2) return result;
    // Remove outer [ ]
    string inner = trimmed.substr(1, trimmed.size() - 2);
    int depth = 0;
    string current;
    for (char c : inner) {
        if (c == '[') {
            depth++;
            if (depth == 1) { current = "["; continue; }
        }
        if (c == ']') {
            depth--;
            if (depth == 0) {
                current += "]";
                result.push_back(parseVectorInt(current));
                current = "";
                continue;
            }
        }
        if (depth > 0) current += c;
    }
    return result;
}`);
    }

    return parsers.join('\n');
}

// ─── Output Formatter Generators ──────────────────────────────────────────────

/**
 * Returns C++ code to print the result in expected format.
 */
function getOutputCode(returnType: string, varName: string): string {
    const type = returnType.replace(/\s+/g, '');

    if (type === 'vector<int>') {
        return `
    cout << "[";
    for (int i = 0; i < (int)${varName}.size(); i++) {
        if (i > 0) cout << ",";
        cout << ${varName}[i];
    }
    cout << "]" << endl;`;
    }

    if (type === 'vector<string>') {
        return `
    cout << "[";
    for (int i = 0; i < (int)${varName}.size(); i++) {
        if (i > 0) cout << ",";
        cout << "\\"" << ${varName}[i] << "\\"";
    }
    cout << "]" << endl;`;
    }

    if (type === 'vector<vector<int>>') {
        return `
    cout << "[";
    for (int i = 0; i < (int)${varName}.size(); i++) {
        if (i > 0) cout << ",";
        cout << "[";
        for (int j = 0; j < (int)${varName}[i].size(); j++) {
            if (j > 0) cout << ",";
            cout << ${varName}[i][j];
        }
        cout << "]";
    }
    cout << "]" << endl;`;
    }

    if (type === 'bool') {
        return `    cout << (${varName} ? "true" : "false") << endl;`;
    }

    if (type === 'string') {
        return `    cout << ${varName} << endl;`;
    }

    // int, long, double, etc.
    return `    cout << ${varName} << endl;`;
}

// ─── Input Reading Code Generator ─────────────────────────────────────────────

/**
 * Generates C++ code to read one parameter from stdin.
 */
function getParamReadCode(param: FunctionParam): string {
    const type = param.type.replace(/\s+/g, '');

    if (type === 'vector<int>') {
        return `    getline(cin, line);
    vector<int> ${param.name} = parseVectorInt(line);`;
    }

    if (type === 'vector<string>') {
        return `    getline(cin, line);
    vector<string> ${param.name} = parseVectorString(line);`;
    }

    if (type === 'vector<vector<int>>') {
        return `    getline(cin, line);
    vector<vector<int>> ${param.name} = parseVectorVectorInt(line);`;
    }

    if (type === 'int') {
        return `    getline(cin, line);
    int ${param.name} = stoi(trimStr(line));`;
    }

    if (type === 'long' || type === 'longlong') {
        return `    getline(cin, line);
    long long ${param.name} = stoll(trimStr(line));`;
    }

    if (type === 'double' || type === 'float') {
        return `    getline(cin, line);
    double ${param.name} = stod(trimStr(line));`;
    }

    if (type === 'bool') {
        return `    getline(cin, line);
    bool ${param.name} = (trimStr(line) == "true");`;
    }

    if (type === 'string') {
        return `    getline(cin, line);
    string ${param.name} = trimStr(line);
    // Remove quotes if present
    if (${param.name}.size() >= 2 && ${param.name}.front() == '"' && ${param.name}.back() == '"')
        ${param.name} = ${param.name}.substr(1, ${param.name}.size() - 2);`;
    }

    if (type === 'char') {
        return `    getline(cin, line);
    char ${param.name} = trimStr(line)[0];`;
    }

    // Fallback: read as string
    return `    getline(cin, line);
    // TODO: Unsupported type ${param.type}, reading as string
    string ${param.name} = trimStr(line);`;
}

// ─── Main Generator ──────────────────────────────────────────────────────────

/**
 * Generates a complete C++ program from user's function code.
 * Wraps the function with a main() that reads test input from stdin,
 * calls the user's function, and prints formatted output.
 */
export function generateCppDriver(userCode: string): string {
    // If user already has main(), return code as-is (with missing includes added)
    if (hasMainFunction(userCode)) {
        return addMissingIncludes(userCode);
    }

    // Parse the function signature
    const sig = parseFunctionSignature(userCode);
    if (!sig) {
        // Can't parse — add a basic main() stub so it at least compiles
        return addMissingIncludes(userCode) + '\n\nint main() {\n    return 0;\n}\n';
    }

    // Build the includes
    const extraIncludes = getRequiredIncludes(userCode, sig);

    // Build parser helper functions
    const parsers = getParserFunctions(sig);

    // Build main() body
    const paramReads = sig.params.map(p => getParamReadCode(p)).join('\n');
    const paramNames = sig.params.map(p => p.name).join(', ');

    // Function call
    let callCode: string;
    if (sig.isClassMethod) {
        callCode = `    Solution sol;\n    ${sig.returnType === 'void' ? '' : `auto result = `}sol.${sig.functionName}(${paramNames});`;
    } else {
        callCode = `    ${sig.returnType === 'void' ? '' : `auto result = `}${sig.functionName}(${paramNames});`;
    }

    // Output formatting
    const outputCode = sig.returnType === 'void'
        ? '    cout << "void" << endl;'
        : getOutputCode(sig.returnType, 'result');

    // Assemble the final file
    const parts: string[] = [];

    // Extra includes first
    if (extraIncludes.length > 0) {
        parts.push(extraIncludes.join('\n'));
    }

    // User code (preserving their includes and namespace)
    parts.push(userCode);

    // Parser helpers
    parts.push('\n// ── Auto-generated helpers ──');
    parts.push(parsers);

    // Main function
    parts.push(`
// ── Auto-generated driver ──
int main() {
    string line;
${paramReads}

${callCode}

${outputCode}

    return 0;
}`);

    return parts.join('\n');
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Adds commonly missing includes to user code.
 */
function addMissingIncludes(code: string): string {
    const additions: string[] = [];

    // Check for used types that need includes
    if (code.includes('unordered_map') && !code.includes('#include <unordered_map>'))
        additions.push('#include <unordered_map>');
    if (code.includes('unordered_set') && !code.includes('#include <unordered_set>'))
        additions.push('#include <unordered_set>');
    if (code.includes('iostream') || code.includes('cout') || code.includes('cin')) {
        if (!code.includes('#include <iostream>'))
            additions.push('#include <iostream>');
    }
    if (code.includes('stack') && !code.includes('#include <stack>') && !code.includes('stack>'))
        additions.push('#include <stack>');
    if (code.includes('queue') && !code.includes('#include <queue>'))
        additions.push('#include <queue>');
    if (code.includes('algorithm') && !code.includes('#include <algorithm>'))
        additions.push('#include <algorithm>');
    if (code.includes('map<') && !code.includes('unordered_map') && !code.includes('#include <map>'))
        additions.push('#include <map>');
    if (code.includes('set<') && !code.includes('unordered_set') && !code.includes('#include <set>'))
        additions.push('#include <set>');

    if (additions.length === 0) return code;
    return additions.join('\n') + '\n' + code;
}
