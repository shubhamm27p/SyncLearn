import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import ConfirmModal from '../../components/ConfirmModal';
import SendTestModal from '../../components/SendTestModal';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineKey,
  HiOutlineChartBarSquare,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineCodeBracketSquare,
  HiOutlinePaperAirplane,
} from 'react-icons/hi2';

const ManageTests = () => {
  const { theme } = useTheme();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [sendModal, setSendModal] = useState({ open: false, test: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await API.get('/tests');
      if (res.data?.data) {
        setTests(res.data.data);
      }
    } catch (err) {
      console.warn("ManageTests API unavailable, loading local database:", err);
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      setTests(localTests);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id, title) => setDeleteModal({ open: true, id, title });
  const closeDeleteModal = () => setDeleteModal({ open: false, id: null, title: '' });

  const openSendModal = (test) => setSendModal({ open: true, test });
  const closeSendModal = () => setSendModal({ open: false, test: null });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/tests/${deleteModal.id}`);
      toast.success('Test deleted');
      setTests(tests.filter((t) => t._id !== deleteModal.id));
      closeDeleteModal();
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const getTestStatus = (test) => {
    const now = new Date();
    const start = test.startTime ? new Date(test.startTime) : null;
    const end = test.endTime ? new Date(test.endTime) : null;

    if (test.status === 'draft') return { label: 'Draft', bg: 'rgba(255,255,255,0.05)', color: '#a1a1a6', border: '1px solid #333338' };
    if (start && end && now >= start && now <= end) return { label: 'Live', bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' };
    if (start && now < start) return { label: 'Upcoming', bg: 'rgba(14,113,235,0.15)', color: '#0e71eb', border: '1px solid rgba(14,113,235,0.3)' };
    if (end && now > end) return { label: 'Ended', bg: 'rgba(255,255,255,0.05)', color: '#a1a1a6', border: '1px solid #333338' };
    if (test.status === 'published') return { label: 'Published', bg: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' };
    return { label: test.status || 'Draft', bg: 'rgba(255,255,255,0.05)', color: '#a1a1a6', border: '1px solid #333338' };
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  };

  const filtered = tests.filter((t) =>
    (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Manage Tests
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '0' }}>
            {tests.length} test{tests.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          to="/admin/tests/create"
          className="dms-btn dms-btn-primary"
        >
          <HiOutlinePlus size={16} /> Create Test
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests..."
            className="dms-input"
            style={{ paddingLeft: '40px' }}
          />
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            display: 'flex'
          }}>
            <HiOutlineMagnifyingGlass size={16} />
          </span>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Test Name</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Start / End</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Duration</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Qs</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '15px' }}>
                    {search ? 'No tests match your search' : 'No tests created yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((test) => {
                  const status = getTestStatus(test);
                  return (
                    <tr key={test._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{test.title}</span>
                          
                          {test.testType === 'coding' && (
                            <span style={{
                              background: 'rgba(168,85,247,0.15)',
                              color: '#a855f7',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              💻 CODING
                            </span>
                          )}
                          
                          {test.testType === 'combined' && (
                            <span style={{
                              background: 'rgba(59,130,246,0.15)',
                              color: '#3b82f6',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              🎯 MCQ + CODE
                            </span>
                          )}
                          
                          {(!test.testType || test.testType === 'mcq') && (
                            <span style={{
                              background: 'var(--bg-hover)',
                              color: 'var(--text-muted)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              📝 MCQ
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{test.subject}</p>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: '0 0 2px' }}>{formatDateTime(test.startTime)}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{formatDateTime(test.endTime)}</p>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span>{test.duration}m</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span>{test.questionCount || 0}</span>
                        {test.hasAnswerKey && <span style={{ marginLeft: '4px', color: '#10b981', fontSize: '12px' }}>✓</span>}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{
                          background: status.bg,
                          color: status.color,
                          border: status.border,
                          borderRadius: '20px',
                          padding: '3px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button onClick={() => openSendModal(test)} title="Send Test to Students"
                            style={{ background: 'rgba(14,113,235,0.15)', border: '1px solid rgba(14,113,235,0.3)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#0e71eb', display: 'flex' }}
                          >
                            <HiOutlinePaperAirplane size={16} />
                          </button>
                          <Link to={`/admin/tests/${test._id}/edit`} title="Edit"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                          >
                            <HiOutlinePencilSquare size={16} />
                          </Link>
                          <Link to={`/admin/tests/${test._id}/questions`} title="Questions"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                          >
                            <HiOutlineDocumentText size={16} />
                          </Link>
                          <Link to={`/admin/tests/${test._id}/answerkey`} title="Answer Key"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                          >
                            <HiOutlineKey size={16} />
                          </Link>
                          <Link to={`/admin/results?testId=${test._id}`} title="Results"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                          >
                            <HiOutlineChartBarSquare size={16} />
                          </Link>
                          <Link to={`/admin/tests/${test._id}/coding`} title="Coding Problems"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                          >
                            <HiOutlineCodeBracketSquare size={16} />
                          </Link>
                          <button onClick={() => openDeleteModal(test._id, test.title)} title="Delete"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Test?"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
        confirmText="Delete Test"
        variant="danger"
        loading={deleting}
      />

      <SendTestModal
        isOpen={sendModal.open}
        onClose={closeSendModal}
        test={sendModal.test}
      />
    </div>
  );
};

export default ManageTests;
