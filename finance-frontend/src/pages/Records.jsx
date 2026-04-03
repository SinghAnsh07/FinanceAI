import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Download, Upload, Search, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { recordService } from '../services/recordService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getErrorMsg } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonRow } from '../components/ui/Skeleton';
import { EmptyState, ConfirmDialog } from '../components/ui/EmptyState';
import { exportToCSV } from '../utils/exportCSV';
import { parseCSV, downloadCSVTemplate } from '../utils/importCSV';

const CATEGORIES = ['Salary','Freelance','Investment','Food','Transport','Housing','Entertainment','Health','Education','Shopping','Other'];
const TYPES = ['income', 'expense'];

const schema = yup.object({
  title:    yup.string().required('Title is required'),
  amount:   yup.number().positive('Must be positive').required('Amount is required'),
  type:     yup.string().oneOf(TYPES).required('Type is required'),
  category: yup.string().required('Category is required'),
  date:     yup.string().required('Date is required'),
  notes:    yup.string(),
});

function RecordForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-surface-300)' }}>Title</label>
          <input {...register('title')} placeholder="e.g. Monthly Rent"
            className="input-field" />
          {errors.title && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-surface-300)' }}>Amount ($)</label>
          <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
            className="input-field" />
          {errors.amount && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-surface-300)' }}>Date</label>
          <input {...register('date')} type="date" className="input-field" />
          {errors.date && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-surface-300)' }}>Type</label>
          <select {...register('type')} className="input-field">
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-surface-300)' }}>Category</label>
          <select {...register('category')} className="input-field">
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.category.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-surface-300)' }}>Notes (optional)</label>
          <textarea {...register('notes')} rows={2} placeholder="Add a note…"
            className="input-field resize-none" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Record'}
        </button>
      </div>
    </form>
  );
}

function ImportModal({ open, onClose, onImported }) {
  const fileRef = useRef();
  const [dragging, setDragging]   = useState(false);
  const [parsed, setParsed]       = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress]   = useState({ done: 0, total: 0 });

  const reset = () => { setParsed(null); setProgress({ done: 0, total: 0 }); };
  const handleClose = () => { reset(); onClose(); };

  const processFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = parseCSV(e.target.result);
        setParsed(result);
      } catch (err) {
        toast.error(err.message);
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!parsed?.rows?.length) return;
    setImporting(true);
    const total = parsed.rows.length;
    setProgress({ done: 0, total });
    let succeeded = 0;
    let failed = 0;
    for (const row of parsed.rows) {
      try {
        await recordService.create(row);
        succeeded++;
      } catch {
        failed++;
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setImporting(false);
    if (succeeded > 0) {
      toast.success(`Imported ${succeeded} record${succeeded > 1 ? 's' : ''}${failed ? ` (${failed} failed)` : ''}`);
      onImported();
      handleClose();
    } else {
      toast.error('All rows failed to import. Check your data.');
    }
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Modal open={open} onClose={handleClose} title="Import CSV" size="lg">
      <div className="space-y-4">
        {!parsed ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors"
              style={{
                borderColor: dragging ? 'var(--color-primary-500)' : 'var(--color-surface-600)',
                background: dragging ? 'var(--color-primary-500)1a' : 'var(--color-surface-800)',
              }}
            >
              <Upload size={32} style={{ color: 'var(--color-primary-400)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-surface-200)' }}>
                {dragging ? 'Drop it here!' : 'Drag & drop a CSV file, or click to browse'}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-surface-500)' }}>
                Columns required: title, amount, type, category, date
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => processFile(e.target.files[0])}
              />
            </div>
            <button
              onClick={downloadCSVTemplate}
              className="btn btn-ghost btn-sm flex items-center gap-2 mx-auto"
              style={{ color: 'var(--color-primary-400)' }}
            >
              <FileText size={14} /> Download template CSV
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: 'var(--color-surface-300)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-success)' }}>
                  {parsed.rows.length} valid row{parsed.rows.length !== 1 ? 's' : ''}
                </span>
                {parsed.errors.length > 0 && (
                  <span className="ml-2" style={{ color: 'var(--color-danger)' }}>
                    · {parsed.errors.length} row{parsed.errors.length !== 1 ? 's' : ''} with errors (will be skipped)
                  </span>
                )}
              </div>
              <button onClick={reset} className="btn btn-ghost btn-sm p-1">
                <X size={14} /> Change file
              </button>
            </div>

            {parsed.errors.length > 0 && (
              <div
                className="rounded-lg p-3 space-y-1.5 max-h-32 overflow-y-auto text-xs"
                style={{ background: 'var(--color-danger)15', border: '1px solid var(--color-danger)40' }}
              >
                {parsed.errors.map((e) => (
                  <div key={e.row} className="flex gap-2">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--color-danger)' }} />
                    <span style={{ color: 'var(--color-surface-300)' }}>
                      Row {e.row}: {e.errors.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-surface-700)' }}>
              <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-800)', color: 'var(--color-surface-400)' }}>
                    {['Title','Amount','Type','Category','Date','Notes'].map((h) => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 8).map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--color-surface-700)', color: 'var(--color-surface-300)' }}>
                      <td style={{ padding: '5px 10px' }}>{r.title}</td>
                      <td style={{ padding: '5px 10px' }}>{r.amount}</td>
                      <td style={{ padding: '5px 10px' }}>
                        <span className={`badge ${r.type === 'income' ? 'badge-success' : 'badge-danger'}`}>{r.type}</span>
                      </td>
                      <td style={{ padding: '5px 10px' }}>{r.category}</td>
                      <td style={{ padding: '5px 10px' }}>{r.date}</td>
                      <td style={{ padding: '5px 10px', color: 'var(--color-surface-500)' }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 8 && (
                <p className="text-center py-2 text-xs" style={{ color: 'var(--color-surface-500)', borderTop: '1px solid var(--color-surface-700)' }}>
                  ...and {parsed.rows.length - 8} more rows
                </p>
              )}
            </div>

            {importing && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs" style={{ color: 'var(--color-surface-400)' }}>
                  <span>Importing...</span>
                  <span>{progress.done} / {progress.total}</span>
                </div>
                <div className="rounded-full h-2 overflow-hidden" style={{ background: 'var(--color-surface-700)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: 'var(--color-primary-500)' }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={handleClose} className="btn btn-secondary btn-sm">Cancel</button>
              <button
                onClick={handleImport}
                disabled={importing || !parsed.rows.length}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <CheckCircle size={14} />
                {importing ? `Importing ${progress.done}/${progress.total}…` : `Import ${parsed.rows.length} Record${parsed.rows.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function Records() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch]       = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat]  = useState('');
  const [startDate, setStartDate]  = useState('');
  const [endDate, setEndDate]      = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [addOpen, setAddOpen]         = useState(false);
  const [importOpen, setImportOpen]   = useState(false);
  const [editRecord, setEditRecord]   = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, limit: 10,
        ...(filterType  && { type: filterType }),
        ...(filterCat   && { category: filterCat }),
        ...(startDate   && { startDate }),
        ...(endDate     && { endDate }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };
      const { data } = await recordService.getAll(params);
      const records = data?.data?.records || data?.data || data?.records || [];
      setRecords(Array.isArray(records) ? records : []);
      const total = data?.data?.totalPages || data?.totalPages || 1;
      setTotalPages(total);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterCat, startDate, endDate, debouncedSearch]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleAdd = async (values) => {
    setSaving(true);
    try {
      await recordService.create(values);
      toast.success('Record added!');
      setAddOpen(false);
      fetchRecords();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleEdit = async (values) => {
    setSaving(true);
    try {
      await recordService.update(editRecord._id, values);
      toast.success('Record updated!');
      setEditRecord(null);
      fetchRecords();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await recordService.remove(deleteRecord._id);
      toast.success('Record deleted.');
      setDeleteRecord(null);
      fetchRecords();
    } catch (err) { toast.error(getErrorMsg(err)); }
    finally { setDeleting(false); }
  };

  const handleExport = () => {
    const rows = records.map(r => ({
      Title: r.title,
      Type: r.type,
      Category: r.category,
      Amount: r.amount,
      Date: formatDate(r.date),
      Notes: r.notes || '',
    }));
    exportToCSV(rows, 'financial-records.csv');
    toast.success('Exported!');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-surface-50)' }}>
            Financial Records
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-surface-400)' }}>
            Manage all your income and expense records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
          {isAdmin && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setImportOpen(true)}>
                <Upload size={15} /> Import CSV
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
                <Plus size={15} /> Add Record
              </button>
            </>
          )}
        </div>
      </div>
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-surface-400)' }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search records…"
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCat}
            onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input type="date" value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="input-field py-2 text-sm w-auto" placeholder="From" />

          <input type="date" value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="input-field py-2 text-sm w-auto" placeholder="To" />

          {(filterType || filterCat || startDate || endDate || search) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setFilterType(''); setFilterCat(''); setStartDate(''); setEndDate(''); setSearch(''); setPage(1); }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={isAdmin ? 6 : 5} />
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5}>
                  <EmptyState message="No records found. Try adjusting filters." />
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="font-medium" style={{ color: 'var(--color-surface-100)' }}>
                      {r.title}
                    </div>
                    {r.notes && (
                      <div className="text-xs mt-0.5 truncate max-w-xs"
                        style={{ color: 'var(--color-surface-500)' }}>
                        {r.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${r.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-gray">{r.category}</span>
                  </td>
                  <td>
                    <span
                      className="font-semibold"
                      style={{ color: r.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}
                    >
                      {r.type === 'expense' ? '-' : '+'}{formatCurrency(r.amount)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-surface-400)' }}>
                    {formatDate(r.date)}
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="btn btn-ghost btn-sm p-1.5"
                          onClick={() => setEditRecord(r)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm p-1.5"
                          onClick={() => setDeleteRecord(r)}
                          title="Delete"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Financial Record">
        <RecordForm onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={!!editRecord} onClose={() => setEditRecord(null)} title="Edit Record">
        {editRecord && (
          <RecordForm
            onSubmit={handleEdit}
            loading={saving}
            defaultValues={{
              ...editRecord,
              date: editRecord.date?.split('T')[0],
            }}
          />
        )}
      </Modal>
      <Modal open={!!deleteRecord} onClose={() => setDeleteRecord(null)} title="Delete Record" size="sm">
        <ConfirmDialog
          message={`Delete "${deleteRecord?.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteRecord(null)}
          loading={deleting}
        />
      </Modal>
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={fetchRecords}
      />
    </div>
  );
}
