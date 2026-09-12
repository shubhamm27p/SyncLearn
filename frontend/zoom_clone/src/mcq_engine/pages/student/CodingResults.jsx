import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineChevronLeft } from 'react-icons/hi2';

const STATUS_BADGE = {
  completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Graded' },
  error: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Error' },
  running: { bg: 'rgba(234,179,8,0.15)', color: '#eab308', label: 'Running' },
  pending: { bg: '#333338', color: '#a1a1a6', label: 'Pending' },
};

const CodingResults = () => {
  const { theme } = useTheme();
  const { testId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, [testId]);

  const fetchSubmissions = async () => {
    try {
      const res = await API.get(`/coding/${testId}/submissions`);
      setSubmissions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubmission = async (submission) => {
    const isExpanded = expandedId === submission._id;
    setExpandedId(isExpanded ? null : submission._id);
    if (!isExpanded && !submissionDetails[submission._id]) {
      try {
        const res = await API.get(`/coding/submissions/${submission._id}`);
        setSubmissionDetails((current) => ({ ...current, [submission._id]: res.data.data }));
      } catch {
        toast.error('Failed to load submission details');
      }
    }
  };

  const bestByProblem = {};
  submissions.forEach(s => {
    const pid = s.problemId?._id || s.problemId;
    if (!bestByProblem[pid] || s.score > bestByProblem[pid].score) {
      bestByProblem[pid] = s;
    }
  });
  const bestScore = Object.values(bestByProblem).reduce((sum, s) => sum + (s.score || 0), 0);
  const bestTotal = Object.values(bestByProblem).reduce((sum, s) => sum + (s.totalMarks || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/tests')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', marginBottom: '8px', padding: 0 }}>
          <HiOutlineChevronLeft size={14} /> Back to Tests
        </button>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Coding Results
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {submissions.length > 0 && (
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '14px',
          border: '1px solid var(--border-color)', padding: '24px',
          display: 'flex', gap: '40px', marginBottom: '24px', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Best Score</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#0e71eb', margin: 0 }}>
              {bestScore}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500' }}>/{bestTotal}</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Percentage</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: bestTotal > 0 ? (bestScore / bestTotal >= 0.8 ? '#10b981' : '#eab308') : 'var(--text-muted)', margin: 0 }}>
              {bestTotal > 0 ? Math.round((bestScore / bestTotal) * 100) : 0}%
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Problems Attempted</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {Object.keys(bestByProblem).length}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Total Submissions</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {submissions.length}
            </p>
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '15px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          No submissions found for this test.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {submissions.map((sub) => {
            const badge = STATUS_BADGE[sub.status] || STATUS_BADGE.pending;
            const isExpanded = expandedId === sub._id;
            return (
              <div key={sub._id} style={{ background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div onClick={() => toggleSubmission(sub)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {sub.problemId?.title || 'Problem'}
                    </span>
                    <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: badge.bg, color: badge.color }}>{badge.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{sub.language}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: sub.score === sub.totalMarks ? '#10b981' : '#eab308' }}>
                      {sub.score}/{sub.totalMarks}
                    </span>
                    <span>Attempt #{sub.attemptNumber}</span>
                    <span>{new Date(sub.submittedAt).toLocaleString('en-IN')}</span>
                    <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px' }}>
                    {(submissionDetails[sub._id] || sub).testCaseResults && (submissionDetails[sub._id] || sub).testCaseResults.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', margin: 0 }}>Test Cases</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {(submissionDetails[sub._id] || sub).testCaseResults.map((tcr, idx) => (
                            <div key={idx} style={{
                              padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                              background: tcr.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              color: tcr.passed ? '#10b981' : '#ef4444',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                              {tcr.passed ? '✓' : '✗'} #{idx + 1}
                              {tcr.executionTime > 0 && <span style={{ opacity: 0.7 }}>({tcr.executionTime.toFixed(0)}ms)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sub.compilationError && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', marginBottom: '4px', margin: 0 }}>Compilation Error</p>
                        <pre style={{ background: theme === 'light' ? '#fff5f5' : '#1a1a1d', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#ef4444', whiteSpace: 'pre-wrap', margin: 0, maxHeight: '120px', overflow: 'auto' }}>
                          {sub.compilationError}
                        </pre>
                      </div>
                    )}

                    <details>
                      <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '6px' }}>View Source Code</summary>
                      <pre style={{ background: theme === 'light' ? '#f8faff' : '#1a1a1d', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflow: 'auto', margin: 0 }}>
                        {submissionDetails[sub._id]?.sourceCode || 'Loading source code...'}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CodingResults;
