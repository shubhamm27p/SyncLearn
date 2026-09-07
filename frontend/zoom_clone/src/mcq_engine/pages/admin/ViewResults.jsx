import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineArrowDownTray,
  HiOutlineExclamationTriangle,
  HiOutlineChartBarSquare,
  HiOutlineTrophy,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineUserGroup,
} from 'react-icons/hi2';

const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const ViewResults = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preTestId = searchParams.get('testId') || '';
  const preStudentId = searchParams.get('studentId') || '';

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(preTestId);
  const [results, setResults] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [rowExporting, setRowExporting] = useState(null);

  useEffect(() => { fetchTests(); }, []);
  useEffect(() => { 
    if (selectedTest) {
      fetchResults(selectedTest);
    } else if (preStudentId) {
      fetchStudentResults(preStudentId);
    }
  }, [selectedTest, preStudentId]);

  const fetchTests = async () => {
    try {
      const res = await API.get('/tests');
      if (res.data?.data) {
        setTests(res.data.data);
      }
    } catch {
      console.warn("ViewResults API unavailable, loading local tests database:");
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      setTests(localTests);
    }
    finally { setInitialLoading(false); }
  };

  const fetchResults = async (testId) => {
    setLoading(true);
    try {
      const res = await API.get(`/results/test/${testId}`);
      if (res.data?.data) {
        setResults(res.data.data.results || []);
        setTestInfo(res.data.data.test || null);
      }
    } catch {
      console.warn("ViewResults API unavailable, checking local submissions database:");
      const localSubmissions = JSON.parse(localStorage.getItem('viora_test_submissions_db') || '[]');
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      const foundTest = localTests.find(t => t._id === testId || t.id === testId);
      const filtered = localSubmissions.filter(s => s.testId === testId || s.test_id === testId || s.testId?._id === testId);
      setResults(filtered);
      setTestInfo(foundTest || null);
    }
    finally { setLoading(false); }
  };

  const fetchStudentResults = async (studentId) => {
    setLoading(true);
    try {
      const res = await API.get(`/results/student/${studentId}`);
      if (res.data?.data) {
        setResults(res.data.data || []);
      }
    } catch { toast.error('Failed to load student results'); }
    finally { setLoading(false); }
  };

  const handleExportPDF = async () => {
    if (!selectedTest) return;
    setBulkExporting(true);
    try {
      const response = await API.get(`/results/test/${selectedTest}/export-pdf`, { responseType: 'blob' });
      downloadBlob(response.data, `results_${testInfo?.title?.replace(/\s+/g, '_') || 'test'}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF export failed'); }
    finally { setBulkExporting(false); }
  };

  const handleExportSinglePDF = async (resultId, studentRoll) => {
    setRowExporting(resultId);
    try {
      const response = await API.get(`/results/${resultId}/export-pdf`, { responseType: 'blob' });
      downloadBlob(response.data, `result_${studentRoll || 'student'}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF export failed'); }
    finally { setRowExporting(null); }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const passingPct = testInfo?.passingPercentage || 40;
  const scores = results.map((r) => r.percentage || 0);
  const passCount = scores.filter((s) => s >= passingPct).length;
  const failCount = scores.length - passCount;
  const highest = scores.length ? Math.max(...scores) : 0;
  const lowest = scores.length ? Math.min(...scores) : 0;
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            View Results
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {testInfo ? `${testInfo.title} — ${results.length} submissions` : 'Select a test to view results'}
          </p>
        </div>
        {selectedTest && results.length > 0 && (
          <button onClick={handleExportPDF} disabled={bulkExporting} className="dms-btn dms-btn-primary">
            <HiOutlineArrowDownTray size={16} />
            {bulkExporting ? 'Exporting...' : 'Export All PDF'}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
          Filter by Test
        </label>
        <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} className="dms-select" style={{ maxWidth: '320px' }}>
          <option value="">Select a test...</option>
          {tests.map((t) => (
            <option key={t._id} value={t._id}>{t.title} ({t.subject || 'General'})</option>
          ))}
        </select>
      </div>

      {(selectedTest || preStudentId) && results.length > 0 && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total', value: results.length, icon: HiOutlineUserGroup, color: '#0e71eb', bg: 'rgba(14,113,235,0.15)' },
            { label: 'Highest', value: `${highest}%`, icon: HiOutlineArrowTrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { label: 'Lowest', value: `${lowest}%`, icon: HiOutlineArrowTrendingDown, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
            { label: 'Average', value: `${average}%`, icon: HiOutlineChartBarSquare, color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
            { label: 'Passed', value: passCount, icon: HiOutlineTrophy, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { label: 'Failed', value: failCount, icon: HiOutlineExclamationTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ width: '36px', height: '36px', background: s.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (!selectedTest && !preStudentId) ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <p style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-secondary)' }}>No test selected</p>
          <p style={{ fontSize: '13px', margin: 0 }}>Select a test from the dropdown above to view student results</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '15px', margin: 0 }}>No submissions found for this selection</p>
        </div>
      ) : (
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
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '48px' }}>#</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Roll No</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Score</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>%</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Time</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Flags</th>
                  {testInfo?.testType === 'combined' && (
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Combined</th>
                  )}
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>PDF</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => {
                  const pass = (r.percentage || 0) >= passingPct;
                  const isExporting = rowExporting === r._id;
                  return (
                    <tr key={r._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>{idx + 1}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)' }}>
                        <p style={{ fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{r.studentId?.name || 'Student'}</p>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {r.studentId?.rollNumber || '—'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{ fontWeight: '700', color: pass ? '#10b981' : '#ef4444' }}>
                          {r.score}/{r.totalMarks}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: '700',
                          background: pass ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: pass ? '#10b981' : '#ef4444'
                        }}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {formatTime(r.timeTaken)}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {r.autoSubmitted && (
                            <span style={{
                              background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                              borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700'
                            }}>
                              AUTO
                            </span>
                          )}
                          {r.violationCount > 0 && (
                            <span style={{
                              background: 'rgba(234,179,8,0.15)', color: '#eab308',
                              borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: '700'
                            }}>
                              {r.violationCount} violations
                            </span>
                          )}
                          {!r.autoSubmitted && !r.violationCount && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                          )}
                        </div>
                      </td>
                      {testInfo?.testType === 'combined' && (
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                          <button
                            onClick={() => navigate(`/admin/combined-result/${testInfo._id}/${r.studentId?._id}`)}
                            className="dms-btn dms-btn-sm dms-btn-outline"
                          >
                            View
                          </button>
                        </td>
                      )}
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <button
                          onClick={() => handleExportSinglePDF(r._id, r.studentId?.rollNumber)}
                          disabled={isExporting}
                          className="dms-btn dms-btn-sm dms-btn-outline"
                          title="Download PDF"
                        >
                          <HiOutlineArrowDownTray size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResults;
