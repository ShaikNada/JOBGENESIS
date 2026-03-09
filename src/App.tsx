import { useState, useEffect } from 'react';
import { IdeLayout } from './components/IdeLayout';

import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { ResumeUpload } from './components/ResumeUpload';
import { ResumePreview } from './components/ResumePreview';
import { JobDashboard } from './components/JobDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { ProfilePage } from './components/ProfilePage';
import { Toaster, toast } from 'react-hot-toast';

import { TechnicalExam } from './components/TechnicalExam';
import { AiInterviewRoom } from './components/AiInterviewRoom';
import { DetailedReportView } from './components/DetailedReportView';

type AppState = 'landing' | 'auth' | 'resume' | 'resume-preview' | 'dashboard' | 'exam' | 'simulation' | 'interview' | 'report' | 'profile' | 'recruiter-dashboard';

function App() {
  const [view, setView] = useState<AppState>('landing');
  const [user, setUser] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    // Check session on mount
    const savedUserStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (token) {
      // Fetch fresh profile from backend
      fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data._id) {
            setUser(data.name);
            setResumeData(data.resumeData);
            if (data.role === 'recruiter') {
              setView('recruiter-dashboard');
            } else {
              setView('dashboard');
            }
          } else {
            // Token might be invalid
            handleLogout();
          }
        })
        .catch(err => {
          console.error("Profile sync failed", err);
          // Fallback to local storage if offline or error
          if (savedUserStr) {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser.name);
            setView(savedUser.role === 'recruiter' ? 'recruiter-dashboard' : 'dashboard');
          }
        });
    }
  }, []);

  // State to track if mission has started
  const [missionConfig, setMissionConfig] = useState<{
    role: string;
    company: string;
    level: string;
    focus?: string;
    difficulty?: 'easy' | 'normal' | 'hard';
  } | null>(null);

  const [examScore, setExamScore] = useState<number | null>(null);
  const [codingResult, setCodingResult] = useState<{ score: number, finalCode: string } | null>(null);
  const [interviewData, setInterviewData] = useState<any>(null);

  const handleLogin = (username: string, role?: string) => {
    setUser(username);
    if (role === 'recruiter') {
      setView('recruiter-dashboard');
    } else {
      setView('dashboard'); // Assuming returning users go to dashboard directly or resume upload if they want.
    }
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
    setView('landing');
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

  const handleSimulationFinish = (score: number, finalCode: string) => {
    setCodingResult({ score, finalCode });
    setView('interview');
  };

  const handleInterviewFinish = (data: any) => {
    setInterviewData(data);
    setView('report');
  };

  const totalTime = 45 * 60; // Mock full time for now, or track it globally

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

      {view === 'landing' && <LandingPage onEnterTerminal={() => setView('auth')} />}

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
          onUploadResume={() => setView('resume')}
          onLogout={handleLogout}
        />
      )}

      {view === 'recruiter-dashboard' && (
        <RecruiterDashboard
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
          difficulty={missionConfig.difficulty || 'normal'}
          onFinish={handleExamFinish}
        />
      )}

      {view === 'simulation' && missionConfig && (
        <IdeLayout
          role={missionConfig.role}
          company={missionConfig.company}
          experienceLevel={missionConfig.level}
          difficulty={missionConfig.difficulty || 'normal'}
          onComplete={handleSimulationFinish}
        />
      )}

      {view === 'interview' && missionConfig && codingResult && (
        <AiInterviewRoom
          code={codingResult.finalCode}
          problemTitle={`${missionConfig.role} Challenge`}
          problemDescription="Assess architectural and algorithmic choices."
          targetRole={missionConfig.role}
          company={missionConfig.company}
          difficulty={missionConfig.difficulty || 'normal'}
          onComplete={handleInterviewFinish}
        />
      )}

      {view === 'report' && missionConfig && codingResult && interviewData && (
        <DetailedReportView
          score={codingResult.score}
          mcqScore={examScore || 0}
          totalTime={totalTime}
          role={missionConfig.role}
          company={missionConfig.company}
          skillTags={[missionConfig.role, "React", "Node.js"]} // Can be dynamic
          interviewData={interviewData}
          onRestart={() => setView('dashboard')}
        />
      )}
    </>
  );
}

export default App;