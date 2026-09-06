import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLORS = {
  Accepted: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: '✓' },
  'Wrong Answer': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: '✗' },
  'Time Limit Exceeded': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: '⏱' },
  'Runtime Error': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: '⚠' },
  'Compilation Error': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: '⛔' },
  Pending: { bg: '#333338', color: '#a1a1a6', icon: '⋯' },
};

const TestCasePanel = ({ testCases = [], compilationError = null }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  if (compilationError) {
    return (
      <div style={{
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '16px' }}>⛔</span>
          <span style={{ fontWeight: '600', color: '#ef4444', fontSize: '14px' }}>
            Compilation Error
          </span>
        </div>
        <pre style={{
          background: theme === 'light' ? '#fff5f5' : '#1a1a1d',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '12px',
          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
          color: '#ef4444',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
          overflow: 'auto',
          maxHeight: '200px',
        }}>
          {compilationError}
        </pre>
      </div>
    );
  }

  if (testCases.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#a1a1a6',
        fontSize: '14px',
      }}>
        No test case results yet. Run or submit your code.
      </div>
    );
  }

  const activeCase = testCases[activeTab];
  const statusInfo = STATUS_COLORS[activeCase?.status] || STATUS_COLORS.Pending;

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '0 0 12px 0',
        overflowX: 'auto',
        flexWrap: 'wrap',
      }}>
        {testCases.map((tc, idx) => {
          const s = STATUS_COLORS[tc.status] || STATUS_COLORS.Pending;
          const isActive = idx === activeTab;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: isActive ? `1.5px solid ${s.color}` : '1px solid #333338',
                background: isActive ? s.bg : 'transparent',
                color: isActive ? s.color : '#a1a1a6',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '11px' }}>{s.icon}</span>
              {tc.isHidden ? `Hidden #${idx + 1}` : `Case #${idx + 1}`}
            </button>
          );
        })}
      </div>

      {activeCase && (
        <div style={{
          background: '#242428',
          borderRadius: '10px',
          padding: '16px',
          border: '1px solid #333338',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              background: statusInfo.bg,
              color: statusInfo.color,
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {statusInfo.icon} {activeCase.status}
            </span>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#a1a1a6' }}>
              {activeCase.executionTime > 0 && (
                <span>⏱ {activeCase.executionTime.toFixed(1)}ms</span>
              )}
              {activeCase.memoryUsed > 0 && (
                <span>💾 {(activeCase.memoryUsed / 1024).toFixed(1)}MB</span>
              )}
            </div>
          </div>

          {!activeCase.isHidden && activeCase.actualOutput !== undefined && (
            <div>
              <p style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#a1a1a6',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
              }}>
                Output
              </p>
              <pre style={{
                background: theme === 'light' ? '#f8faff' : '#1a1a1d',
                border: '1px solid #333338',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                color: '#ffffff',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                maxHeight: '160px',
                overflow: 'auto',
              }}>
                {activeCase.actualOutput || '(no output)'}
              </pre>
            </div>
          )}

          {activeCase.isHidden && (
            <p style={{
              fontSize: '13px',
              color: '#a1a1a6',
              fontStyle: 'italic',
            }}>
              This is a hidden test case. {activeCase.passed ? 'Your output matched.' : 'Your output did not match.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCasePanel;
