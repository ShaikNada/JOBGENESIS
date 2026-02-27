import { CheckCircle, User, Mail, Phone, MapPin, Briefcase, GraduationCap, ArrowRight, ArrowLeft, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface ResumePreviewProps {
    resumeData: any;
    onConfirm: () => void;
    onBack: () => void;
}

export const ResumePreview = ({ resumeData, onConfirm, onBack }: ResumePreviewProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(resumeData);

    const { personalInfo, education, workExperience, skills, keywords, summary, experienceLevel } = editedData;

    return (
        <div className="min-h-screen bg-dark-950 text-white font-mono overflow-y-auto" style={{ maxHeight: '100vh' }}>
            {/* Header */}
            <div className="max-w-6xl mx-auto py-6 px-6"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold neon-text mb-2">Resume Analysis Complete</h1>
                    <p className="text-gray-400">Please verify the extracted information before proceeding</p>
                </div>

                {/* Personal Info Card */}
                <div className="glass-card p-6 mb-6 border-neon-purple">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <User className="w-6 h-6 text-neon-purple" />
                            Personal Information
                        </h2>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-sm flex items-center gap-1 text-neon-blue hover:text-neon-purple transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            {isEditing ? 'Done' : 'Edit'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-neon-blue" />
                            <div>
                                <p className="text-xs text-gray-400">Name</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.personalInfo.name}
                                        onChange={(e) => setEditedData({
                                            ...editedData,
                                            personalInfo: { ...editedData.personalInfo, name: e.target.value }
                                        })}
                                        className="bg-dark-900 border border-neon-blue/30 rounded px-2 py-1 text-sm w-full"
                                    />
                                ) : (
                                    <p className="font-semibold">{personalInfo?.name || 'N/A'}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-neon-blue" />
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editedData.personalInfo.email}
                                        onChange={(e) => setEditedData({
                                            ...editedData,
                                            personalInfo: { ...editedData.personalInfo, email: e.target.value }
                                        })}
                                        className="bg-dark-900 border border-neon-blue/30 rounded px-2 py-1 text-sm w-full"
                                    />
                                ) : (
                                    <p className="font-semibold">{personalInfo?.email || 'N/A'}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-neon-blue" />
                            <div>
                                <p className="text-xs text-gray-400">Phone</p>
                                <p className="font-semibold">{personalInfo?.phone || 'N/A'}</p>
                            </div>
                        </div>
                        {personalInfo?.location && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-neon-blue" />
                                <div>
                                    <p className="text-xs text-gray-400">Location</p>
                                    <p className="font-semibold">{personalInfo.location}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="glass-card p-6 mb-6 border-neon-blue">
                    <h2 className="text-xl font-bold mb-3">Professional Summary</h2>
                    <p className="text-gray-300 leading-relaxed">{summary}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-3 py-1 bg-neon-purple/20 border border-neon-purple rounded-full text-sm">
                            {experienceLevel} Level
                        </span>
                    </div>
                </div>

                {/* Skills & Keywords */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Technical Skills */}
                    <div className="glass-card p-6 border-neon-green">
                        <h2 className="text-xl font-bold mb-4">Core Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills?.map((skill: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-neon-green/10 border border-neon-green/50 rounded-full text-sm hover:bg-neon-green/20 transition-colors"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="glass-card p-6 border-neon-blue">
                        <h2 className="text-xl font-bold mb-4">Keywords Detected</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Technical</p>
                                <div className="flex flex-wrap gap-2">
                                    {keywords?.technical?.map((kw: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-500/20 text-xs rounded border border-blue-500/30">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Soft Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {keywords?.softSkills?.map((kw: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-purple-500/20 text-xs rounded border border-purple-500/30">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Domains</p>
                                <div className="flex flex-wrap gap-2">
                                    {keywords?.domains?.map((kw: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-green-500/20 text-xs rounded border border-green-500/30">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Work Experience */}
                {workExperience && workExperience.length > 0 && (
                    <div className="glass-card p-6 mb-6 border-neon-purple">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-neon-purple" />
                            Work Experience
                        </h2>
                        <div className="space-y-4">
                            {workExperience.map((exp: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-neon-purple pl-4">
                                    <h3 className="font-bold text-lg">{exp.title}</h3>
                                    <p className="text-neon-blue">{exp.company}</p>
                                    <p className="text-sm text-gray-400 mb-2">{exp.duration}</p>
                                    <p className="text-sm text-gray-300">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                    <div className="glass-card p-6 mb-6 border-neon-green">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-neon-green" />
                            Education
                        </h2>
                        <div className="space-y-3">
                            {education.map((edu: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-neon-green pl-4">
                                    <h3 className="font-bold">{edu.degree}</h3>
                                    <p className="text-sm text-neon-green">{edu.institution}</p>
                                    <p className="text-xs text-gray-400">{edu.field} • {edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggested Roles Removed as per user request */}

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-lg hover:border-neon-blue transition-all hover:shadow-neon-blue"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                    <button
                        onClick={() => onConfirm()}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-bold hover:shadow-neon-glow transition-all hover:scale-105"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Confirm & Continue
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div >
        </div >
    );
};
