import { useState } from 'react';
import { UserPlus, ToggleLeft, ToggleRight, Search, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useUsers, useSetUserEnabled, useDeleteUser } from '../../hooks/useApi';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function UserManagement() {
  const [tab, setTab]       = useState<'STUDENT' | 'SUPERVISOR'>('STUDENT');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: studentsPage,    isLoading: studentsLoading }    = useUsers({ role: 'STUDENT',    size: 100 });
  const { data: supervisorsPage, isLoading: supervisorsLoading } = useUsers({ role: 'SUPERVISOR', size: 100 });

  const setEnabled = useSetUserEnabled();
  const deleteUser = useDeleteUser();

  // No client-side role filter needed — each query already targets the right role
  const raw = (tab === 'STUDENT' ? studentsPage : supervisorsPage)?.content ?? [];
  const users = raw.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.matricule ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const studentCount    = studentsPage?.totalElements    ?? 0;
  const supervisorCount = supervisorsPage?.totalElements ?? 0;
  const isLoading = tab === 'STUDENT' ? studentsLoading : supervisorsLoading;

  const handleToggle = async (id: number, enabled: boolean) => {
    setActionError(null);
    try {
      await setEnabled.mutateAsync({ id, enabled });
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? 'Failed to update user status.');
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setActionError(null);
    try {
      await deleteUser.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      setDeleteId(null);
      setActionError(err?.response?.data?.message ?? 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{studentCount} students · {supervisorCount} supervisors</p>
        </div>
        <button className="btn-primary text-sm flex-shrink-0">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 p-3 bg-danger/8 rounded-lg border border-danger/20">
          <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className="text-xs text-danger">{actionError}</p>
        </div>
      )}

      {/* Role tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(['STUDENT', 'SUPERVISOR'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setSearch(''); }}
            className={`px-5 py-2 rounded-md text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'STUDENT' ? 'Students' : 'Supervisors'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search users…" value={search}
          onChange={e => setSearch(e.target.value)} className="input pl-9" />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Name</th>
                  {tab === 'STUDENT' && (
                    <>
                      <th className="table-header hidden sm:table-cell">Matricule</th>
                      <th className="table-header hidden md:table-cell">Dept / Year</th>
                      <th className="table-header hidden lg:table-cell">Phone</th>
                    </>
                  )}
                  {tab === 'SUPERVISOR' && (
                    <>
                      <th className="table-header hidden md:table-cell">Specialization</th>
                      <th className="table-header hidden lg:table-cell">Office</th>
                    </>
                  )}
                  <th className="table-header hidden lg:table-cell">Email</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-sm text-primary">
                      {u.firstName} {u.lastName}
                    </td>
                    {tab === 'STUDENT' && (
                      <>
                        <td className="table-cell hidden sm:table-cell text-xs font-mono text-gray-500">{u.matricule ?? '—'}</td>
                        <td className="table-cell hidden md:table-cell text-xs text-gray-500">
                          {u.department ?? '—'} {u.yearOfStudy ? `· Yr ${u.yearOfStudy}` : ''}
                        </td>
                        <td className="table-cell hidden lg:table-cell text-xs text-gray-400">{u.phoneNumber ?? '—'}</td>
                      </>
                    )}
                    {tab === 'SUPERVISOR' && (
                      <>
                        <td className="table-cell hidden md:table-cell text-xs text-gray-500">{u.specialization ?? '—'}</td>
                        <td className="table-cell hidden lg:table-cell text-xs text-gray-400">{u.officeNumber ?? '—'}</td>
                      </>
                    )}
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-400">{u.email}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.enabled ? 'text-success' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.enabled ? 'bg-success' : 'bg-gray-300'}`} />
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(u.id, !u.enabled)}
                          disabled={setEnabled.isPending}
                          title={u.enabled ? 'Disable user' : 'Enable user'}
                          className={`transition-colors ${u.enabled ? 'text-success hover:text-gray-400' : 'text-gray-300 hover:text-success'}`}>
                          {u.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                        <button
                          onClick={() => setDeleteId(u.id)}
                          title="Delete user"
                          className="p-1.5 rounded-md text-gray-300 hover:text-danger hover:bg-danger/8 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">No users found</div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete User"
        description="This will permanently delete the user and all their data. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)} />
    </div>
  );
}
