import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Code2, Cpu, GitBranch, Lock, Award, TrendingUp } from 'lucide-react';
import { API_URL } from '../config';

interface SkillTree {
    frontend: number;
    backend: number;
    systemDesign: number;
    security: number;
    algorithms: number;
    bountiesSolved: number;
    totalXP: number;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
}

interface Node {
    id: string;
    label: string;
    domain: keyof Omit<SkillTree, 'bountiesSolved' | 'totalXP'>;
    icon: React.ReactNode;
    x: number;
    y: number;
    color: string;
    connections: string[];
}

const SKILL_NODES: Node[] = [
    { id: 'algorithms',   label: 'Algorithms',      domain: 'algorithms',   icon: <Cpu size={16}/>,      x: 400, y: 60,  color: '#a855f7', connections: ['backend', 'systemDesign'] },
    { id: 'frontend',     label: 'Frontend',        domain: 'frontend',     icon: <Code2 size={16}/>,    x: 140, y: 220, color: '#06b6d4', connections: ['algorithms', 'security'] },
    { id: 'backend',      label: 'Backend',         domain: 'backend',      icon: <GitBranch size={16}/>,x: 660, y: 220, color: '#10b981', connections: ['algorithms', 'systemDesign'] },
    { id: 'security',     label: 'Security',        domain: 'security',     icon: <Lock size={16}/>,     x: 140, y: 400, color: '#ef4444', connections: ['frontend', 'systemDesign'] },
    { id: 'systemDesign', label: 'System Design',   domain: 'systemDesign', icon: <Shield size={16}/>,   x: 400, y: 400, color: '#f59e0b', connections: ['backend', 'security'] },
];

function xpToLevel(xp: number): { level: number; progress: number } {
    const level = Math.floor(xp / 100) + 1;
    const progress = (xp % 100) / 100;
    return { level, progress };
}

export function NeuralSkillTree() {
    const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/skill-tree`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSkillTree(data.skillTree);
                    setBadges(data.badges || []);
                }
            } catch (e) {
                console.error('Failed to load skill tree:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Cpu className="text-purple-500 animate-spin w-8 h-8" />
                <span className="ml-3 text-purple-400 font-mono tracking-widest">LOADING NEURAL MAP...</span>
            </div>
        );
    }

    const tree = skillTree || { frontend: 0, backend: 0, systemDesign: 0, security: 0, algorithms: 0, bountiesSolved: 0, totalXP: 0 };

    return (
        <div className="w-full space-y-8 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                        <TrendingUp className="text-purple-400" size={24} />
                        Neural Skill Tree
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 font-mono">Interactive map of your technical evolution</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-purple-400 tabular-nums">{tree.totalXP.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Total XP</div>
                </div>
            </div>

            {/* Interactive SVG Node Map */}
            <div className="relative bg-black/50 border border-purple-500/20 rounded-2xl p-4 overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.08)]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:28px_28px] rounded-2xl"></div>

                <svg ref={svgRef} viewBox="0 0 800 480" className="w-full" style={{ height: 320 }}>
                    <defs>
                        {SKILL_NODES.map(n => (
                            <radialGradient key={`grd-${n.id}`} id={`grd-${n.id}`}>
                                <stop offset="0%"   stopColor={n.color} stopOpacity="0.3"/>
                                <stop offset="100%" stopColor={n.color} stopOpacity="0"/>
                            </radialGradient>
                        ))}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Connections */}
                    {SKILL_NODES.map(from =>
                        from.connections.map(toId => {
                            const to = SKILL_NODES.find(n => n.id === toId);
                            if (!to) return null;
                            const isHighlighted = hoveredNode === from.id || hoveredNode === toId;
                            return (
                                <line
                                    key={`${from.id}-${toId}`}
                                    x1={from.x} y1={from.y}
                                    x2={to.x}   y2={to.y}
                                    stroke={isHighlighted ? '#a855f7' : '#334155'}
                                    strokeWidth={isHighlighted ? 2 : 1}
                                    strokeDasharray={isHighlighted ? "none" : "4 6"}
                                    opacity={isHighlighted ? 0.8 : 0.3}
                                    style={{ transition: 'all 0.3s ease' }}
                                />
                            );
                        })
                    )}

                    {/* Nodes */}
                    {SKILL_NODES.map(node => {
                        const xp = tree[node.domain] || 0;
                        const { level, progress } = xpToLevel(xp);
                        const R = 40;
                        const circumference = 2 * Math.PI * R;
                        const isHovered = hoveredNode === node.id;
                        const isSelected = selectedNode === node.id;
                        const isLegendary = level >= 10;

                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onClick={() => setSelectedNode(prev => prev === node.id ? null : node.id)}
                            >
                                {/* Legendary Pulse Ring */}
                                {isLegendary && (
                                    <motion.circle
                                        r={R + 10}
                                        fill="none"
                                        stroke={node.color}
                                        strokeWidth={1}
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                )}

                                {/* Glow radial background */}
                                {(isHovered || isSelected || isLegendary) && (
                                    <circle r={isLegendary ? 80 : 60} fill={`url(#grd-${node.id})`} opacity={isLegendary ? 1 : 0.6} />
                                )}

                                {/* XP Ring */}
                                <circle
                                    r={R}
                                    fill="none"
                                    stroke="#1e293b"
                                    strokeWidth={6}
                                />
                                <circle
                                    r={R}
                                    fill="none"
                                    stroke={node.color}
                                    strokeWidth={isLegendary ? 8 : 6}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference * (1 - progress)}
                                    strokeLinecap="round"
                                    transform="rotate(-90)"
                                    filter="url(#glow)"
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                />

                                {/* Inner circle */}
                                <circle r={32} fill="#0f172a" stroke={node.color} strokeWidth={1} strokeOpacity={0.4} />

                                {/* Icon and Level */}
                                <motion.foreignObject 
                                    x={-12} y={-24} width={24} height={24} 
                                    style={{ color: node.color }}
                                    animate={isLegendary ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <div className="flex items-center justify-center w-6 h-6">
                                        {node.icon}
                                    </div>
                                </motion.foreignObject>
                                <text
                                    y={14}
                                    textAnchor="middle"
                                    fill={node.color}
                                    fontSize={12}
                                    fontWeight="900"
                                    fontFamily="monospace"
                                >
                                    L{level}
                                </text>

                                {/* Label below node */}
                                <text
                                    y={55}
                                    textAnchor="middle"
                                    fill={isHovered ? '#ffffff' : '#94a3b8'}
                                    fontSize={10}
                                    fontWeight="600"
                                    fontFamily="monospace"
                                    letterSpacing={1}
                                    style={{ transition: 'fill 0.2s ease' }}
                                >
                                    {node.label.toUpperCase()}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Node Detail Popup */}
                <AnimatePresence>
                    {selectedNode && (() => {
                        const node = SKILL_NODES.find(n => n.id === selectedNode)!;
                        const xp = tree[node.domain] || 0;
                        const { level, progress } = xpToLevel(xp);
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border rounded-xl px-6 py-4 flex gap-6 items-center shadow-2xl"
                                style={{ borderColor: node.color + '40' }}
                            >
                                <div className="text-center">
                                    <span className="text-3xl font-black" style={{ color: node.color }}>L{level}</span>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Level</div>
                                </div>
                                <div className="flex-1 min-w-[160px]">
                                    <div className="text-white font-bold text-sm mb-1 uppercase tracking-wider">{node.label}</div>
                                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: node.color, width: `${progress * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">{xp} XP · {Math.round(progress * 100)}% to L{level + 1}</div>
                                </div>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>
            </div>

            {/* Legendary Badges */}
            <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Award size={14} className="text-yellow-500" />
                    Legendary Badges
                </h3>
                {badges.length === 0 ? (
                    <div className="text-slate-600 text-sm text-center py-6 border border-dashed border-slate-800 rounded-xl font-mono">
                        Complete missions and solve bounties to unlock badges...
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {badges.map(badge => (
                            <motion.div
                                key={badge.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl p-4 text-center cursor-pointer hover:border-yellow-500/40 transition-all"
                                title={badge.description}
                            >
                                <div className="text-2xl mb-2">{badge.icon}</div>
                                <div className="text-yellow-400 text-[10px] font-black uppercase tracking-wider leading-tight">{badge.name}</div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {SKILL_NODES.map(node => {
                    const xp = tree[node.domain] || 0;
                    const { level } = xpToLevel(xp);
                    return (
                        <div key={node.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center hover:border-slate-600 transition-all">
                            <div className="text-lg mb-1" style={{ color: node.color }}>{node.icon}</div>
                            <div className="text-white text-sm font-black">Lv {level}</div>
                            <div className="text-slate-500 text-[9px] font-mono uppercase tracking-widest mt-0.5">{node.label}</div>
                        </div>
                    );
                })}
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-3 text-center">
                    <div className="text-lg mb-1 text-red-400">🛡️</div>
                    <div className="text-white text-sm font-black">{tree.bountiesSolved}</div>
                    <div className="text-slate-500 text-[9px] font-mono uppercase tracking-widest mt-0.5">Bounties</div>
                </div>
            </div>
        </div>
    );
}
