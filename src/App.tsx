import React, { useState, useEffect } from 'react';
import { IdeLayout } from './components/IdeLayout';
import { auth } from './firebase';
import { onIdTokenChanged } from 'firebase/auth';
import { getSocket } from './socket';
import { API_URL } from './config';

import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { ResumeUpload } from './components/ResumeUpload';
import { ResumePreview } from './components/ResumePreview';
import { JobDashboard } from './components/JobDashboard';
import { ProfilePage } from './components/ProfilePage';
import { Toaster, toast } from 'react-hot-toast';

import { TechnicalExam } from './components/TechnicalExam';
import { AiInterviewRoom } from './components/AiInterviewRoom';
import { DetailedReportView } from './components/DetailedReportView';
import { DigitalImmunityWrapper } from './components/DigitalImmunityWrapper';
import { SkillGapReportPage } from './components/SkillGapReportPage';

type AppState = 'landing' | 'auth' | 'resume' | 'resume-preview' | 'dashboard' | 'exam' | 'simulation' | 'interview' | 'report' | 'profile' | 'skill-gap';

function App() {
  const [view, setView] = useState<AppState>('landing');
  const [user, setUser] = useState<any | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [skillGapData, setSkillGapData] = useState<any>(null);

  useEffect(() => {
    // 🛡️ Monitor Firebase Auth and Refresh Token Automatically
    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        localStorage.setItem('token', token);
        console.log('🔄 Firebase Token Refreshed Automatically');

        // Fetch fresh profile from backend with the new token
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data._id) {
            setUser(data);
            setResumeData(data.resumeData);
            localStorage.setItem('user', JSON.stringify(data));
          }
        } catch (err) {
          console.error("Auth sync failed", err);
        }
      } else {
        // User logged out from Firebase centrally
        if (view !== 'landing' && view !== 'auth') {
          handleLogout();
        }
      }
    });

    // Check session on mount
    const token = localStorage.getItem('token');

    if (token && view === 'landing') {
      setView('dashboard');
    }

    return () => unsubscribe();
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
      name: user?.name || 'Candidate',
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
      const res = await fetch(`${API_URL}/api/skill-tree/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          event, 
          domains: roleToDomains(missionConfig.role), 
          isBounty,
          difficulty: missionConfig.difficulty || 'normal' 
        })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`⚡ +XP Awarded! Total: ${data?.skillTree?.totalXP || '??'}`, { duration: 2500 });
        
        // Live feedback for recruiter
        emitTelemetry({ 
          totalXP: data?.skillTree?.totalXP, 
          badges: data?.badges?.length,
          status: `Achievement: ${event}`
        });

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

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (!userData.resumeData || (Array.isArray(userData.resumeData.skills) && userData.resumeData.skills.length === 0)) {
      setView('resume');
    } else {
      setView('dashboard');
    }
  };


  const handleResumeAnalyzed = (data: any) => {
    setResumeData(data);
    setView('resume-preview'); // Go to preview screen first
  };

  const handlePreviewConfirm = () => {
    setView('dashboard');
    toast.success('Profile confirmed! Let\'s go.', { duration: 2000 });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('landing');
    toast.success("Logged out successfully.");
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
          user={user}
          resumeData={resumeData}
          onStartSimulation={handleStartMission}
          onSkillGapReport={(data) => {
            setSkillGapData(data);
            setView('skill-gap');
          }}
          onViewProfile={() => setView('profile')}
          onUploadResume={() => setView('resume')}
          onLogout={handleLogout}
        />
      )}



      {view === 'profile' && (
        <ProfilePage
          user={user}
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
          candidateId={candidateId}
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

      {view === 'skill-gap' && skillGapData && (
        <SkillGapReportPage 
          data={skillGapData} 
          onBack={() => setView('dashboard')} 
          onStartSimulation={handleStartMission} 
        />
      )}
    </DigitalImmunityWrapper>
  );
}

export default App;