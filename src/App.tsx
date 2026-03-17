import React, { useState, useEffect } from 'react';
import { IdeLayout } from './components/IdeLayout';
import { getSocket } from './socket';

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
import { DigitalImmunityWrapper } from './components/DigitalImmunityWrapper';

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
    bountyId?: string;
    roomId?: string; // For Co-Op mode
  } | null>(null);

  const [examScore, setExamScore] = useState<number | null>(null);
  const [codingResult, setCodingResult] = useState<{ score: number, finalCode: string } | null>(null);
  const [interviewData, setInterviewData] = useState<any>(null);

  // Generate a unique tracking ID for this candidate session
  const candidateId = React.useRef('C-' + Math.floor(Math.random() * 9000 + 1000)).current;

  // Helper to push telemetry to the Recruiter Dashboard
  const emitTelemetry = (updates: any) => {
    getSocket().emit('candidate_telemetry', {
      id: candidateId,
      name: user || 'Guest Operative',
      ...updates
    });
  };

  // ─── XP Award Helper ───
  const roleToDomains = (role: string): string[] => {
    const r = role.toLowerCase();
    if (r.includes('frontend')) return ['frontend', 'algorithms'];
    if (r.includes('backend') || r.includes('architect')) return ['backend', 'systemDesign'];
    if (r.includes('full stack')) return ['frontend', 'backend'];
    if (r.includes('security')) return ['security', 'backend'];
    if (r.includes('devops')) return ['backend', 'systemDesign'];
    if (r.includes('ai') || r.includes('ml') || r.includes('data')) return ['algorithms', 'backend'];
    if (r.includes('mobile')) return ['frontend', 'algorithms'];
    if (r.includes('anomaly')) return ['backend', 'security'];
    return ['algorithms'];
  };

  const fireXPAward = async (event: string, isBounty = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !missionConfig) return;
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/skill-tree/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ event, domains: roleToDomains(missionConfig.role), isBounty })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`⚡ +XP Awarded! Total: ${data?.skillTree?.totalXP || '??'}`, { duration: 3000 });
        // Check for newly unlocked badges
        if (data?.badges?.length) {
          const latest = data.badges[data.badges.length - 1];
          toast(`🏅 Badge Unlocked: ${latest.icon} ${latest.name}`, { duration: 5000 });
        }
      }
    } catch (e) {
      console.error('XP award failed:', e);
    }
  };

  const handleLogin = (username: string, role?: string) => {
    setUser(username);
    if (role === 'recruiter') {
      setView('recruiter-dashboard');
    } else {
      setView('dashboard'); // Assuming returning users go to dashboard directly or resume upload if they want.
    }
  };

  const handleDemoStart = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/demo/login`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user.name);
        setResumeData({
            name: "Investor Operative",
            title: "Senior Full Stack Architect",
            summary: "Simulated high-performance profile for investor demonstration.",
            skills: ["React", "Node.js", "System Design", "AI Integration"],
            experience: [
                { title: "CTO", company: "JobGenesis", duration: "2024 - Present" }
            ],
            targetRoles: [
                { title: "Senior Architect", icon: "🏗️", domain: "backend" },
                { title: "AI Lead", icon: "🧠", domain: "algorithms" }
            ]
        });
        setView('dashboard');
        toast.success("Investor Mode Activated. Welcome, Operative.");
      }
    } catch (e) {
      toast.error("Demo Bridge Failed.");
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
    emitTelemetry({ role: config.role, company: config.company, status: 'In Progress', score: 100, risk: 'Low', fit: 0 });
    
    if (config.bountyId) {
       setView('simulation'); // Skip MCQ exam for bounties
    } else {
       setView('exam');
    }
  };

  const handleExamFinish = (score: number) => {
    setExamScore(score);
    emitTelemetry({ status: 'Exam Passed' });
    fireXPAward('examPassed');
    setView('simulation');
  };

  const handleSimulationFinish = (score: number, finalCode: string) => {
    setCodingResult({ score, finalCode });
    emitTelemetry({ status: 'Simulation Complete', score });
    const isBounty = !!missionConfig?.bountyId;
    fireXPAward(isBounty ? 'bountyComplete' : 'missionComplete', isBounty);
    setView('interview');
  };

  const handleInterviewFinish = (data: any) => {
    setInterviewData(data);
    emitTelemetry({ status: 'Awaiting Review', fit: data.fitScore || 85 });
    fireXPAward('stressInterviewPassed');
    setView('report');
  };

  const totalTime = 45 * 60; // Mock full time for now, or track it globally

  return (
    <DigitalImmunityWrapper>
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

      {view === 'landing' && <LandingPage onEnterTerminal={() => setView('auth')} onDemoStart={handleDemoStart} />}

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
          bountyId={missionConfig.bountyId}
          roomId={missionConfig.roomId}
          candidateId={candidateId}
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
    </DigitalImmunityWrapper>
  );
}

export default App;