import React from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#242428',
        border: '1px solid #333338',
        borderRadius: '16px',
        padding: '28px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(14,113,235,0.15)',
          border: `1px solid ${variant === 'danger' ? 'rgba(239,68,68,0.3)' : 'rgba(14,113,235,0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <HiOutlineExclamationTriangle 
            size={24} 
            color={variant === 'danger' ? '#ef4444' : '#0e71eb'} 
          />
        </div>

        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '8px'
        }}>
          {title}
        </h3>

        <p style={{
          fontSize: '14px',
          color: '#a1a1a6',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
          {message}
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button style={{
            flex: 1,
            padding: '10px 16px',
            background: '#1a1a1d',
            border: '1px solid #333338',
            borderRadius: '8px',
            color: '#e1e1e6',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onClick={onClose}
          disabled={loading}>
            Cancel
          </button>

          <button style={{
            flex: 1,
            padding: '10px 16px',
            background: variant === 'danger' ? '#ef4444' : '#0e71eb',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={onConfirm}
          disabled={loading}>
            {loading && (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
