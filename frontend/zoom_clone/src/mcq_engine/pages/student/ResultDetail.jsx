import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import ResultSummary from '../../components/ResultSummary';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
} from 'react-icons/hi2';

const ResultDetail = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => { fetchResult(); }, [id]);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/student/results/${id}`);
      setResult(res.data.data);
    } catch (err) {
      toast.error('Failed to load result');
      navigate('/student/results');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await API.get(
        `/student/results/${id}/pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `result_${result?.studentId?.rollNumber || 'student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF Downloaded!');
    } catch {
      toast.error('PDF download failed');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!result) return null;

  const comparison = result.comparison || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/student/results')} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <HiOutlineArrowLeft size={16} />
        </button>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>Result Detail</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{result.testId?.title}</p>
        </div>
        <button onClick={handleDownloadPDF} disabled={pdfLoading} className="dms-btn dms-btn-primary">
          <HiOutlineArrowDownTray size={16} /> {pdfLoading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <ResultSummary result={result} />

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', marginTop: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Answer Comparison</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '60px' }}>#</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Question</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '100px' }}>Yours</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '100px' }}>Correct</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '80px' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((q) => {
                const isCorrect = q.isCorrect;
                const isUnattempted = q.isUnattempted;
                
                let rowBg = 'transparent';
                let rowBorder = 'none';
                
                if (isUnattempted) {
                  rowBg = 'rgba(234,179,8,0.05)';
                  rowBorder = '3px solid #eab308';
                } else if (isCorrect) {
                  rowBg = 'rgba(16,185,129,0.05)';
                  rowBorder = '3px solid #10b981';
                } else {
                  rowBg = 'rgba(239,68,68,0.05)';
                  rowBorder = '3px solid #ef4444';
                }

                return (
                  <tr key={q.questionNo} style={{ background: rowBg, borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', borderLeft: rowBorder }}>
                      {q.questionNo}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {q.questionText}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {q.isUnattempted ? (
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>—</span>
                      ) : (
                        <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(14,113,235,0.15)', color: '#0e71eb', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                          {q.studentAnswer}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {q.isUnattempted ? (
                        <div style={{ color: '#eab308', display: 'flex', justifyContent: 'center' }}><HiOutlineMinusCircle size={20} /></div>
                      ) : q.isCorrect ? (
                        <div style={{ color: '#10b981', display: 'flex', justifyContent: 'center' }}><HiOutlineCheckCircle size={20} /></div>
                      ) : (
                        <div style={{ color: '#ef4444', display: 'flex', justifyContent: 'center' }}><HiOutlineXCircle size={20} /></div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
