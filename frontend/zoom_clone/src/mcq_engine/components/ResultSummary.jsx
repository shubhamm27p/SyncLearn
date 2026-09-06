import React from 'react';
import {
  HiOutlineTrophy,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';

const ResultSummary = ({ result, showViolationBanner = true }) => {
  if (!result) return null;

  const percentage = result.percentage ?? 0;
  const passingPct = result.testId?.passingPercentage ?? 40;
  const passed = percentage >= passingPct;

  const correct = 
    result?.correctAnswers ?? 
    result?.correct ?? 
    result?.correctCount ?? 0;

  const incorrect = 
    result?.incorrectAnswers ?? 
    result?.incorrect ?? 
    result?.incorrectCount ?? 0;

  const unattempted = 
    result?.unattempted ?? 
    result?.unattemptedCount ?? 0;

  const formatTime = (sec) => {
    if (!sec) return '0m 0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const donutStyle = {
    background: `conic-gradient(
      ${passed ? '#10b981' : '#ef4444'} 0% ${percentage}%,
      #333338 ${percentage}% 100%
    )`,
  };

  const stats = [
    { label: 'Correct', value: correct, icon: HiOutlineCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Incorrect', value: incorrect, icon: HiOutlineXCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Unattempted', value: unattempted, icon: HiOutlineMinusCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Time Taken', value: formatTime(result.timeTaken), icon: HiOutlineClock, color: '#0e71eb', bg: 'rgba(14,113,235,0.1)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: '#242428',
        border: '1px solid #333338',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', ...donutStyle }} />
            <div style={{ position: 'absolute', inset: '8px', background: '#242428', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: passed ? '#10b981' : '#ef4444', margin: 0 }}>
                  {percentage}%
                </p>
                <p style={{ fontSize: '10px', color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <HiOutlineTrophy size={24} color={passed ? '#10b981' : '#ef4444'} />
              <p style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                {result.score}/{result.totalMarks}
              </p>
            </div>
            <p style={{ fontSize: '13px', color: '#a1a1a6', margin: 0 }}>
              {result.testId?.title || 'Test'} · Attempt #{result.attemptNumber || 1}
            </p>

            <span style={{
              display: 'inline-block', marginTop: '10px', padding: '4px 14px', borderRadius: '9999px',
              fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
              background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: passed ? '#10b981' : '#ef4444'
            }}>
              {passed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: '#242428', border: '1px solid #333338', borderRadius: '12px', padding: '16px', textAlign: 'center'
            }}>
              <div style={{ width: '36px', height: '36px', background: s.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Icon size={20} color={s.color} />
              </div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px', margin: 0 }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {showViolationBanner && result.autoSubmitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px' }}>
          <HiOutlineExclamationTriangle size={20} color="#ef4444" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', margin: 0 }}>
              Auto-submitted due to security violation
            </p>
            <p style={{ fontSize: '12px', color: '#a1a1a6', margin: 0 }}>
              This test was submitted automatically due to rule breaches.
            </p>
          </div>
        </div>
      )}

      {showViolationBanner && (result.violations?.length > 0 || result.violationCount > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px' }}>
          <HiOutlineShieldExclamation size={20} color="#f59e0b" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', margin: 0 }}>
              {result.violations?.length || result.violationCount} proctoring violation{(result.violations?.length || result.violationCount) !== 1 ? 's' : ''} recorded
            </p>
            <p style={{ fontSize: '12px', color: '#a1a1a6', margin: 0 }}>
              Proctoring flagged potential tab switching or focus loss.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultSummary;
