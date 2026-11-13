/**
 * 风火GEO · weekly-monitor.yml 纯 node 静态检查（零第三方依赖）
 *
 * 本机 python 没有 PyYAML，故不依赖 python -c 'import yaml'。
 * 检查项：制表符 / 缩进（偶数空格层级）/ 冒号与列表语法 / 引号配对 /
 * 结构树构建（缩进回退到已存在的层级）/ 必需键与关键值。
 *
 * 用法：node core/scripts/validate-workflow.mjs [path]
 * 退出码：0 = 通过，1 = 发现问题。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NL = String.fromCharCode(10);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const DEFAULT = path.join(ROOT, '.github', 'workflows', 'weekly-monitor.yml');

const REQUIRED_TOP = ['name', 'on', 'permissions', 'jobs'];

function stripComment(line) {
  let out = '';
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      out += c;
      if (c === q) q = null;
      continue;
    }
    if (c === String.fromCharCode(39) || c === '"') {
      q = c;
      out += c;
      continue;
    }
    if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) break;
    out += c;
  }
  return out;
}

function quotesBalanced(text) {
  const s = stripComment(text);
  let sq = 0;
  let dq = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === String.fromCharCode(39)) sq++;
    else if (s[i] === '"') dq++;
  }
  const dollarBrace = (s.match(/\{\{/g) || []).length;
  const braceClose = (s.match(/\}\}/g) || []).length;
  return sq % 2 === 0 && dq % 2 === 0 && dollarBrace === braceClose;
}

/** 构建缩进树：每行的父必须是「缩进更小且已出现过」的层级，否则判为坏缩进。 */
function checkIndentTree(lines, errors) {
  const stack = [{ indent: -1, line: 0 }];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = stripComment(raw).trimEnd();
    if (!t.trim()) continue;
    const m = t.match(/^( *)/);
    const indent = m ? m[1].length : 0;
    if (indent % 2 !== 0) errors.push('第 ' + (i + 1) + ' 行：缩进 ' + indent + ' 不是偶数空格（YAML 建议 2 空格层级）');
    while (stack.length > 1 && indent < stack[stack.length - 1].indent) stack.pop();
    const top = stack[stack.length - 1];
    if (indent === top.indent) {
      // 同级：保留
    } else if (indent > top.indent) {
      stack.push({ indent, line: i + 1 });
    } else {
      errors.push('第 ' + (i + 1) + ' 行：缩进 ' + indent + ' 回退到了不存在的层级');
    }
  }
}

/** 检查 key: value 语法（跳过列表项、块标量 | / >、纯文本）。 */
function checkColonSyntax(lines, errors) {
  for (let i = 0; i < lines.length; i++) {
    const t = stripComment(lines[i]).trim();
    if (!t) continue;
    if (t.startsWith('- ')) {
      const item = t.slice(2);
      if (/^[^:]+:\s*$/.test(item)) continue; // "- name: x" 之后另有嵌套，合法
      continue;
    }
    if (/^[^:]+:\s*[|>][-+]?\s*$/.test(t)) continue; // 块标量
    const ci = t.indexOf(':');
    if (ci > 0) {
      const after = t.slice(ci + 1).trim();
      // key: 后若为空，允许（嵌套映射）；否则必须有值
      if (after && /:\s*$/.test(t)) errors.push('第 ' + (i + 1) + ' 行：冒号后缺值');
    }
  }
}

function parseKeys(lines) {
  const top = {};
  let cur = top;
  const stack = [{ indent: -1, obj: top }];
  for (const raw of lines) {
    const t = stripComment(raw).trimEnd();
    if (!t.trim()) continue;
    const indent = (t.match(/^( *)/) || ['', ''])[1].length;
    const body = t.trim();
    if (body.startsWith('- ')) continue;
    const ci = body.indexOf(':');
    if (ci < 0) continue;
    const key = body.slice(0, ci).trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    cur = stack[stack.length - 1].obj;
    cur[key] = {};
    stack.push({ indent, obj: cur[key] });
  }
  return top;
}

export function validate(text) {
  const errors = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('\t')) errors.push('第 ' + (i + 1) + ' 行：含制表符（YAML 禁止 tab 缩进）');
    if (!quotesBalanced(lines[i])) errors.push('第 ' + (i + 1) + ' 行：引号 / 表达式花括号不配对');
  }

  checkIndentTree(lines, errors);
  checkColonSyntax(lines, errors);

  const tree = parseKeys(lines);
  for (const k of REQUIRED_TOP) {
    if (!(k in tree)) errors.push('缺少顶层键：' + k);
  }

  // 关键值抽查
  const checks = [
    [/cron:\s*'0 1 \* \* 1'/, 'schedule cron 必须为 0 1 * * 1'],
    [/workflow_dispatch:/, '必须有 workflow_dispatch'],
    [/contents:\s*write/, 'permissions.contents 必须为 write'],
    [/pull-requests:\s*write/, 'permissions.pull-requests 必须为 write'],
    [/node-version:\s*'22'/, 'setup-node 必须是 22'],
    [/pnpm@10/, '必须启用 pnpm 10'],
    [/run:\s*pnpm monitor/, '必须执行 pnpm monitor'],
    [/run:\s*pnpm sync/, '必须执行 pnpm sync'],
    [/peter-evans\/create-pull-request@v6/, '必须用 create-pull-request@v6'],
    [/GEO_BUDGET_CNY:\s*'5'/, '预算必须为 5'],
    [/core\/data\/latest-report\.json/, 'PR 必须包含 latest-report.json'],
    [/site\/app\/data\/monitor\.json/, 'PR 必须包含 site monitor.json'],
    [/site\/public\/kernel\/llms\.txt/, 'PR 必须包含 kernel/llms.txt'],
  ];
  for (const [re, msg] of checks) {
    if (!re.test(text)) errors.push('关键内容缺失：' + msg);
  }

  return { ok: errors.length === 0, errors, topKeys: Object.keys(tree) };
}

export function main(argv = process.argv.slice(2)) {
  const target = argv[0] ? path.resolve(argv[0]) : DEFAULT;
  if (!fs.existsSync(target)) {
    console.error('[validate-workflow] 找不到文件：' + target);
    process.exitCode = 1;
    return null;
  }
  const text = fs.readFileSync(target, 'utf8');
  const r = validate(text);
  console.log('[validate-workflow] ' + target);
  console.log('  顶层键：' + r.topKeys.join(', '));
  if (r.ok) {
    console.log('  结论：静态检查通过（制表符 / 缩进 / 冒号 / 列表 / 引号 / 结构 / 关键值 均 OK）');
  } else {
    console.log('  结论：发现 ' + r.errors.length + ' 个问题');
    for (const e of r.errors) console.log('   - ' + e);
    process.exitCode = 1;
  }
  return r;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
