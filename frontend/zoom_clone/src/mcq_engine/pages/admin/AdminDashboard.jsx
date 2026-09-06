import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineChartBarSquare,
  HiOutlineSignal,
  HiOutlinePlus,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalTests: 0, totalStudents: 0, totalSubmissions: 0, liveTests: 0,
    recentTests: [], recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/tests/stats/dashboard');
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch { 
      toast.error('Failed to load dashboard stats'); 
    } finally { 
      setLoading(false); 
    }
  };

  const cards = [
    { label: 'Total Tests', value: stats.totalTests || 0, icon: HiOutlineClipboardDocumentList, color: '#0e71eb', bg: 'rgba(14,113,235,0.15)' },
    { label: 'Total Students', value: stats.totalStudents || 0, icon: HiOutlineUsers, color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
    { label: 'Submissions', value: stats.totalSubmissions || 0, icon: HiOutlineChartBarSquare, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Live Tests', value: stats.liveTests || 0, icon: HiOutlineSignal, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }) : '—';

  const getStatusPill = (status) => {
    const map = {
      published: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Published' },
      draft: { bg: 'rgba(255,255,255,0.05)', color: '#a1a1a6', label: 'Draft' },
      active: { bg: 'rgba(14,113,235,0.15)', color: '#0e71eb', label: 'Live' },
    };
    const s = map[status] || map.draft;
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
        background: s.bg, color: s.color,
        borderRadius: 20, padding: '3px 10px',
      }}>{s.label}</span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Admin Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Overview of your test management system</p>
        </div>
        <Link to="/admin/tests/create" className="dms-btn dms-btn-primary dms-btn-sm">
          <HiOutlinePlus size={16} /> Create Test
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 16, padding: 24,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>{card.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginTop: 6 }}>{card.value}</p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Recent Tests */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Tests</h2>
            <Link to="/admin/tests" style={{ fontSize: 12, color: '#0e71eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <HiOutlineArrowRight size={12} />
            </Link>
          </div>
          {(!stats.recentTests || stats.recentTests.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No tests created yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentTests.slice(0, 5).map((t) => (
                <div key={t._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--bg-hover)',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(t.createdAt)}</p>
                  </div>
                  {getStatusPill(t.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Submissions</h2>
            <Link to="/admin/results" style={{ fontSize: 12, color: '#0e71eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <HiOutlineArrowRight size={12} />
            </Link>
          </div>
          {(!stats.recentSubmissions || stats.recentSubmissions.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No submissions yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentSubmissions.slice(0, 5).map((s) => (
                <div key={s._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--bg-hover)',
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.studentId?.name || 'Student'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.testId?.title || 'Test'} · {formatDate(s.submittedAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 12 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: (s.percentage || 0) >= 40 ? '#10b981' : '#ef4444',
                    }}>{s.percentage}%</span>
                    {s.autoSubmitted && (
                      <span style={{
                        display: 'block', fontSize: 9, fontWeight: 700, color: '#ef4444',
                        marginTop: 2, letterSpacing: 1,
                      }}>AUTO</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
