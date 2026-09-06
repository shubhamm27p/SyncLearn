import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminCombinedResult = () => {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await API.get(
        `/coding/combined-result/${testId}/pdf?studentId=${studentId}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `combined_result_${testId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('Failed to download PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/coding/admin/combined-result/${testId}/${studentId}`);
        setResult(res.data.result);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [testId, studentId]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
      {error}
    </div>
  );
  if (!result) return null;

  const { 
    testTitle, testSubject,
    mcqSection, codingSection, summary 
  } = result;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Combined Result (Admin View)</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {testTitle} · {testSubject}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="dms-btn dms-btn-primary"
          >
            {pdfLoading ? 'Generating...' : '⬇ Download PDF'}
          </button>
          <button
            onClick={() => navigate('/admin/results')}
            className="dms-btn dms-btn-outline"
          >
            ← Back to Results
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: summary.passed
          ? '1px solid rgba(16,185,129,0.3)'
          : '1px solid rgba(239,68,68,0.3)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: summary.passed
            ? 'rgba(16,185,129,0.1)'
            : 'rgba(239,68,68,0.1)',
          border: `3px solid ${
            summary.passed 
              ? '#10b981' 
              : '#ef4444'
          }`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{
            fontSize: '22px',
            fontWeight: '800',
            color: summary.passed 
              ? '#10b981' 
              : '#ef4444',
          }}>
            {summary.overallPercentage}%
          </span>
          <span style={{
            fontSize: '11px',
            color: summary.passed 
              ? '#10b981' 
              : '#ef4444',
            fontWeight: '600'
          }}>
            {summary.passed 
              ? 'PASSED' 
              : 'FAILED'}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            {summary.totalScore} / {summary.totalPossible} Marks
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '12px'
          }}>
            Combined MCQ + Coding Score
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              background: summary.passed
                ? 'rgba(16,185,129,0.15)'
                : 'rgba(239,68,68,0.15)',
              color: summary.passed
                ? '#10b981'
                : '#ef4444',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {summary.passed 
                ? '✓ PASSED' 
                : '✗ FAILED'}
            </span>
            <span style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              Passing: {summary.passingPercentage}%
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>📝</span>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>MCQ Section</h3>
          </div>

          {mcqSection ? (
            <>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0e71eb', marginBottom: '4px' }}>
                {mcqSection.score} / {mcqSection.totalMarks}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {mcqSection.percentage}% · {mcqSection.correctAnswers} correct, {mcqSection.incorrectAnswers} wrong, {mcqSection.unattempted} skipped
              </p>
              {mcqSection.autoSubmitted && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#ef4444' }}>
                  ⚠ Auto-submitted (security violation)
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Not attempted</p>
          )}
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>💻</span>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Coding Section</h3>
          </div>

          {codingSection ? (
            <>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#a855f7', marginBottom: '4px' }}>
                {codingSection.totalScore} / {codingSection.totalMarks}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {codingSection.percentage}% · {codingSection.submissions.length} problem(s) attempted
              </p>

              {codingSection.submissions.map((sub, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{sub.problemTitle}</span>
                    <span style={{ color: '#0e71eb', fontWeight: '600' }}>{sub.score}/{sub.totalMarks}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>{sub.language.toUpperCase()}</span>
                    <span>·</span>
                    <span>{sub.passedTestCases}/{sub.totalTestCases} test cases</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Not attempted</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCombinedResult;
