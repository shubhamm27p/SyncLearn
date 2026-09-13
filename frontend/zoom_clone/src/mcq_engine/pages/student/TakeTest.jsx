import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import useTimer from '../../hooks/useTimer';
import useProctor from '../../hooks/useProctor';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFlag,
  HiOutlinePaperAirplane,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineListBullet,
} from 'react-icons/hi2';

const initialState = {
  currentQuestion: 0, answers: {}, flagged: [], visited: [0], testSubmitted: false,
};

function testReducer(state, action) {
  switch (action.type) {
    case 'SET_ANSWER': {
      const newAnswers = { ...state.answers };
      if (newAnswers[action.questionNo] === action.option) delete newAnswers[action.questionNo];
      else newAnswers[action.questionNo] = action.option;
      return { ...state, answers: newAnswers };
    }
    case 'NAVIGATE': {
      const visited = state.visited.includes(action.index) ? state.visited : [...state.visited, action.index];
      return { ...state, currentQuestion: action.index, visited };
    }
    case 'TOGGLE_FLAG': {
      const flagged = state.flagged.includes(action.questionNo)
        ? state.flagged.filter((n) => n !== action.questionNo) : [...state.flagged, action.questionNo];
      return { ...state, flagged };
    }
    case 'SUBMITTED': return { ...state, testSubmitted: true };
    case 'RESTORE_ANSWERS': return { ...state, answers: action.answers };
    default: return state;
  }
}

const ActiveTest = ({ testData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [showPalette, setShowPalette] = useState(false);
  const [state, dispatch] = useReducer(testReducer, initialState);
  
  const isCombinedTest = testData?.testType === 'combined';

  const autoSubmitCalledRef = useRef(false);
  const answersRef = useRef({});
  const violationsRef = useRef([]);
  const testIdRef = useRef(null);
  const secondsLeftRef = useRef(0);

  useEffect(() => {
    if (testData) {
      testIdRef.current = testData._id || testData.id || id;
    }
  }, [testData, id]);

  useEffect(() => {
    answersRef.current = state.answers;
  }, [state.answers]);

  useEffect(() => {
    const saved = sessionStorage.getItem(`dms_test_${id}`);
    if (saved) {
      try {
        dispatch({ type: 'RESTORE_ANSWERS', answers: JSON.parse(saved) });
      } catch {}
    }
  }, [id]);

  useEffect(() => {
    if (!state.testSubmitted) {
      sessionStorage.setItem(`dms_test_${id}`, JSON.stringify(state.answers));
    }
  }, [state.answers, id, state.testSubmitted]);

  const autoSubmit = async (reason) => {
    if (autoSubmitCalledRef.current) return;
    autoSubmitCalledRef.current = true;

    const currentTestId = testIdRef.current || id;

    if (!currentTestId) {
      navigate('/student/results');
      return;
    }

    const answersArray = Object.entries(answersRef.current).map(([questionNo, selectedOption]) => ({
      questionNo: Number(questionNo),
      selectedOption: selectedOption
    }));

    const timeTaken = (testData?.duration || 2400) - secondsLeftRef.current;

    try {
      const res = await API.post(
        `/student/tests/${currentTestId}/submit`,
        {
          answers: answersArray,
          autoSubmitted: reason !== 'manual',
          timeTaken: timeTaken,
          violations: violationsRef.current
        }
      );

      const resultId = 
        res.data?.result?._id ||
        res.data?.result?.id ||
        res.data?._id ||
        res.data?.id ||
        res.data?.resultId ||
        res.data?.data?.resultId;

      dispatch({ type: 'SUBMITTED' });
      sessionStorage.removeItem(`dms_test_${id}`);
      
      if (reason !== 'manual') {
        toast.error('Test auto-submitted due to violation', { duration: 4000 });
      } else {
        toast.success('Test submitted successfully!', { duration: 4000 });
      }

      if (resultId) {
        if (isCombinedTest && reason === 'manual') {
          navigate(`/student/coding-test/${currentTestId}`, { 
            state: { 
              mcqResultId: resultId, 
              fromCombinedMCQ: true,
              remainingSeconds: secondsLeftRef.current
            },
            replace: true 
          });
        } else if (isCombinedTest && reason === 'timerExpired') {
          navigate(`/student/combined-result/${currentTestId}`, { replace: true });
        } else {
          navigate(`/student/results/${resultId}`, { replace: true });
        }
      } else {
        navigate('/student/results');
      }
    } catch (err) {
      navigate('/student/results');
    }
  };

  const handleViolation = useCallback((violationType) => {
    violationsRef.current = [
      ...violationsRef.current,
      {
        type: violationType,
        timestamp: new Date().toISOString()
      }
    ];

    autoSubmit(violationType);
  }, []);

  const handleTimerExpire = useCallback(() => {
    autoSubmit('timerExpired');
  }, []);

  const handleManualSubmit = async () => {
    const questionsList = testData.questions || [];
    const unanswered = questionsList.length - Object.keys(answersRef.current).length;
    
    if (unanswered > 0) {
      const confirmMsg = isCombinedTest
        ? `${unanswered} questions unanswered. Continue to Coding section anyway? You won't be able to return to MCQs after this.`
        : `${unanswered} questions unanswered. Submit anyway?`;
      const confirm = window.confirm(confirmMsg);
      if (!confirm) return;
    }
    
    await autoSubmit('manual');
  };

  useProctor(true, handleViolation);

  const rawDuration = testData?.duration || 2400;
  const { displayTime, isWarning, isCritical, secondsLeft } = useTimer(
    rawDuration,
    handleTimerExpire
  );

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const questions = testData.questions || [];
  const current = questions[state.currentQuestion] || {};
  const totalQ = questions.length;

  const getQuestionStatus = (idx) => {
    const qNo = questions[idx]?.questionNo;
    if (idx === state.currentQuestion) return 'current';
    if (state.flagged.includes(qNo)) return 'flagged';
    if (state.answers[qNo]) return 'answered';
    if (state.visited.includes(idx)) return 'visited';
    return 'notVisited';
  };

  const paletteStyle = {
    current: { background: 'rgba(14,113,235,0.2)', color: '#0e71eb', border: '2px solid #0e71eb' },
    answered: { background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    flagged: { background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' },
    visited: { background: 'rgba(249,115,22,0.2)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' },
    notVisited: { background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' },
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', zIndex: 9999, userSelect: 'none' }}
      onContextMenu={e => e.preventDefault()}>

      <header style={{
        height: 56, background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0, justifyContent: 'space-between'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{testData.title}</h1>
        </div>

        <div style={{
          fontSize: '22px',
          fontWeight: '800',
          color: isCritical 
            ? '#ef4444' 
            : isWarning 
              ? '#eab308' 
              : '#0e71eb',
          letterSpacing: '1px',
        }}>
          ⏱ {displayTime}
        </div>

        <button onClick={() => setShowPalette(!showPalette)}
          style={{ marginLeft: 12, padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <HiOutlineListBullet size={18} /> Palette
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: 'rgba(14,113,235,0.15)', color: '#0e71eb',
                borderRadius: 8, padding: '6px 14px',
              }}>Question {state.currentQuestion + 1} of {totalQ}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{current.marks || 1} mark(s)</span>
              {state.flagged.includes(current.questionNo) && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 700, background: 'rgba(139,92,246,0.15)',
                  color: '#8b5cf6', borderRadius: 6, padding: '4px 10px',
                }}><HiOutlineFlag size={12} /> Flagged</span>
              )}
            </div>

            <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 32 }}>{current.questionText}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['A', 'B', 'C', 'D', ...(current.optionE ? ['E'] : [])].map((opt) => {
                const selected = state.answers[current.questionNo] === opt;
                return (
                  <button key={opt} onClick={() => dispatch({ type: 'SET_ANSWER', questionNo: current.questionNo, option: opt })}
                    style={{
                      width: '100%', textAlign: 'left', padding: '16px 20px',
                      borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: selected ? 'rgba(14,113,235,0.15)' : 'var(--bg-hover)',
                      border: selected ? '2px solid #0e71eb' : '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700,
                      background: selected ? '#0e71eb' : 'rgba(255,255,255,0.06)',
                      color: selected ? '#ffffff' : 'var(--text-muted)',
                    }}>{opt}</span>
                    <span style={{ fontSize: 15, color: selected ? '#0e71eb' : 'var(--text-primary)', fontWeight: selected ? 600 : 400 }}>
                      {current[`option${opt}`]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {showPalette && (
          <aside style={{
            width: 260, background: 'var(--bg-sidebar)', borderLeft: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Question Palette</h3>
              <button onClick={() => setShowPalette(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <HiOutlineXMark size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {questions.map((q, idx) => {
                  const s = paletteStyle[getQuestionStatus(idx)];
                  return (
                    <button key={q.questionNo || idx} onClick={() => dispatch({ type: 'NAVIGATE', index: idx })}
                      style={{
                        aspectRatio: '1', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s', ...s,
                      }}>{idx + 1}</button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>

      <footer style={{
        height: 60, background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', flexShrink: 0,
      }}>
        <button onClick={() => dispatch({ type: 'NAVIGATE', index: Math.max(0, state.currentQuestion - 1) })}
          disabled={state.currentQuestion === 0}
          className="dms-btn dms-btn-outline dms-btn-sm" style={{ opacity: state.currentQuestion === 0 ? 0.4 : 1 }}>
          <HiOutlineChevronLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => dispatch({ type: 'TOGGLE_FLAG', questionNo: current.questionNo })}
            className="dms-btn dms-btn-outline dms-btn-sm">
            <HiOutlineFlag size={16} /> {state.flagged.includes(current.questionNo) ? 'Unflag' : 'Flag'}
          </button>
        </div>

        {state.currentQuestion === totalQ - 1 ? (
          <button onClick={handleManualSubmit} className="dms-btn dms-btn-danger dms-btn-sm">
            <HiOutlinePaperAirplane size={16} /> {isCombinedTest ? 'Next Section: Coding →' : 'Submit Exam'}
          </button>
        ) : (
          <button onClick={() => dispatch({ type: 'NAVIGATE', index: Math.min(totalQ - 1, state.currentQuestion + 1) })}
            className="dms-btn dms-btn-primary dms-btn-sm">
            Next <HiOutlineChevronRight size={16} />
          </button>
        )}
      </footer>
    </div>
  );
};

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        if (id && id.startsWith('test_local_')) {
          const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
          const localTest = localTests.find(t => t._id === id || t.id === id);
          if (localTest) {
            setTestData(localTest);
          } else {
            throw new Error("Local test not found");
          }
        } else {
          const res = await API.get(`/student/tests/${id}/start`);
          const testObj = res.data.data || res.data;
          setTestData(testObj);
        }
      } catch (err) {
        // If backend explicitly rejected due to attempt limit or business logic, do not fallback
        if (err.response && (err.response.status === 400 || err.response.status === 403)) {
          setError(err.response?.data?.message || 'Cannot start this test');
          toast.error(err.response?.data?.message || 'Cannot start this test');
          setLoading(false);
          return;
        }

        console.warn("Error fetching test, falling back to local storage:", err);
        try {
          const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
          const localTest = localTests.find(t => t._id === id || t.id === id);
          if (localTest) {
            setTestData(localTest);
          } else {
            setError(err.response?.data?.message || 'Failed to load test');
            toast.error(err.response?.data?.message || 'Cannot start this test');
          }
        } catch (e) {
          setError(err.response?.data?.message || 'Failed to load test');
          toast.error(err.response?.data?.message || 'Cannot start this test');
        }
      } finally { setLoading(false); }
    };
    fetchTest();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <HiOutlineExclamationTriangle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Cannot Start Test</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
          <button onClick={() => navigate('/tests')} className="dms-btn dms-btn-primary">Back to Tests</button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    const durationMins = testData?.duration 
      ? Math.round(testData.duration / 60) 
      : 40;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, overflowY: 'auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, maxWidth: 540, width: '100%' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{testData.title}</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>{testData.description || 'Please review the test details and instructions below before beginning.'}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 16, borderRadius: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px' }}>DURATION</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{durationMins} Mins</p>
            </div>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 16, borderRadius: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 4px' }}>QUESTIONS</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{testData.totalQuestions || testData.questions?.length || 0}</p>
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', padding: 20, borderRadius: 12, marginBottom: 28 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
              <HiOutlineExclamationTriangle size={20} /> Anti-Cheat Strict Mode
            </h4>
            <ul style={{ fontSize: 13, color: 'var(--text-primary)', paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              <li>Do not switch tabs or minimize the window.</li>
              <li>Do not exit fullscreen mode once started.</li>
              <li><strong style={{ color: '#ef4444' }}>Any violation will auto-submit the exam immediately.</strong></li>
            </ul>
          </div>

          <button onClick={() => setTestStarted(true)} className="dms-btn dms-btn-primary dms-btn-full" style={{ padding: '14px', fontSize: 16 }}>
            Begin Exam
          </button>
        </div>
      </div>
    );
  }

  return <ActiveTest testData={testData} />;
};

export default TakeTest;
