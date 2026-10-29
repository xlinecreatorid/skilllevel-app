import { useEffect, useMemo, useRef, useState } from 'react';
import { Shell } from './components/Shell.jsx';
import { SettingsDialog } from './components/Settings.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { Dashboard } from './views/Dashboard.jsx';
import { Modules } from './views/Modules.jsx';
import { ModuleDetail } from './views/ModuleDetail.jsx';
import { QuizView } from './views/QuizView.jsx';
import { Tutor } from './views/Tutor.jsx';
import { Upload } from './views/Upload.jsx';
import { Progress } from './views/Progress.jsx';
import { health } from './lib/aiClient.js';
import { builtinMaterials } from './lib/materials.js';
import { I18nProvider } from './lib/i18n.jsx';
import {
  getCurrentUser,
  loadProgressFromCloud,
  signOut,
  subscribeAuthChanges,
  syncProgressToCloud,
} from './lib/supabaseClient.js';
import {
  levelFor,
  loadChat,
  loadProgress,
  loadSettings,
  loadUploaded,
  purgeLegacySecrets,
  saveChat,
  saveProgress,
  saveSettings,
  saveUploaded,
  touchStreak,
} from './lib/store.js';

const VIEWS = ['dashboard', 'modul', 'kuis', 'tutor', 'unggah', 'progres'];

function AppContent() {
  const [view, setView] = useState('dashboard');
  const [openModuleId, setOpenModuleId] = useState(null);
  const [focusModuleId, setFocusModuleId] = useState(null);
  const [uploaded, setUploaded] = useState(() => loadUploaded());
  const [progress, setProgress] = useState(() => loadProgress());
  const [settings, setSettings] = useState(() => loadSettings());
  const [customKey, setCustomKey] = useState('');
  const [serverInfo, setServerInfo] = useState(null);
  const [chat, setChat] = useState(() => loadChat());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const mainRef = useRef(null);

  const materials = useMemo(() => [...builtinMaterials(), ...uploaded], [uploaded]);

  useEffect(() => {
    purgeLegacySecrets();
    let alive = true;
    health().then((info) => {
      if (alive) setServerInfo(info);
    });

    getCurrentUser().then((u) => {
      if (alive && u) setUser(u);
    });

    const unsubscribe = subscribeAuthChanges((authUser) => {
      setUser(authUser);
      if (authUser?.id) {
        loadProgressFromCloud(authUser.id).then((cloudProgress) => {
          if (cloudProgress) {
            setProgress((prev) => ({
              ...prev,
              xp: Math.max(prev.xp, cloudProgress.xp || 0),
              completedModules: { ...prev.completedModules, ...(cloudProgress.completedModules || {}) },
              quizResults: { ...prev.quizResults, ...(cloudProgress.quizResults || {}) },
            }));
          }
        });
      }
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    saveProgress(progress);
    if (user?.id) {
      syncProgressToCloud(user.id, progress);
    }
  }, [progress, user]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveChat(chat);
  }, [chat]);

  useEffect(() => {
    saveUploaded(uploaded);
  }, [uploaded]);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, openModuleId]);

  const level = levelFor(progress.xp);
  const openModule = materials.find((m) => m.id === openModuleId) || null;

  const markComplete = (id) => {
    setProgress((prev) => {
      if (prev.completedModules[id]) return prev;
      return touchStreak({
        ...prev,
        xp: prev.xp + 50,
        completedModules: { ...prev.completedModules, [id]: new Date().toISOString() },
      });
    });
  };

  const recordQuiz = (id, result) => {
    setProgress((prev) => {
      const previous = prev.quizResults[id];
      const best = previous && previous.percent >= result.percent ? previous : result;
      return touchStreak({
        ...prev,
        xp: prev.xp + result.xp,
        quizResults: { ...prev.quizResults, [id]: best },
      });
    });
  };

  const go = (next, moduleId = null) => {
    setView(next);
    setOpenModuleId(moduleId);
    if (moduleId) setFocusModuleId(moduleId);
  };

  const addUploaded = (material) => {
    setUploaded((prev) => [material, ...prev]);
    setProgress((prev) => touchStreak({ ...prev, xp: prev.xp + 50 }));
  };

  const removeUploaded = (id) => {
    setUploaded((prev) => prev.filter((m) => m.id !== id));
    setProgress((prev) => {
      const completedModules = { ...prev.completedModules };
      const quizResults = { ...prev.quizResults };
      delete completedModules[id];
      delete quizResults[id];
      return { ...prev, completedModules, quizResults };
    });
    if (openModuleId === id) go('modul');
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  const aiSettings = {
    endpoint: settings.endpoint,
    model: settings.model,
    provider: settings.provider || 'openai',
    apiKey: customKey,
  };

  return (
    <>
      <Shell
        view={view}
        views={VIEWS}
        onNavigate={(next) => go(next)}
        level={level}
        xp={progress.xp}
        onOpenSettings={() => setSettingsOpen(true)}
        serverReady={Boolean(serverInfo?.hasServerKey)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      >
        <main
          id="konten"
          ref={mainRef}
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 outline-none sm:px-8 sm:pt-10"
        >
          {view === 'dashboard' ? (
            <Dashboard
              materials={materials}
              progress={progress}
              level={level}
              serverInfo={serverInfo}
              onOpenModule={(id) => go('modul', id)}
              onStartQuiz={() => go('kuis')}
              onUpload={() => go('unggah')}
              onTutor={() => go('tutor')}
            />
          ) : null}

          {view === 'modul' && !openModule ? (
            <Modules
              materials={materials}
              progress={progress}
              onOpen={(id) => setOpenModuleId(id)}
              onUpload={() => go('unggah')}
            />
          ) : null}

          {view === 'modul' && openModule ? (
            <ModuleDetail
              material={openModule}
              completed={Boolean(progress.completedModules[openModule.id])}
              quizResult={progress.quizResults[openModule.id] || null}
              onBack={() => setOpenModuleId(null)}
              onComplete={() => markComplete(openModule.id)}
              onQuiz={() => go('kuis', openModule.id)}
              onAsk={() => go('tutor', openModule.id)}
              onDelete={openModule.source === 'unggahan' ? () => removeUploaded(openModule.id) : null}
            />
          ) : null}

          {view === 'kuis' ? (
            <QuizView
              materials={materials}
              initialModuleId={openModuleId}
              level={level}
              settings={aiSettings}
              onRecord={recordQuiz}
              onOpenModule={(id) => go('modul', id)}
            />
          ) : null}

          {view === 'tutor' ? (
            <Tutor
              materials={materials}
              chat={chat}
              settings={aiSettings}
              serverInfo={serverInfo}
              focusModuleId={focusModuleId}
              onFocusChange={setFocusModuleId}
              onChatChange={setChat}
              onOpenModule={(id) => go('modul', id)}
            />
          ) : null}

          {view === 'unggah' ? (
            <Upload
              settings={aiSettings}
              serverInfo={serverInfo}
              onAdd={addUploaded}
              onOpenModule={(id) => go('modul', id)}
            />
          ) : null}

          {view === 'progres' ? (
            <Progress
              materials={materials}
              progress={progress}
              level={level}
              onOpenModule={(id) => go('modul', id)}
              onStartQuiz={() => go('kuis')}
            />
          ) : null}
        </main>
      </Shell>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
        serverInfo={serverInfo}
        customKey={customKey}
        onCustomKeyChange={setCustomKey}
      />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(loggedInUser) => setUser(loggedInUser)}
      />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
