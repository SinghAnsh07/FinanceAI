
const VALID_TYPES = ['income', 'expense'];
const VALID_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Food', 'Transport',
  'Housing', 'Entertainment', 'Health', 'Education', 'Shopping', 'Other',
];

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows.');

  const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

  const required = ['title', 'amount', 'type', 'category', 'date'];
  const missing = required.filter((f) => !rawHeaders.includes(f));
  if (missing.length) {
    throw new Error(`CSV is missing required columns: ${missing.join(', ')}`);
  }

  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = splitCSVLine(line);
    const row = {};
    rawHeaders.forEach((h, idx) => {
      row[h] = (values[idx] ?? '').trim().replace(/^"|"$/g, '');
    });

    const rowErrors = [];

    if (!row.title) rowErrors.push('title is required');
    const amount = parseFloat(row.amount);
    if (isNaN(amount) || amount <= 0) rowErrors.push('amount must be a positive number');
    const type = row.type?.toLowerCase();
    if (!VALID_TYPES.includes(type)) rowErrors.push(`type must be "income" or "expense"`);
    if (!row.category) rowErrors.push('category is required');
    if (row.category && !VALID_CATEGORIES.includes(row.category)) {
      rowErrors.push(`category "${row.category}" is not valid`);
    }
    if (!row.date) rowErrors.push('date is required');
    else if (isNaN(Date.parse(row.date))) rowErrors.push('date must be a valid date (YYYY-MM-DD)');

    if (rowErrors.length) {
      errors.push({ row: i, errors: rowErrors, raw: row });
    } else {
      rows.push({
        title:    row.title,
        amount:   amount,
        type:     type,
        category: row.category,
        date:     row.date,
        notes:    row.notes || '',
      });
    }
  }

  return { rows, errors };
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function downloadCSVTemplate() {
  const header = 'title,amount,type,category,date,notes';
  const example = [
    'Monthly Salary,5000,income,Salary,2024-04-01,April salary',
    'Monthly Rent,1200,expense,Housing,2024-04-02,Rent for April',
    'Groceries,150,expense,Food,2024-04-03,',
  ].join('\n');
  const csv = `${header}\n${example}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
