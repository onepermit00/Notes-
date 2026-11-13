import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authApi } from '../services/authApi';

// SOPs and training live on the server so that what a manager uploads is what
// the front desk reads. The setters keep their old shape (value or updater);
// every change is diffed and sent to the server in order.
const SharedDataContext = createContext(null);

export const MAX_KNOWLEDGE_FILE_BYTES = 6 * 1024 * 1024;

const sameItem = (a, b) => a.title === b.title && a.category === b.category && a.fileName === b.fileName && a.dataURL === b.dataURL && (a.body || '') === (b.body || '');

export function SharedDataProvider({ children }) {
  const [uploadedSOPs,  setSops]     = useState([]);
  const [trainingItems, setTraining] = useState([]);
  const [knowledgeError, setKnowledgeError] = useState('');
  const queue = useRef(Promise.resolve());
  const lists = useRef({ sop: [], training: [] });

  const refreshKnowledge = useCallback(async () => {
    if (!localStorage.getItem('op_token')) return;
    try {
      const items = await authApi.getKnowledge();
      const sops = items.filter(item => item.kind === 'sop');
      const training = items.filter(item => item.kind === 'training');
      lists.current = { sop: sops, training };
      setSops(sops);
      setTraining(training);
    } catch { /* keep what is on screen */ }
  }, []);

  useEffect(() => { refreshKnowledge(); }, [refreshKnowledge]);

  const send = useCallback((job) => {
    queue.current = queue.current.then(job).catch((error) => {
      const status = error?.response?.status;
      setKnowledgeError(status === 413
        ? 'That file is too large to share with the desk. Please upload a file under 6 MB.'
        : (typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : 'That change could not be saved. Check your connection and try again.'));
      return refreshKnowledge();
    });
  }, [refreshKnowledge]);

  const makeSetter = useCallback((kind, setState) => (update) => {
    const prev = lists.current[kind];
    const next = typeof update === 'function' ? update(prev) : update;
    lists.current = { ...lists.current, [kind]: next };
    setState(next);
    const before = new Map(prev.map(item => [item.id, item]));
    const after = new Set(next.map(item => item.id));
    next.forEach(item => {
      const old = before.get(item.id);
      if (!old || !sameItem(old, item)) send(() => authApi.saveKnowledge(kind, item));
    });
    prev.forEach(item => { if (!after.has(item.id)) send(() => authApi.deleteKnowledge(item.id)); });
  }, [send]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setUploadedSOPs  = useCallback(makeSetter('sop', setSops), [makeSetter]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setTrainingItems = useCallback(makeSetter('training', setTraining), [makeSetter]);

  const setKnowledgeItemStatus = useCallback((id, status) => {
    const patch = list => list.map(item => item.id === id ? { ...item, status } : item);
    lists.current = { sop: patch(lists.current.sop), training: patch(lists.current.training) };
    setSops(patch);
    setTraining(patch);
    send(() => authApi.setKnowledgeStatus(id, status));
  }, [send]);

  const setTrainingCompleted = useCallback((id, completed) => {
    const patch = list => list.map(item => item.id === id ? { ...item, completed } : item);
    lists.current = { ...lists.current, training: patch(lists.current.training) };
    setTraining(patch);
    send(() => authApi.setTrainingCompleted(id, completed));
  }, [send]);

  const putLocal = useCallback((kind, saved) => {
    const list = lists.current[kind];
    const next = list.some(item => item.id === saved.id) ? list.map(item => item.id === saved.id ? saved : item) : [...list, saved];
    lists.current = { ...lists.current, [kind]: next };
    (kind === 'sop' ? setSops : setTraining)(next);
  }, []);

  // Save an SOP or training item and wait for the server, uploading its file if
  // there is one. Used by the manager's add/edit screen, which shows progress and errors.
  const saveKnowledgeItem = useCallback(async (kind, item, { file = null, fileName = '', removeFile = false, onProgress } = {}) => {
    const isNew = !item.id;
    const id = item.id || `${kind === 'sop' ? 'sop' : 'training'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let saved = await authApi.saveKnowledge(kind, { ...item, id, dataURL: '' }, { fileToFollow: !!file, removeFile });
    if (file) {
      try {
        saved = await authApi.uploadKnowledgeFile(id, file, fileName, onProgress);
      } catch (error) {
        if (isNew) await authApi.deleteKnowledge(id).catch(() => {});
        else putLocal(kind, saved);
        throw error;
      }
    }
    putLocal(kind, saved);
    return saved;
  }, [putLocal]);

  const deleteKnowledgeItem = useCallback(async (kind, id) => {
    await authApi.deleteKnowledge(id);
    const next = lists.current[kind].filter(item => item.id !== id);
    lists.current = { ...lists.current, [kind]: next };
    (kind === 'sop' ? setSops : setTraining)(next);
  }, []);

  return (
    <SharedDataContext.Provider value={{
      uploadedSOPs, setUploadedSOPs, trainingItems, setTrainingItems, saveKnowledgeItem, deleteKnowledgeItem,
      setKnowledgeItemStatus, setTrainingCompleted, refreshKnowledge,
      knowledgeError, clearKnowledgeError: () => setKnowledgeError(''),
    }}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  return useContext(SharedDataContext);
}
