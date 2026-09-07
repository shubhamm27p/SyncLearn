import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import {
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineChevronLeft,
} from 'react-icons/hi2';

const DIFFICULTY_COLORS = {
  easy: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  medium: { bg: 'rgba(234,179,8,0.15)', color: '#eab308' },
  hard: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

const ManageCodingProblems = () => {
  const { theme } = useTheme();
  const { id: testId } = useParams();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    totalMarks: 10,
    timeLimitMs: 2000,
    difficulty: 'medium',
    allowedLanguages: ['c', 'python', 'java'],
    testCases: [{ input: '', expectedOutput: '', isHidden: false, points: 1 }],
  });

  const [deleteModal, setDeleteModal] = useState({ open: false, problem: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      const [testRes, probRes] = await Promise.all([
        API.get(`/tests/${testId}`),
        API.get(`/coding/${testId}/problems`),
      ]);
      setTestTitle(testRes.data.data?.title || 'Test');
      setProblems(probRes.data.data || []);
    } catch (err) {
      console.warn("Server unavailable, loading from local storage:", err);
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      const localTest = localTests.find(t => t._id === testId || t.id === testId);
      if (localTest) {
        setTestTitle(localTest.title || 'Local Test');
        setProblems(localTest.codingProblems || []);
      } else {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', inputFormat: '', outputFormat: '',
      constraints: '', sampleInput: '', sampleOutput: '',
      totalMarks: 10, timeLimitMs: 2000, difficulty: 'medium',
      allowedLanguages: ['c', 'python', 'java'],
      testCases: [{ input: '', expectedOutput: '', isHidden: false, points: 1 }],
    });
    setEditingId(null);
  };

  const handleEdit = (problem) => {
    setForm({
      title: problem.title,
      description: problem.description,
      inputFormat: problem.inputFormat || '',
      outputFormat: problem.outputFormat || '',
      constraints: problem.constraints || '',
      sampleInput: problem.sampleInput || '',
      sampleOutput: problem.sampleOutput || '',
      totalMarks: problem.totalMarks,
      timeLimitMs: problem.timeLimitMs,
      difficulty: problem.difficulty,
      allowedLanguages: problem.allowedLanguages || ['c', 'python', 'java'],
      testCases: problem.testCases.length > 0
        ? problem.testCases.map(tc => ({
            input: tc.input || '',
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            points: tc.points,
          }))
        : [{ input: '', expectedOutput: '', isHidden: false, points: 1 }],
    });
    setEditingId(problem._id);
    setShowForm(true);
  };

  const addTestCase = () => {
    setForm(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false, points: 1 }],
    }));
  };

  const removeTestCase = (index) => {
    if (form.testCases.length <= 1) return;
    setForm(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const updateTestCase = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  const toggleLanguage = (lang) => {
    setForm(prev => ({
      ...prev,
      allowedLanguages: prev.allowedLanguages.includes(lang)
        ? prev.allowedLanguages.filter(l => l !== lang)
        : [...prev.allowedLanguages, lang],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');
    if (form.testCases.some(tc => !tc.expectedOutput.trim())) return toast.error('All test cases need expected output');
    if (form.allowedLanguages.length === 0) return toast.error('At least one language must be allowed');

    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/coding/problems/${editingId}`, form);
        toast.success('Problem updated');
      } else {
        await API.post(`/coding/${testId}/problems`, form);
        toast.success('Problem created');
      }
      resetForm();
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.warn("Server save failed, using local storage fallback:", err);
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      const testIndex = localTests.findIndex(t => t._id === testId || t.id === testId);
      
      if (testIndex !== -1 || testId.startsWith('test_local_')) {
        let testToUpdate = testIndex !== -1 ? localTests[testIndex] : { _id: testId, title: 'Local Test', codingProblems: [] };
        if (!testToUpdate.codingProblems) testToUpdate.codingProblems = [];
        
        if (editingId) {
          testToUpdate.codingProblems = testToUpdate.codingProblems.map(p => 
            p._id === editingId ? { ...form, _id: editingId, testId } : p
          );
          toast.success('Problem updated (offline)');
        } else {
          testToUpdate.codingProblems.push({
            _id: `coding_${Date.now()}`,
            testId,
            ...form,
            createdAt: new Date().toISOString()
          });
          toast.success('Problem created (offline)');
        }
        
        if (testIndex !== -1) {
          localTests[testIndex] = testToUpdate;
        } else {
          localTests.unshift(testToUpdate);
        }
        
        localStorage.setItem('viora_tests_db', JSON.stringify(localTests));
        resetForm();
        setShowForm(false);
        fetchData();
      } else {
        toast.error(err.response?.data?.message || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.problem) return;
    setDeleting(true);
    try {
      await API.delete(`/coding/problems/${deleteModal.problem._id}`);
      toast.success('Problem deleted');
      setDeleteModal({ open: false, problem: null });
      fetchData();
    } catch (err) {
      console.warn("Delete failed, using local storage fallback:", err);
      const localTests = JSON.parse(localStorage.getItem('viora_tests_db') || '[]');
      const testIndex = localTests.findIndex(t => t._id === testId || t.id === testId);
      if (testIndex !== -1 && localTests[testIndex].codingProblems) {
        localTests[testIndex].codingProblems = localTests[testIndex].codingProblems.filter(p => p._id !== deleteModal.problem._id);
        localStorage.setItem('viora_tests_db', JSON.stringify(localTests));
        toast.success('Problem deleted (offline)');
        setDeleteModal({ open: false, problem: null });
        fetchData();
      } else {
        toast.error('Failed to delete');
      }
    } finally {
      setDeleting(false);
    }
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(14,113,235,0.2)', borderTopColor: '#0e71eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button onClick={() => navigate('/admin/tests')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', marginBottom: '8px', padding: 0 }}>
            <HiOutlineChevronLeft size={14} /> Back to Tests
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Coding Problems
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {testTitle} — {problems.length} problem{problems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="dms-btn dms-btn-primary">
          <HiOutlinePlus size={16} /> Add Problem
        </button>
      </div>

      {!showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {problems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '15px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              No coding problems yet. Click "Add Problem" to create one.
            </div>
          ) : (
            problems.map((p) => {
              const dc = DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.medium;
              return (
                <div key={p._id} style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0e71eb' }}>#{p.problemNo}</span>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.title}</span>
                      <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: dc.bg, color: dc.color, textTransform: 'capitalize' }}>{p.difficulty}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{p.totalMarks} marks</span>
                      <span>{p.testCases?.length || 0} test cases</span>
                      <span>{p.timeLimitMs}ms limit</span>
                      <span>{p.allowedLanguages?.join(', ')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(p)} title="Edit" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                      <HiOutlinePencilSquare size={16} />
                    </button>
                    <button onClick={() => setDeleteModal({ open: true, problem: p })} title="Delete" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              {editingId ? 'Edit Problem' : 'New Coding Problem'}
            </h2>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}>✕ Cancel</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Two Sum" className="dms-input" />
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(prev => ({ ...prev, difficulty: e.target.value }))} className="dms-select">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Total Marks</label>
              <input type="number" min="1" value={form.totalMarks} onChange={e => setForm(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 10 }))} className="dms-input" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Problem Description *</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the problem statement..." rows={6} className="dms-input" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Input Format</label>
              <textarea value={form.inputFormat} onChange={e => setForm(prev => ({ ...prev, inputFormat: e.target.value }))} placeholder="Describe the input format..." rows={3} className="dms-input" style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Output Format</label>
              <textarea value={form.outputFormat} onChange={e => setForm(prev => ({ ...prev, outputFormat: e.target.value }))} placeholder="Describe the output format..." rows={3} className="dms-input" style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Constraints</label>
            <textarea value={form.constraints} onChange={e => setForm(prev => ({ ...prev, constraints: e.target.value }))} placeholder="e.g. 1 ≤ N ≤ 10^5" rows={2} className="dms-input" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Sample Input</label>
              <textarea value={form.sampleInput} onChange={e => setForm(prev => ({ ...prev, sampleInput: e.target.value }))} placeholder="5&#10;1 2 3 4 5" rows={3} className="dms-input" style={{ resize: 'vertical', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={labelStyle}>Sample Output</label>
              <textarea value={form.sampleOutput} onChange={e => setForm(prev => ({ ...prev, sampleOutput: e.target.value }))} placeholder="15" rows={3} className="dms-input" style={{ resize: 'vertical', fontFamily: 'monospace' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={labelStyle}>Time Limit (ms)</label>
              <input type="number" min="500" step="500" value={form.timeLimitMs} onChange={e => setForm(prev => ({ ...prev, timeLimitMs: parseInt(e.target.value) || 2000 }))} className="dms-input" />
            </div>
            <div>
              <label style={labelStyle}>Allowed Languages</label>
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                {['c', 'python', 'java'].map(lang => (
                  <button key={lang} type="button" onClick={() => toggleLanguage(lang)} style={{ padding: '8px 16px', borderRadius: '8px', border: form.allowedLanguages.includes(lang) ? '2px solid #0e71eb' : '1px solid var(--border-color)', background: form.allowedLanguages.includes(lang) ? 'rgba(14,113,235,0.15)' : 'transparent', color: form.allowedLanguages.includes(lang) ? '#0e71eb' : 'var(--text-muted)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase' }}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Test Cases ({form.testCases.length})</label>
              <button type="button" onClick={addTestCase} className="dms-btn dms-btn-sm dms-btn-outline">
                <HiOutlinePlus size={14} /> Add Test Case
              </button>
            </div>
            {form.testCases.map((tc, idx) => (
              <div key={idx} style={{ background: 'var(--bg-hover)', borderRadius: '10px', padding: '16px', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Test Case #{idx + 1}</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(idx, 'isHidden', e.target.checked)} />
                      Hidden
                    </label>
                    <input type="number" min="0" value={tc.points} onChange={e => updateTestCase(idx, 'points', parseInt(e.target.value) || 0)} className="dms-input" style={{ width: '70px', textAlign: 'center', padding: '4px 8px' }} placeholder="Pts" />
                    {form.testCases.length > 1 && (
                      <button type="button" onClick={() => removeTestCase(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <HiOutlineTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Input</label>
                    <textarea value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} rows={3} className="dms-input" style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }} placeholder="stdin input..." />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Expected Output *</label>
                    <textarea value={tc.expectedOutput} onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)} rows={3} className="dms-input" style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }} placeholder="expected stdout..." />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={saving} className="dms-btn dms-btn-primary">
              {saving ? 'Saving...' : (editingId ? 'Update Problem' : 'Create Problem')}
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="dms-btn dms-btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Problem?"
        message={`Are you sure you want to delete "${deleteModal.problem?.title}"? This cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Problem'}
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteModal({ open: false, problem: null })}
      />
    </div>
  );
};

export default ManageCodingProblems;
