import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const MyResults = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await API.get('/student/results');
      if (res.data?.data) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.warn("MyResults API unavailable, loading local results:", err);
      const localSubmissions = JSON.parse(localStorage.getItem('viora_test_submissions_db') || '[]');
      setResults(localSubmissions);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const formatTime = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Results</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>{results.length} test{results.length !== 1 ? 's' : ''} attempted</p>
      </div>

      {results.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>
            No results yet
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Take a test to see your scores here
          </p>
          <button
            className="dms-btn dms-btn-primary"
            onClick={() => navigate('/tests')}
          >
            Browse Available Tests →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {results.map((r) => {
            const pass = (r.percentage || 0) >= 40;
            return (
              <div
                key={r._id}
                onClick={() => navigate(`/student/results/${r._id}`)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.testId?.title || 'Test'}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>{r.testId?.subject || 'General'}</p>
                  </div>
                  <span style={{
                    marginLeft: 8, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: pass ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: pass ? '#10b981' : '#ef4444'
                  }}>
                    {pass ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: pass ? '#10b981' : '#ef4444', margin: 0 }}>
                    {r.percentage}%
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                    {r.score}/{r.totalMarks}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{formatDate(r.submittedAt)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.autoSubmitted && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444' }}>
                        <HiOutlineExclamationTriangle size={12} /> Auto
                      </span>
                    )}
                    <span>{formatTime(r.timeTaken)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {r.testId?.testType === 'combined' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/combined-result/${r.testId._id || r.testId}`);
                      }}
                      className="dms-btn dms-btn-sm dms-btn-outline"
                    >
                      🎯 View Combined Result
                    </button>
                  ) : (
                    <div />
                  )}
                  <span style={{ fontSize: 12, color: '#0e71eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View MCQ Details <HiOutlineArrowRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyResults;
