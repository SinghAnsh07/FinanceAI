import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Shield } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { formatDate, getErrorMsg } from '../utils/formatters';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonRow } from '../components/ui/Skeleton';
import { EmptyState, ConfirmDialog } from '../components/ui/EmptyState';

const ROLES = ['viewer', 'analyst', 'admin'];

const roleColors = {
  admin:    'badge-danger',
  analyst:  'badge-warning',
  viewer:   'badge-info',
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll({ page, limit: 10 });
      const list = data?.data?.users || data?.data || data?.users || [];
      setUsers(Array.isArray(list) ? list : []);
      setTotalPages(data?.data?.totalPages || data?.totalPages || 1);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      await userService.updateRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.remove(deleteTarget._id);
      toast.success('User deleted.');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-surface-50)' }}>
          User Management
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-surface-400)' }}>
          Manage user accounts and roles
        </p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No users found." />
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                        style={{ background: 'var(--color-primary-600)', color: 'white' }}
                      >
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-surface-100)' }}>
                          {u.name}
                          {u._id === currentUser?._id && (
                            <span className="ml-2 text-xs" style={{ color: 'var(--color-surface-400)' }}>(you)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-surface-400)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${roleColors[u.role?.toLowerCase()] || 'badge-gray'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-surface-400)' }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={u.role?.toLowerCase()}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={updatingRole === u._id || u._id === currentUser?._id}
                        className="input-field py-1 text-xs w-auto"
                        title="Change role"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>

                      {u._id !== currentUser?._id && (
                        <button
                          className="btn btn-ghost btn-sm p-1.5"
                          onClick={() => setDeleteTarget(u)}
                          title="Delete user"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm">
        <ConfirmDialog
          message={`Permanently delete "${deleteTarget?.name}"? All their data will be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      </Modal>
    </div>
  );
}
