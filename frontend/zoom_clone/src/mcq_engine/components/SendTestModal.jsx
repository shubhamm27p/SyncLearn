import React, { useState } from 'react';
import {
  HiOutlinePaperAirplane,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClipboard,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const SendTestModal = ({ isOpen, onClose, test }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !test) return null;

  const testId = test._id || test.id;
  const directLink = `${window.location.origin}/student/test/${testId}`;
  const accessPin = test.accessCode || `SYNC-${String(testId).slice(-4).toUpperCase()}`;

  const messageText = `📚 Test: ${test.title}

🔗 Test Link:
${directLink}

🔑 Test PIN: ${accessPin}

Please open the link and enter the PIN to start the test.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopiedLink(true);
    toast.success('Link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessPin);
    setCopiedCode(true);
    toast.success('PIN copied!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(messageText);
    toast.success('Copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
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
        maxWidth: '520px',
        width: '100%',
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
                Share Test
              </h3>
              <p style={{ fontSize: '12px', color: '#a1a1a6', margin: '2px 0 0 0' }}>
                {test.title} • {test.duration || 60} mins
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

        {/* Modal Body Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7', display: 'block', marginBottom: '8px' }}>
              Student Test Link
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
              Test PIN
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
                {copiedCode ? 'Copied!' : 'Copy PIN'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
             <button
                onClick={handleWhatsAppShare}
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {/* SVG for WhatsApp icon to ensure it works without extra icon libraries */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382C17.26 14.276 16.208 13.75 16.002 13.676C15.795 13.6 15.65 13.568 15.502 13.78C15.353 13.992 14.939 14.482 14.811 14.63C14.685 14.78 14.557 14.798 14.345 14.693C14.133 14.587 13.447 14.364 12.635 13.64C12.004 13.076 11.579 12.38 11.451 12.169C11.325 11.957 11.439 11.843 11.545 11.737C11.64 11.642 11.757 11.492 11.862 11.375C11.968 11.258 12.006 11.173 12.073 11.025C12.14 10.877 12.105 10.748 12.053 10.643C12.002 10.536 11.577 9.484 11.4 9.04C11.231 8.608 11.054 8.665 10.923 8.653C10.803 8.64 10.655 8.64 10.507 8.64C10.358 8.64 10.117 8.694 9.904 8.927C9.692 9.16 9.096 9.71 9.096 10.832C9.096 11.953 9.926 13.033 10.043 13.192C10.16 13.35 11.642 15.658 13.945 16.654C14.494 16.892 14.922 17.037 15.258 17.144C15.808 17.319 16.307 17.294 16.702 17.234C17.143 17.166 18.057 16.674 18.247 16.123C18.438 15.572 18.438 15.105 18.375 15.002C18.312 14.893 18.163 14.83 17.952 14.723L17.472 14.382ZM12.015 20.25H12.009C10.573 20.25 9.176 19.866 7.96 19.147L7.674 18.977L4.606 19.782L5.429 16.79L5.244 16.495C4.453 15.234 4.037 13.766 4.037 12.247C4.037 7.834 7.632 4.243 12.052 4.243C14.195 4.246 16.208 5.08 17.721 6.598C19.232 8.113 20.065 10.124 20.065 12.261C20.063 16.671 16.467 20.25 12.015 20.25ZM12.046 2.5C6.67 2.5 2.292 6.878 2.292 12.253C2.292 13.972 2.743 15.632 3.585 17.094L2 22.89L7.925 21.336C9.333 22.106 10.932 22.508 12.573 22.508C17.947 22.508 22.327 18.13 22.327 12.753C22.327 7.375 17.95 3 12.573 3C12.4 3 12.221 2.5 12.046 2.5Z" fill="currentColor"/>
                </svg>
                Share on WhatsApp
              </button>
              
              <button
                onClick={handleCopyAll}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: '1px solid #333338',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <HiOutlineClipboardDocumentCheck size={18} />
                Copy All
              </button>
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
            Share this directly with your students via WhatsApp or copy the details to paste into your class group.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendTestModal;
