import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import CodeEditor from '../../components/CodeEditor';
import TestCasePanel from '../../components/TestCasePanel';
import useProctor from '../../hooks/useProctor';
import useTimer from '../../hooks/useTimer';
import {
  HiOutlinePlay,
  HiOutlinePaperAirplane,
  HiOutlineChevronLeft,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const LANG_LABELS = { c: 'C', python: 'Python', java: 'Java' };

const TakeCodingTest = () => {
  const { theme } = useTheme();
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mcqResultId = location.state?.mcqResultId || null;
  const fromCombinedMCQ = location.state?.fromCombinedMCQ || false;
  const remainingSecondsFromMCQ = location.state?.remainingSeconds ?? null;

  const [problems, setProblems] = useState([]);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProblem, setActiveProblem] = useState(0);

  const [testStarted, setTestStarted] = useState(false);
  const autoSubmitCalledRef = useRef(false);
  const violationsRef = useRef([]);

  const codeStateRef = useRef({});
  const activeProblemRef = useRef(0);
  const problemsRef = useRef([]);

  useEffect(() => {
    if (fromCombinedMCQ) {
      setTestStarted(true);
    }
  }, [fromCombinedMCQ]);

  const [codeState, setCodeState] = useState({});

  useEffect(() => { codeStateRef.current = codeState; }, [codeState]);
  useEffect(() => { activeProblemRef.current = activeProblem; }, [activeProblem]);
  useEffect(() => { problemsRef.current = problems; }, [problems]);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const [submitResults, setSubmitResults] = useState(null);
  const [activePanel, setActivePanel] = useState('output');

  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [testId]);

  const fetchProblems = async () => {
    try {
      let probs = [];
      
      // If it's a local test, bypass server requests and fetch directly from localStorage
      if (testId && testId.startsWith('test_local_')) {
        const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
        const localTest = localTests.find(t => t._id === testId || t.id === testId);
        if (localTest) {
          setTestData(localTest);
          probs = localTest.codingProblems || [];
        } else {
          throw new Error("Local test not found");
        }
      } else {
        if (!fromCombinedMCQ) {
          try {
            const testRes = await API.get(`/student/tests/${testId}/start`);
            setTestData(testRes.data.data || testRes.data);
          } catch (e) {
            if (e.response && (e.response.status === 400 || e.response.status === 403)) {
              toast.error(e.response?.data?.message || 'Cannot start this test');
              navigate('/tests');
              return;
            }
            console.warn('Could not fetch test data for pre-screen', e);
          }
        }
        const res = await API.get(`/coding/${testId}/student-problems`);
        probs = res.data.data || [];
      }

      setProblems(probs);

      const initial = {};
      probs.forEach(p => {
        const defaultLang = (p.allowedLanguages && p.allowedLanguages[0]) || 'python';
        initial[p._id] = {
          code: CodeEditor.BOILERPLATE[defaultLang] || '',
          language: defaultLang,
        };
      });
      setCodeState(initial);
    } catch (err) {
      if (err.response && (err.response.status === 400 || err.response.status === 403)) {
        toast.error(err.response?.data?.message || 'Cannot start this test');
        navigate('/tests');
        return;
      }

      console.warn("Error fetching problems, falling back to local storage:", err);
      try {
        const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
        const localTest = localTests.find(t => t._id === testId || t.id === testId);
        if (localTest) {
          setTestData(localTest);
          const probs = localTest.codingProblems || [];
          setProblems(probs);
          const initial = {};
          probs.forEach(p => {
            const defaultLang = (p.allowedLanguages && p.allowedLanguages[0]) || 'python';
            initial[p._id] = {
              code: CodeEditor.BOILERPLATE[defaultLang] || '',
              language: defaultLang,
            };
          });
          setCodeState(initial);
        } else {
          toast.error('Failed to load problems');
        }
      } catch (e) {
        toast.error('Failed to load problems');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentProblem = problems[activeProblem];
  const currentState = currentProblem ? codeState[currentProblem._id] : null;

  const updateCode = useCallback((code) => {
    if (!currentProblem) return;
    setCodeState(prev => ({
      ...prev,
      [currentProblem._id]: { ...prev[currentProblem._id], code },
    }));
  }, [currentProblem]);

  const updateLanguage = (lang) => {
    if (!currentProblem) return;
    setCodeState(prev => ({
      ...prev,
      [currentProblem._id]: {
        ...prev[currentProblem._id],
        language: lang,
        code: prev[currentProblem._id]?.code || CodeEditor.BOILERPLATE[lang] || '',
      },
    }));
  };

  const handleRun = async () => {
    if (!currentState?.code.trim()) return toast.error('Write some code first');
    setRunning(true);
    setRunOutput(null);
    setActivePanel('output');
    try {
      const stdin = useCustomInput ? customInput : (currentProblem.sampleInput || '');
      const res = await API.post('/coding/run', {
        sourceCode: currentState.code,
        language: currentState.language,
        stdin,
      });
      setRunOutput({
        stdout: res.data.output,
        stderr: res.data.error,
        compile_output: res.data.status === 'Compilation Error' ? res.data.error : '',
        time: Number(res.data.executionTime) || 0,
      });
    } catch (err) {
      setRunOutput({
        stderr: err.response?.data?.message || 'Execution failed. Please try again.',
        status: 'Error'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async (isAutoSubmit = false, violations = []) => {
    if (!currentState?.code.trim() && !isAutoSubmit) return toast.error('Write some code first');
    if (!currentProblem && !isAutoSubmit) return;

    if (!isAutoSubmit) {
      setSubmitting(true);
      setSubmitResults(null);
      setActivePanel('results');
    }
    try {
      const probId = currentProblem?._id || problems[0]?._id;
      if (!probId) throw new Error('No problem available to submit');

      const res = await API.post(`/coding/problems/${probId}/submit`, {
        sourceCode: currentState?.code || '',
        language: currentState?.language || 'python',
        mcqResultId: mcqResultId || undefined,
        autoSubmitted: isAutoSubmit,
        violations: isAutoSubmit ? violations : violationsRef.current,
      });

      if (!isAutoSubmit) {
        const d = res.data.submission || res.data.data;
        setSubmitResults(d);

        const isLastProblem = !problems || problems.length === 0 || activeProblem >= problems.length - 1;

        if (d.score === d.totalMarks) {
          toast.success(`All test cases passed! ${d.score}/${d.totalMarks}`);
        } else {
          toast(`Score: ${d.score}/${d.totalMarks}`, { icon: '📊' });
        }

        if (res.data?.success !== false) {
          setTimeout(() => {
            if (!isLastProblem) {
              toast.success('Problem submitted! Moving to next problem...', { duration: 1500 });
              setActiveProblem(prev => prev + 1);
              setSubmitResults(null);
              setActivePanel('output');
            } else {
              toast.success('Coding submitted! Redirecting...', { duration: 2000 });
              if (fromCombinedMCQ) {
                navigate(`/student/combined-result/${testId}`);
              } else {
                navigate(`/student/coding-results/${testId}`);
              }
            }
          }, 2000);
        }
      }
      return res;
    } catch (err) {
      if (!isAutoSubmit) {
        toast.error(err.response?.data?.message || 'Submission failed.');
      }
      throw err;
    } finally {
      if (!isAutoSubmit) setSubmitting(false);
    }
  };

  const autoSubmitCoding = async (reason) => {
    if (autoSubmitCalledRef.current) return;
    autoSubmitCalledRef.current = true;

    if (!problems || problems.length === 0) {
      navigate('/student/dashboard');
      return;
    }

    try {
      const currentCode = currentState?.code || '';
      const problemToSubmit = currentProblem || problems[0];

      if (!problemToSubmit?._id) {
        navigate('/student/dashboard');
        return;
      }

      await API.post(
        `/coding/problems/${problemToSubmit._id}/submit`,
        {
          language: currentState?.language || 'python',
          sourceCode: currentCode,
          autoSubmitted: true,
          violations: violationsRef.current,
          mcqResultId: mcqResultId || undefined
        }
      );

      if (fromCombinedMCQ && testId) {
        navigate(`/student/combined-result/${testId}`);
      } else {
        navigate(`/student/coding-results/${testId}`);
      }
    } catch (err) {
      navigate('/student/dashboard');
    }
  };

  const handleCodingViolation = useCallback(async (violationType) => {
    violationsRef.current = [
      ...violationsRef.current,
      {
        type: violationType,
        timestamp: new Date().toISOString()
      }
    ];

    await autoSubmitCoding(violationType);
  }, [mcqResultId, fromCombinedMCQ]);

  useProctor(testStarted, handleCodingViolation);

  const handleTimerExpireCoding = useCallback(() => {
    autoSubmitCoding('timerExpired');
  }, [autoSubmitCoding]);

  const timerStartValue = 
    (fromCombinedMCQ && remainingSecondsFromMCQ !== null)
      ? remainingSecondsFromMCQ
      : (testData?.duration || 2400);

  const { 
    displayTime, 
    isWarning, 
    isCritical 
  } = useTimer(
    timerStartValue,
    handleTimerExpireCoding
  );

  const isDark = theme !== 'light';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px' }}>No coding problems available for this test.</p>
        <button onClick={() => navigate('/tests')} className="dms-btn dms-btn-primary">Back to Tests</button>
      </div>
    );
  }

  if (!testStarted && !fromCombinedMCQ) {
    const durationMins = testData?.duration 
      ? Math.round(testData.duration / 60) 
      : 40;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, overflowY: 'auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, maxWidth: 540, width: '100%' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{testData?.title || 'Coding Test'}</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>{testData?.description || 'Complete the following coding problems.'}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 16, borderRadius: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px' }}>DURATION</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{durationMins} Mins</p>
            </div>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 16, borderRadius: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px' }}>PROBLEMS</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{problems.length}</p>
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', padding: 20, borderRadius: 12, marginBottom: 28 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
              <HiOutlineExclamationTriangle size={20} /> Anti-Cheat Strict Mode
            </h4>
            <ul style={{ fontSize: 13, color: 'var(--text-primary)', paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              <li>Do not switch tabs or minimize window.</li>
              <li>Do not exit fullscreen mode once started.</li>
              <li><strong style={{ color: '#ef4444' }}>Any violation will auto-submit exam immediately.</strong></li>
            </ul>
          </div>

          <button onClick={() => setTestStarted(true)} className="dms-btn dms-btn-primary dms-btn-full" style={{ padding: '14px', fontSize: 16 }}>
            Begin Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      {fromCombinedMCQ && (
        <div style={{
          padding: '12px 20px',
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '10px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✓ MCQ section submitted. Now complete the coding section.
        </div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 0', marginBottom: '16px', borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {problems.map((p, idx) => {
            const isActive = idx === activeProblem;
            return (
              <button key={p._id} onClick={() => { setActiveProblem(idx); setRunOutput(null); setSubmitResults(null); }}
                style={{
                  padding: '6px 16px', borderRadius: '8px',
                  border: isActive ? '1.5px solid #0e71eb' : '1px solid var(--border-color)',
                  background: isActive ? 'rgba(14,113,235,0.15)' : 'transparent',
                  color: isActive ? '#0e71eb' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                }}>
                Problem #{idx + 1}
              </button>
            );
          })}
        </div>

        {testStarted && (
          <div style={{
            fontSize: '22px',
            fontWeight: '800',
            color: isCritical 
              ? '#ef4444' 
              : isWarning 
                ? '#eab308' 
                : '#0e71eb',
            margin: '0 auto',
          }}>
            ⏱ {displayTime}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={currentState?.language || 'python'} onChange={e => updateLanguage(e.target.value)} className="dms-select" style={{ width: 'auto', padding: '6px 12px' }}>
            {(currentProblem?.allowedLanguages || ['c', 'python', 'java']).map(lang => (
              <option key={lang} value={lang}>{LANG_LABELS[lang]}</option>
            ))}
          </select>
          <button onClick={handleRun} disabled={running} className="dms-btn dms-btn-sm" style={{ background: '#10b981', color: '#fff' }}>
            <HiOutlinePlay size={14} /> {running ? 'Running...' : 'Run Code'}
          </button>
          <button onClick={() => handleSubmit(false, [])} disabled={submitting} className="dms-btn dms-btn-sm dms-btn-primary">
            <HiOutlinePaperAirplane size={14} /> 
            {submitting 
              ? 'Submitting...' 
              : (!problems || problems.length === 0 || activeProblem >= problems.length - 1)
                ? 'Submit & Finish'
                : 'Submit & Next →'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', flex: 1, minHeight: '400px' }}>
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '14px',
          border: '1px solid var(--border-color)', padding: '24px',
          overflowY: 'auto', maxHeight: '65vh',
        }}>
          {currentProblem && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0e71eb' }}>#{currentProblem.problemNo}</span>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  {currentProblem.title}
                </h2>
                <span style={{
                  padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                  background: currentProblem.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' : currentProblem.difficulty === 'hard' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                  color: currentProblem.difficulty === 'easy' ? '#10b981' : currentProblem.difficulty === 'hard' ? '#ef4444' : '#eab308',
                  textTransform: 'capitalize',
                }}>
                  {currentProblem.difficulty}
                </span>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                {currentProblem.description}
              </div>

              {currentProblem.inputFormat && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Input Format</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{currentProblem.inputFormat}</p>
                </div>
              )}
              {currentProblem.outputFormat && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Output Format</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{currentProblem.outputFormat}</p>
                </div>
              )}
              {currentProblem.constraints && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Constraints</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0 }}>{currentProblem.constraints}</p>
                </div>
              )}

              {(currentProblem.sampleInput || currentProblem.sampleOutput) && (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Sample</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Input</p>
                      <pre style={{ background: theme === 'light' ? '#f8faff' : '#1a1a1d', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {currentProblem.sampleInput || '(none)'}
                      </pre>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Output</p>
                      <pre style={{ background: theme === 'light' ? '#f8faff' : '#1a1a1d', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {currentProblem.sampleOutput || '(none)'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px' }}>
          <CodeEditor
            value={currentState?.code || ''}
            onChange={updateCode}
            language={currentState?.language || 'python'}
            height="calc(65vh - 220px)"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={useCustomInput} onChange={e => setUseCustomInput(e.target.checked)} />
              Custom Input
            </label>
            {useCustomInput && (
              <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} rows={2} placeholder="Enter custom stdin..." className="dms-input" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
            )}
          </div>

          <div style={{
            background: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-color)', padding: '16px',
            minHeight: '140px', maxHeight: '250px', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => setActivePanel('output')}
                style={{
                  padding: '4px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  border: activePanel === 'output' ? '1.5px solid #0e71eb' : '1px solid var(--border-color)',
                  background: activePanel === 'output' ? 'rgba(14,113,235,0.15)' : 'transparent',
                  color: activePanel === 'output' ? '#0e71eb' : 'var(--text-muted)',
                }}>
                Output
              </button>
              <button onClick={() => setActivePanel('results')}
                style={{
                  padding: '4px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  border: activePanel === 'results' ? '1.5px solid #0e71eb' : '1px solid var(--border-color)',
                  background: activePanel === 'results' ? 'rgba(14,113,235,0.15)' : 'transparent',
                  color: activePanel === 'results' ? '#0e71eb' : 'var(--text-muted)',
                }}>
                Test Results
              </button>
            </div>

            {activePanel === 'output' && (
              <>
                {running && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Executing...
                  </div>
                )}
                {!running && !runOutput && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Click "Run" to see output here.</p>
                )}
                {!running && runOutput && (
                  <div>
                    {runOutput.compile_output && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', marginBottom: '4px', margin: 0 }}>Compilation Error</p>
                        <pre style={{ background: theme === 'light' ? '#fff5f5' : '#1a1a1d', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#ef4444', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {runOutput.compile_output}
                        </pre>
                      </div>
                    )}
                    {runOutput.stderr && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', marginBottom: '4px', margin: 0 }}>Stderr</p>
                        <pre style={{ background: theme === 'light' ? '#fff5f5' : '#1a1a1d', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#ef4444', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {runOutput.stderr}
                        </pre>
                      </div>
                    )}
                    {runOutput.stdout !== undefined && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Stdout</p>
                          {runOutput.time > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱ {runOutput.time.toFixed(1)}ms</span>}
                        </div>
                        <pre style={{ background: theme === 'light' ? '#f8faff' : '#1a1a1d', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {runOutput.stdout || '(no output)'}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activePanel === 'results' && (
              <>
                {submitting && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Running test cases...
                  </div>
                )}
                {!submitting && !submitResults && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Click "Submit" to run against all test cases.</p>
                )}
                {!submitting && submitResults && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: submitResults.score === submitResults.totalMarks ? '#10b981' : '#eab308' }}>
                        {submitResults.score}/{submitResults.totalMarks}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attempt #{submitResults.attemptNumber}</span>
                    </div>
                    <TestCasePanel
                      testCases={submitResults.testCaseResults || []}
                      compilationError={submitResults.compilationError}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeCodingTest;
