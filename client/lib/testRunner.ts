// ─── Test Runner Generator ───────────────────────────────────────────────────
// Generates language-specific test harness code from question metadata.
// The harness calls the user's function with test inputs, compares outputs,
// and prints structured results that the frontend can parse.

export type ValType = 'int' | 'int[]' | 'string' | 'bool';

export interface TestCase {
    id: number;
    input: string;       // Display text, e.g. "nums = [2,7,11,15], target = 9"
    inputs: any[];       // Actual values matching params order
    expected: any;       // Expected return value
}

export interface QuestionMeta {
    functionName: { cpp: string; python: string; java: string };
    returnType: ValType;
    params: { name: string; type: ValType }[];
    testCases: TestCase[];
}

export interface TestResult {
    id: number;
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
}

// ─── Parse structured test output from stdout ────────────────────────────────
export function parseTestResults(stdout: string): { results: TestResult[]; passed: number; total: number } | null {
    const lines = stdout.split('\n');
    const results: TestResult[] = [];
    let passed = 0, total = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('__TEST__')) {
            const parts = trimmed.split('|~|');
            if (parts.length >= 6) {
                const id = parseInt(parts[1]);
                const status = parts[2];
                results.push({
                    id,
                    passed: status === 'PASSED',
                    input: parts[3],
                    expected: parts[4],
                    actual: parts.slice(5).join('|~|'),
                });
            }
        } else if (trimmed.startsWith('__SUMMARY__')) {
            const parts = trimmed.split('|~|');
            passed = parseInt(parts[1]);
            total = parseInt(parts[2]);
        }
    }

    if (results.length === 0) return null;
    return { results, passed, total };
}

// ═══════════════════════════════════════════════════════════════════════════════
// C++ GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function cppLiteral(type: ValType, value: any): string {
    switch (type) {
        case 'int': return String(value);
        case 'bool': return value ? 'true' : 'false';
        case 'string': return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        case 'int[]': return `{${(value as number[]).join(',')}}`;
    }
}

function cppTypeName(type: ValType): string {
    switch (type) {
        case 'int': return 'int';
        case 'bool': return 'bool';
        case 'string': return 'string';
        case 'int[]': return 'vector<int>';
    }
}

function cppToStr(type: ValType, v: string): string {
    switch (type) {
        case 'int': return `to_string(${v})`;
        case 'bool': return `string(${v}?"true":"false")`;
        case 'string': return v;
        case 'int[]': return `_v2s(${v})`;
    }
}

function generateCppRunner(meta: QuestionMeta): string {
    const fn = meta.functionName.cpp;
    const hasVec = meta.returnType === 'int[]' || meta.params.some(p => p.type === 'int[]');
    const hasStr = meta.returnType === 'string' || meta.params.some(p => p.type === 'string');

    let code = '\n// ═══ Auto-generated Test Runner ═══\n';
    if (hasStr) code += '#include <string>\n';
    code += '#include <iostream>\nusing namespace std;\n';

    if (hasVec) {
        code += 'string _v2s(vector<int> v){string s="[";for(int i=0;i<(int)v.size();i++){if(i)s+=", ";s+=to_string(v[i]);}return s+"]";}\n';
    }

    code += `int main(){\n    int _p=0;\n`;

    for (const tc of meta.testCases) {
        code += '    {\n';
        // Declare params
        for (let i = 0; i < meta.params.length; i++) {
            const p = meta.params[i];
            code += `        ${cppTypeName(p.type)} ${p.name}=${cppLiteral(p.type, tc.inputs[i])};\n`;
        }
        // Call function
        const args = meta.params.map(p => p.name).join(',');
        code += `        ${cppTypeName(meta.returnType)} _r=${fn}(${args});\n`;
        code += `        ${cppTypeName(meta.returnType)} _e=${cppLiteral(meta.returnType, tc.expected)};\n`;
        code += `        bool _ok=(_r==_e); if(_ok)_p++;\n`;
        const escapedInput = tc.input.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        code += `        cout<<"__TEST__|~|${tc.id}|~|"<<(_ok?"PASSED":"FAILED")<<"|~|${escapedInput}|~|"<<${cppToStr(meta.returnType, '_e')}<<"|~|"<<${cppToStr(meta.returnType, '_r')}<<endl;\n`;
        code += '    }\n';
    }

    code += `    cout<<"__SUMMARY__|~|"<<_p<<"|~|${meta.testCases.length}"<<endl;\n`;
    code += '    return 0;\n}\n';
    return code;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PYTHON GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function pyLiteral(type: ValType, value: any): string {
    switch (type) {
        case 'int': return String(value);
        case 'bool': return value ? 'True' : 'False';
        case 'string': return `"${String(value)}"`;
        case 'int[]': return `[${(value as number[]).join(', ')}]`;
    }
}

function generatePythonRunner(meta: QuestionMeta): string {
    const fn = meta.functionName.python;
    let code = '\n# ═══ Auto-generated Test Runner ═══\n';
    code += '_p = 0\n';

    for (const tc of meta.testCases) {
        const args = tc.inputs.map((v, i) => pyLiteral(meta.params[i].type, v)).join(', ');
        code += `_r = ${fn}(${args})\n`;
        code += `_e = ${pyLiteral(meta.returnType, tc.expected)}\n`;
        code += `_ok = _r == _e\n`;
        code += `if _ok: _p += 1\n`;
        const dispInput = tc.input.replace(/\\/g, '\\\\');
        code += `print(f"__TEST__|~|${tc.id}|~|{'PASSED' if _ok else 'FAILED'}|~|${dispInput}|~|{_e}|~|{_r}")\n`;
    }

    code += `print(f"__SUMMARY__|~|{_p}|~|${meta.testCases.length}")\n`;
    return code;
}

// ═══════════════════════════════════════════════════════════════════════════════
// JAVA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function javaLiteral(type: ValType, value: any): string {
    switch (type) {
        case 'int': return String(value);
        case 'bool': return value ? 'true' : 'false';
        case 'string': return `"${String(value)}"`;
        case 'int[]': return `new int[]{${(value as number[]).join(',')}}`;
    }
}

function javaTypeName(type: ValType): string {
    switch (type) {
        case 'int': return 'int';
        case 'bool': return 'boolean';
        case 'string': return 'String';
        case 'int[]': return 'int[]';
    }
}

function javaToStr(type: ValType, v: string): string {
    switch (type) {
        case 'int': return `String.valueOf(${v})`;
        case 'bool': return `String.valueOf(${v})`;
        case 'string': return v;
        case 'int[]': return `java.util.Arrays.toString(${v})`;
    }
}

function javaCompare(type: ValType, a: string, b: string): string {
    switch (type) {
        case 'int':
        case 'bool': return `${a}==${b}`;
        case 'string': return `${a}.equals(${b})`;
        case 'int[]': return `java.util.Arrays.equals(${a},${b})`;
    }
}

function generateJavaRunner(meta: QuestionMeta): string {
    const fn = meta.functionName.java;
    let code = '\n// ═══ Auto-generated Test Runner ═══\n';
    code += 'public class Main {\n';
    code += '    public static void main(String[] args) {\n';
    code += '        Solution sol = new Solution();\n';
    code += '        int _p = 0;\n';

    for (const tc of meta.testCases) {
        code += '        {\n';
        for (let i = 0; i < meta.params.length; i++) {
            const p = meta.params[i];
            code += `            ${javaTypeName(p.type)} ${p.name} = ${javaLiteral(p.type, tc.inputs[i])};\n`;
        }
        const args = meta.params.map(p => p.name).join(', ');
        code += `            ${javaTypeName(meta.returnType)} _r = sol.${fn}(${args});\n`;
        code += `            ${javaTypeName(meta.returnType)} _e = ${javaLiteral(meta.returnType, tc.expected)};\n`;
        code += `            boolean _ok = ${javaCompare(meta.returnType, '_r', '_e')};\n`;
        code += `            if (_ok) _p++;\n`;
        const escapedInput = tc.input.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        code += `            System.out.println("__TEST__|~|${tc.id}|~|" + (_ok?"PASSED":"FAILED") + "|~|${escapedInput}|~|" + ${javaToStr(meta.returnType, '_e')} + "|~|" + ${javaToStr(meta.returnType, '_r')});\n`;
        code += '        }\n';
    }

    code += `        System.out.println("__SUMMARY__|~|" + _p + "|~|${meta.testCases.length}");\n`;
    code += '    }\n}\n';
    return code;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════
export function generateTestRunner(language: string, meta: QuestionMeta): string {
    switch (language) {
        case 'CPP': return generateCppRunner(meta);
        case 'PYTHON': return generatePythonRunner(meta);
        case 'JAVA': return generateJavaRunner(meta);
        default: return '';
    }
}
