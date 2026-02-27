import { useState } from 'react';
import { IdeLayout } from './components/IdeLayout';

import { AuthPage } from './components/AuthPage';
import { ResumeUpload } from './components/ResumeUpload';
import { ResumePreview } from './components/ResumePreview';
import { JobDashboard } from './components/JobDashboard';
import { ProfilePage } from './components/ProfilePage';
import { Toaster, toast } from 'react-hot-toast';

import { TechnicalExam } from './components/TechnicalExam';

type AppState = 'auth' | 'resume' | 'resume-preview' | 'dashboard' | 'exam' | 'simulation' | 'profile';

function App() {
  const [view, setView] = useState<AppState>('auth');
  const [user, setUser] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);

  // State to track if mission has started
  const [missionConfig, setMissionConfig] = useState<{
    role: string;
    company: string;
    level: string;
    focus?: string;
  } | null>(null);

  const [examScore, setExamScore] = useState<number | null>(null);

  const handleLogin = (username: string) => {
    setUser(username);
    setView('resume');
  };

  const handleResumeAnalyzed = (data: any) => {
    setResumeData(data);
    setView('resume-preview'); // Go to preview screen first
  };

  const handlePreviewConfirm = () => {
    setView('dashboard');
    toast.success('Profile Verified! Proceeding to Mission Selection.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('auth');
    toast.success("Identity Protocol Terminated.");
  };

  const handleStartMission = (config: any) => {
    setMissionConfig(config);
    setView('exam'); // Move to exam first
  };

  const handleExamFinish = (score: number) => {
    setExamScore(score);
    setView('simulation');
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid #333',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
          },
        }}
      />

      {view === 'auth' && <AuthPage onLogin={handleLogin} />}

      {view === 'resume' && <ResumeUpload onAnalyzeComplete={handleResumeAnalyzed} />}

      {view === 'resume-preview' && resumeData && (
        <ResumePreview
          resumeData={resumeData}
          onConfirm={handlePreviewConfirm}
          onBack={() => setView('resume')}
        />
      )}

      {view === 'dashboard' && (
        <JobDashboard
          userName={user || 'Candidate'}
          resumeData={resumeData}
          onStartSimulation={handleStartMission}
          onViewProfile={() => setView('profile')}
          onLogout={handleLogout}
        />
      )}

      {view === 'profile' && (
        <ProfilePage
          user={user || 'Candidate'}
          resumeData={resumeData}
          onBack={() => setView('dashboard')}
          onLogout={handleLogout}
        />
      )}

      {view === 'exam' && missionConfig && (
        <TechnicalExam
          role={missionConfig.role}
          company={missionConfig.company}
          level={missionConfig.level}
          focus={missionConfig.focus}
          onFinish={handleExamFinish}
        />
      )}

      {view === 'simulation' && missionConfig && (
        <IdeLayout
          role={missionConfig.role}
          company={missionConfig.company}
          experienceLevel={missionConfig.level}
        />
      )}
    </>
  );
}

export default App;