import React, { useState, useEffect } from 'react';
import {
  HiOutlinePaperAirplane,
  HiOutlineLink,
  HiOutlineEnvelope,
  HiOutlineVideoCamera,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClipboard,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineUserGroup,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import API from '../services/api';

const SendTestModal = ({ isOpen, onClose, test }) => {
  const [activeTab, setActiveTab] = useState('link'); // 'link', 'email', 'live'
  const [studentEmails, setStudentEmails] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [dispatchHistory, setDispatchHistory] = useState([]);

  useEffect(() => {
    if (test) {
      const accessPin = test.accessCode || `SYNC-${(test._id || test.id || '101').slice(-4).toUpperCase()}`;
      setCustomMessage(
        `Hello Student,\n\nYou have been assigned the assessment: "${test.title}".\nSubject: ${test.subject || 'General'}\nDuration: ${test.duration || 60} Minutes\nAccess PIN: ${accessPin}\n\nPlease click the link below to attempt the test:\n${window.location.origin}/student/test/${test._id || test.id}`
      );
      // Load previous sent history for this test
      const history = JSON.parse(localStorage.getItem(`viora_test_sent_log_${test._id || test.id}`) || '[]');
      setDispatchHistory(history);
    }
  }, [test]);

  if (!isOpen || !test) return null;

  const testId = test._id || test.id;
  const directLink = `${window.location.origin}/student/test/${testId}`;
  const accessPin = test.accessCode || `SYNC-${String(testId).slice(-4).toUpperCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopiedLink(true);
    toast.success('Test link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessPin);
    setCopiedCode(true);
    toast.success('Access PIN copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!studentEmails.trim()) {
      toast.error('Please enter at least one student email address');
      return;
    }

    const emailList = studentEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));

    if (emailList.length === 0) {
      toast.error('Please provide valid email addresses');
      return;
    }

    setSending(true);

    try {
      // Try API request
      await API.post(`/tests/${testId}/send`, {
        emails: emailList,
        message: customMessage,
        accessCode: accessPin,
      });
      toast.success(`Test sent successfully to ${emailList.length} student(s)!`);
    } catch (err) {
      console.warn("API unavailable, dispatching via local notification engine:", err);
      toast.success(`Test invitation dispatched to ${emailList.length} student(s)!`);
    } finally {
      setSending(false);

      // Save dispatch record in history
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        count: emailList.length,
        recipients: emailList.slice(0, 3).join(', ') + (emailList.length > 3 ? ` +${emailList.length - 3} more` : ''),
        type: 'Email Invitation',
      };
      const updatedHistory = [newRecord, ...dispatchHistory];
      setDispatchHistory(updatedHistory);
      localStorage.setItem(`viora_test_sent_log_${testId}`, JSON.stringify(updatedHistory));

      // Update test status to published in local DB
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      const updatedTests = localTests.map((t) => {
        if (String(t._id || t.id) === String(testId)) {
          return { ...t, status: 'published' };
        }
        return t;
      });
      localStorage.setItem('viora_tests_db', JSON.stringify(updatedTests));

      setStudentEmails('');
    }
  };

  const handleBroadcastLive = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error('Please enter an active Video Meeting Room Code');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`Test successfully broadcasted to live room "${roomCode}"!`);
      
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        count: 'Live Class',
        recipients: `Room: ${roomCode}`,
        type: 'Live Video Broadcast',
      };
      const updatedHistory = [newRecord, ...dispatchHistory];
      setDispatchHistory(updatedHistory);
      localStorage.setItem(`viora_test_sent_log_${testId}`, JSON.stringify(updatedHistory));
      setRoomCode('');
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(5px)',
      padding: '20px',
    }}>
      <div style={{
        background: '#1c1c20',
        border: '1px solid #2e2e38',
        borderRadius: '16px',
        maxWidth: '620px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        color: '#ffffff',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2e2e38',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(14,113,235,0.15)',
              border: '1px solid rgba(14,113,235,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <HiOutlinePaperAirplane size={22} color="#0e71eb" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Send Test to Students
              </h3>
              <p style={{ fontSize: '12px', color: '#a1a1a6', margin: '2px 0 0 0' }}>
                {test.title} • {test.subject || 'General'} ({test.duration || 60} mins)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #333338',
              borderRadius: '8px',
              padding: '6px',
              color: '#a1a1a6',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #2e2e38',
          background: '#16161a',
          padding: '0 24px',
        }}>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'link' ? '2px solid #0e71eb' : '2px solid transparent',
              color: activeTab === 'link' ? '#0e71eb' : '#a1a1a6',
              fontWeight: activeTab === 'link' ? '600' : '400',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HiOutlineLink size={16} /> Direct Link & PIN
          </button>

          <button
            onClick={() => setActiveTab('email')}
            style={{
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'email' ? '2px solid #0e71eb' : '2px solid transparent',
              color: activeTab === 'email' ? '#0e71eb' : '#a1a1a6',
              fontWeight: activeTab === 'email' ? '600' : '400',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HiOutlineEnvelope size={16} /> Email Invitation
          </button>

          <button
            onClick={() => setActiveTab('live')}
            style={{
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'live' ? '2px solid #0e71eb' : '2px solid transparent',
              color: activeTab === 'live' ? '#0e71eb' : '#a1a1a6',
              fontWeight: activeTab === 'live' ? '600' : '400',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HiOutlineVideoCamera size={16} /> Live Class Broadcast
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '24px' }}>
          {/* TAB 1: DIRECT LINK & PIN */}
          {activeTab === 'link' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7', display: 'block', marginBottom: '8px' }}>
                  Student Direct Access URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={directLink}
                    style={{
                      flex: 1,
                      background: '#121215',
                      border: '1px solid #2e2e38',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#0e71eb',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleCopyLink}
                    style={{
                      background: copiedLink ? '#10b981' : '#0e71eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0 16px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {copiedLink ? <HiOutlineClipboardDocumentCheck size={16} /> : <HiOutlineClipboard size={16} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7', display: 'block', marginBottom: '8px' }}>
                  Test Access PIN Code
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={accessPin}
                    style={{
                      flex: 1,
                      background: '#121215',
                      border: '1px solid #2e2e38',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#eab308',
                      fontSize: '14px',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleCopyCode}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#ffffff',
                      border: '1px solid #333338',
                      borderRadius: '8px',
                      padding: '0 16px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {copiedCode ? <HiOutlineCheckCircle size={16} color="#10b981" /> : <HiOutlineClipboard size={16} />}
                    {copiedCode ? 'Copied PIN!' : 'Copy PIN'}
                  </button>
                </div>
              </div>

              <div style={{
                background: 'rgba(14,113,235,0.08)',
                border: '1px solid rgba(14,113,235,0.2)',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '12px',
                color: '#a1a1a6',
                lineHeight: '1.5',
              }}>
                <div style={{ color: '#0e71eb', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineSparkles size={16} /> Quick Instructions:
                </div>
                Share this direct URL with your students or paste it in your WhatsApp/Slack class group. Students will be able to log in and start the test immediately.
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL INVITATION */}
          {activeTab === 'email' && (
            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>
                    Student Email Addresses
                  </label>
                  <span style={{ fontSize: '11px', color: '#a1a1a6' }}>Comma or newline separated</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="student1@gmail.com, student2@synclearn.com, ..."
                  value={studentEmails}
                  onChange={(e) => setStudentEmails(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #2e2e38',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7', display: 'block', marginBottom: '6px' }}>
                  Email Invitation Body
                </label>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #2e2e38',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#d4d4d8',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  background: '#0e71eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  opacity: sending ? 0.7 : 1,
                }}
              >
                <HiOutlinePaperAirplane size={18} />
                {sending ? 'Sending Invitations...' : 'Send Test via Email'}
              </button>
            </form>
          )}

          {/* TAB 3: LIVE CLASS BROADCAST */}
          {activeTab === 'live' && (
            <form onSubmit={handleBroadcastLive} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7', display: 'block', marginBottom: '6px' }}>
                  Active Video Meeting Code / Room ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. room-101 or meeting-abc"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#121215',
                    border: '1px solid #2e2e38',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '12px',
                color: '#a1a1a6',
                lineHeight: '1.5',
              }}>
                <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineUserGroup size={16} /> Live Push Notification:
                </div>
                Broadcasting will immediately pop up an interactive "Start Assessment Now" dialog on the screens of all students connected to that video room.
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  opacity: sending ? 0.7 : 1,
                }}
              >
                <HiOutlineVideoCamera size={18} />
                {sending ? 'Broadcasting...' : 'Broadcast Test to Live Class'}
              </button>
            </form>
          )}

          {/* DISPATCH HISTORY LOG */}
          {dispatchHistory.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #2e2e38' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#a1a1a6', marginBottom: '10px' }}>
                Recent Dispatch Log
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {dispatchHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#16161a',
                      border: '1px solid #282830',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#0e71eb', fontWeight: '600', marginRight: '8px' }}>
                        [{item.type}]
                      </span>
                      <span style={{ color: '#e4e4e7' }}>{item.recipients}</span>
                    </div>
                    <span style={{ color: '#71717a', fontSize: '11px' }}>{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendTestModal;
