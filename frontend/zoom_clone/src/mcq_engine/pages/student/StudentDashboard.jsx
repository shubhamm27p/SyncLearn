import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineTrophy,
  HiOutlineSignal,
  HiOutlineClock,
  HiOutlinePlayCircle,
  HiOutlineCheckBadge,
  HiOutlineArrowRight,
  HiOutlineCodeBracketSquare,
  HiOutlineStar,
  HiOutlineUserPlus,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
} from 'react-icons/hi2';

const StudentDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const [followedTrainers, setFollowedTrainers] = useState(() => {
    const saved = localStorage.getItem('viora_followed_trainers');
    return saved ? JSON.parse(saved) : ['SyncLearn Trainer'];
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [testsRes, resultsRes] = await Promise.all([
        API.get('/student/tests'),
        API.get('/student/results'),
      ]);
      setTests(testsRes.data?.data || []);
      setResults(resultsRes.data?.data || []);
    } catch (err) {
      console.warn("Dashboard API unavailable, loading local test fallback data:", err);
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      const localSubmissions = JSON.parse(localStorage.getItem('viora_test_submissions_db') || '[]');
      setTests(localTests);
      setResults(localSubmissions);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollowTrainer = (trainerName) => {
    let updated;
    if (followedTrainers.includes(trainerName)) {
      updated = followedTrainers.filter(t => t !== trainerName);
      toast.success(`Unfollowed Trainer ${trainerName}`);
    } else {
      updated = [...followedTrainers, trainerName];
      toast.success(`Now following Trainer ${trainerName}!`);
    }
    setFollowedTrainers(updated);
    localStorage.setItem('viora_followed_trainers', JSON.stringify(updated));
  };

  const getComputedLiveStatus = (t) => {
    if (t.liveStatus) return t.liveStatus;
    if (t.status === 'draft') return 'draft';
    const now = new Date();
    const start = t.startTime ? new Date(t.startTime) : null;
    const end = t.endTime ? new Date(t.endTime) : null;
    if (start && now < start) return 'upcoming';
    if (end && now > end) return 'ended';
    return 'live';
  };

  const processedTests = tests.map((t) => {
    const status = getComputedLiveStatus(t);
    const trainer = t.trainerName || t.createdBy?.name || t.createdBy?.username || 'SyncLearn Trainer';
    return {
      ...t,
      computedLiveStatus: status,
      trainerName: trainer,
      isFollowed: followedTrainers.includes(trainer),
    };
  });

  const availableTests = processedTests.filter((t) => t.computedLiveStatus === 'live' || t.computedLiveStatus === 'upcoming');

  const filteredTests = activeFilter === 'followed'
    ? availableTests.filter((t) => t.isFollowed)
    : availableTests;

  const liveTests = filteredTests.filter((t) => t.computedLiveStatus === 'live');
  const upcomingTests = filteredTests.filter((t) => t.computedLiveStatus === 'upcoming');

  const uniqueTrainers = Array.from(new Set([
    'SyncLearn Trainer',
    ...tests.map(t => t.trainerName || t.createdBy?.name || t.createdBy?.username || 'SyncLearn Trainer')
  ])).filter(Boolean);
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length) : 0;
  const bestScore = results.length > 0 ? Math.max(...results.map((r) => r.percentage || 0)) : 0;

  const stats = [
    { label: 'Tests Attempted', value: results.length, icon: HiOutlineClipboardDocumentList, color: '#0e71eb' },
    { label: 'Average Score', value: `${avgScore}%`, icon: HiOutlineChartBarSquare, color: '#10b981' },
    { label: 'Best Score', value: `${bestScore}%`, icon: HiOutlineTrophy, color: '#eab308' },
    { label: 'Tests Available', value: liveTests.length, icon: HiOutlineSignal, color: '#ef4444' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  };

  const getTimeUntil = (start) => {
    const diff = new Date(start) - new Date();
    if (diff <= 0) return 'Now';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
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
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14,113,235,0.08) 0%, rgba(14,113,235,0.02) 100%)',
        border: '1px solid rgba(14,113,235,0.2)',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#101828', margin: 0 }}>
          {greeting()}, <span style={{ color: '#0e71eb' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ fontSize: 14, color: '#475467', marginTop: 4, margin: 0, fontWeight: 500 }}>
          Here are your available assessments and test progress
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: '#ffffff',
              border: '1px solid #eaecf0',
              borderRadius: 16,
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div>
                <p style={{ fontSize: 11, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#101828', marginTop: 6, margin: 0 }}>{s.value}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}12`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Trainers You Follow Section */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eaecf0',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#101828', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineSparkles color="#d97706" size={18} /> Follow Trainers & Instructors
          </h2>
          <span style={{ fontSize: 12, color: '#667085', fontWeight: 500 }}>
            Follow trainers to get instant access to all published assessments
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {uniqueTrainers.map((tr) => {
            const isFollowing = followedTrainers.includes(tr);
            const trainerTestCount = tests.filter(t => (t.trainerName || t.createdBy?.name || t.createdBy?.username || 'SyncLearn Trainer') === tr).length;
            return (
              <div
                key={tr}
                style={{
                  background: isFollowing ? 'rgba(14,113,235,0.06)' : '#f9fafb',
                  border: isFollowing ? '1px solid rgba(14,113,235,0.25)' : '1px solid #eaecf0',
                  borderRadius: 12,
                  padding: '12px 16px',
                  minWidth: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: isFollowing ? '#0e71eb' : '#64748b',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {tr.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#101828', margin: 0 }}>{tr}</p>
                    <p style={{ fontSize: 11, color: '#667085', margin: '2px 0 0 0' }}>{trainerTestCount} Test(s)</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollowTrainer(tr)}
                  style={{
                    background: isFollowing ? '#059669' : 'rgba(14,113,235,0.08)',
                    color: isFollowing ? '#fff' : '#0e71eb',
                    border: isFollowing ? 'none' : '1px solid rgba(14,113,235,0.25)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {isFollowing ? <HiOutlineCheckCircle size={14} /> : <HiOutlineUserPlus size={14} />}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Tests Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#101828', margin: 0 }}>Available Tests</h2>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: activeFilter === 'all' ? '1px solid #0e71eb' : '1px solid #eaecf0',
                background: activeFilter === 'all' ? '#0e71eb' : '#ffffff',
                color: activeFilter === 'all' ? '#ffffff' : '#344054',
              }}
            >
              All Tests ({availableTests.length})
            </button>
            <button
              onClick={() => setActiveFilter('followed')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: activeFilter === 'followed' ? '1px solid #d97706' : '1px solid #eaecf0',
                background: activeFilter === 'followed' ? 'rgba(217,119,6,0.1)' : '#ffffff',
                color: activeFilter === 'followed' ? '#d97706' : '#344054',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <HiOutlineStar size={14} /> Followed Trainers ({availableTests.filter(t => t.isFollowed).length})
            </button>
          </div>
        </div>

        {liveTests.length === 0 && upcomingTests.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p style={{ color: '#101828', fontSize: 15, fontWeight: 600, margin: 0 }}>
              {activeFilter === 'followed' ? 'No tests from followed trainers right now' : 'No tests available right now'}
            </p>
            <p style={{ color: '#667085', fontSize: 13, marginTop: 4, margin: 0 }}>
              {activeFilter === 'followed' ? 'Follow more trainers above to see their newly created assessments' : 'Check back later for upcoming tests'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[...liveTests, ...upcomingTests].map((test) => {
              const isLive = test.computedLiveStatus === 'live';
              const trainerName = test.trainerName || 'SyncLearn Trainer';
              const isFollowed = test.isFollowed;

              return (
                <div key={test._id || test.id} style={{
                  background: '#ffffff',
                  border: isFollowed ? '1px solid rgba(217,119,6,0.35)' : '1px solid #eaecf0',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                        background: isLive ? 'rgba(220,38,38,0.08)' : 'rgba(14,113,235,0.08)',
                        color: isLive ? '#dc2626' : '#0e71eb',
                        border: `1px solid ${isLive ? 'rgba(220,38,38,0.2)' : 'rgba(14,113,235,0.2)'}`,
                        borderRadius: 20, padding: '4px 12px',
                      }}>
                        {isLive ? '🔴 LIVE' : 'UPCOMING'}
                      </span>

                      {isFollowed && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 700,
                          background: 'rgba(217,119,6,0.1)', color: '#d97706',
                          border: '1px solid rgba(217,119,6,0.25)',
                          borderRadius: 20, padding: '4px 10px',
                        }}>
                          <HiOutlineStar size={12} /> Followed Trainer
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#101828', margin: 0 }}>{test.title}</h3>
                      {test.testType === 'coding' && (
                        <span style={{ background: 'rgba(147,51,234,0.1)', color: '#7e22ce', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                          💻 Coding
                        </span>
                      )}
                      {test.testType === 'combined' && (
                        <span style={{ background: 'rgba(2,132,199,0.1)', color: '#0284c7', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
                          🎯 MCQ + Coding
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 10px 0' }}>
                      <span style={{ fontSize: 13, color: '#0e71eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        👨‍🏫 {trainerName}
                      </span>
                      <button
                        onClick={() => toggleFollowTrainer(trainerName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isFollowed ? '#059669' : '#667085',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {isFollowed ? <HiOutlineCheckCircle size={14} /> : <HiOutlineUserPlus size={14} />}
                        {isFollowed ? 'Following' : '+ Follow'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#667085', fontWeight: 500, marginBottom: 6 }}>
                      <span>{test.totalQuestions || test.questionCount || 0} Qs</span>
                      <span>{test.duration} mins</span>
                      <span>{test.maxAttempts || 1} attempt(s)</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#667085', marginBottom: 20 }}>
                      {formatDate(test.startTime)} – {formatDate(test.endTime)}
                    </p>
                  </div>

                  <div>
                    {(!test.testType || test.testType === 'mcq') && (
                      <>
                        {test.hasAttempted ? (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(16,185,129,0.1)', color: '#059669',
                            border: '1px solid rgba(16,185,129,0.25)',
                            borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700,
                          }}>
                            <HiOutlineCheckBadge size={16} /> Attempted · {test.bestPercentage}%
                          </div>
                        ) : isLive ? (
                          <button onClick={() => navigate(`/student/test/${test._id}`)} className="dms-btn dms-btn-primary dms-btn-full">
                            <HiOutlinePlayCircle size={18} /> Start MCQ Test →
                          </button>
                        ) : (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            color: '#667085', fontSize: 13, fontWeight: 500,
                            background: '#f9fafb', borderRadius: 10,
                            padding: '10px 16px', justifyContent: 'center',
                            border: '1px solid #eaecf0',
                          }}>
                            <HiOutlineClock size={16} /> Starts in {getTimeUntil(test.startTime)}
                          </div>
                        )}
                      </>
                    )}

                    {test.testType === 'coding' && (
                      <button
                        disabled={!isLive || test.hasAttemptedCoding}
                        onClick={() => navigate(`/student/coding-test/${test._id}`)}
                        className="dms-btn dms-btn-primary dms-btn-full"
                        style={{ opacity: (!isLive || test.hasAttemptedCoding) ? 0.5 : 1 }}
                      >
                        {test.hasAttemptedCoding ? '✓ Submitted' : !isLive ? 'Not Live Yet' : '💻 Start Coding Test →'}
                      </button>
                    )}

                    {test.testType === 'combined' && (
                      <button
                        disabled={!isLive || (test.hasAttempted && test.hasAttemptedCoding)}
                        onClick={() => {
                          if (!test.hasAttempted) {
                            navigate(`/student/test/${test._id}`);
                          } else if (!test.hasAttemptedCoding) {
                            navigate(`/student/coding-test/${test._id}`);
                          }
                        }}
                        className="dms-btn dms-btn-primary dms-btn-full"
                        style={{ opacity: (!isLive || (test.hasAttempted && test.hasAttemptedCoding)) ? 0.5 : 1 }}
                      >
                        {(() => {
                          if (!isLive) return 'Not Live Yet';
                          if (test.hasAttempted && test.hasAttemptedCoding) return '✓ Completed';
                          if (!test.hasAttempted) return '🎯 Start Test (MCQ + Coding) →';
                          return '💻 Continue to Coding →';
                        })()}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Previous Results Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#101828', margin: 0 }}>Previous Results</h2>
          {results.length > 0 && (
            <Link to="/student/results" style={{ fontSize: 13, color: '#0e71eb', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <HiOutlineArrowRight size={14} />
            </Link>
          )}
        </div>

        {results.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <p style={{ color: '#101828', fontSize: 15, fontWeight: 600, margin: 0 }}>You haven't attempted any tests yet</p>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eaecf0' }}>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: '#475467', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Test</th>
                    <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: '#475467', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</th>
                    <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: '#475467', textTransform: 'uppercase', letterSpacing: '0.5px' }}>%</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: '#475467', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 5).map((r) => {
                    const pass = (r.percentage || 0) >= 40;
                    return (
                      <tr key={r._id} onClick={() => navigate(`/student/results/${r._id}`)}
                        style={{ borderBottom: '1px solid #eaecf0', cursor: 'pointer' }}
                      >
                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#101828' }}>{r.testId?.title || 'Test'}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: pass ? '#059669' : '#dc2626' }}>
                            {r.score}/{r.totalMarks}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, borderRadius: 20,
                            padding: '3px 10px',
                            background: pass ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
                            color: pass ? '#059669' : '#dc2626',
                            border: `1px solid ${pass ? 'rgba(16,185,129,0.25)' : 'rgba(220,38,38,0.25)'}`,
                          }}>{r.percentage}%</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 12, color: '#667085' }}>{formatDate(r.submittedAt)}</td>
                        <td style={{ padding: '14px 20px' }}><HiOutlineArrowRight size={14} style={{ color: '#667085' }} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
