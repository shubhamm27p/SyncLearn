import React, { Component } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/tests';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '440px', background: '#242428', border: '1px solid #333338', borderRadius: '16px', padding: '32px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiOutlineExclamationTriangle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: '#a1a1a6', marginBottom: '20px', fontSize: '14px' }}>
              An unexpected error occurred in the test module.
            </p>
            {this.state.error && (
              <pre style={{ textAlign: 'left', fontSize: '12px', color: '#f87171', background: '#1a1a1d', border: '1px solid #333338', borderRadius: '8px', padding: '12px', marginBottom: '20px', overflowX: 'auto' }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{ padding: '10px 20px', backgroundColor: '#0e71eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Return to Tests
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
