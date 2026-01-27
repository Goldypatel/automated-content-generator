import { useState, useMemo } from 'react';
import CalendarGrid from '../components/CalendarGrid';
import ListView from '../components/ListView';
import { mockPosts, type SocialPost } from '../data/mockPosts';
import { type ContentGoal, getRecommendedMix, getCurrentMix, type CohortMix } from '../utils/cohortLogic';
import { rebalanceCalendar } from '../utils/rebalanceCalendar';
import { type BrandProfile, generateContentIdea } from '../utils/aiGenerator';
import { parseCSV } from '../utils/csvParser';
import React from 'react';

// Simple CSS Spinner component to avoid external assets
const Spinner = ({ size = 16, color = 'white' }) => (
    <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${color}`,
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block'
    }}>
        <style>{`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export type Timeframe = '2-weeks' | '1-month' | '3-months';

interface StrategyConfig {
    brand: BrandProfile;
    goal: ContentGoal;
    timeframe: Timeframe;
    performanceData: Record<string, string>[];
    uploadStatus: { filename: string; count: number } | null;
}

const INITIAL_CONFIG: StrategyConfig = {
    brand: {
        name: 'Growth Agency',
        category: 'Social Media Marketing',
        audience: 'Startup Founders',
        usp: 'Content that converts to cash'
    },
    goal: 'engagement',
    timeframe: '1-month',
    performanceData: [],
    uploadStatus: null
};

const ContentCalendarPage = () => {
    const [posts, setPosts] = useState(mockPosts);
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [lastChanges, setLastChanges] = useState<string[]>([]);

    // Staged Configuration
    const [draftConfig, setDraftConfig] = useState<StrategyConfig>(INITIAL_CONFIG);
    const [activeConfig, setActiveConfig] = useState<StrategyConfig>(INITIAL_CONFIG);

    // dirty check
    const isDirty = useMemo(() => {
        return JSON.stringify(draftConfig) !== JSON.stringify(activeConfig);
    }, [draftConfig, activeConfig]);

    // UI States
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [generatingPostIds, setGeneratingPostIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [showBrandSettings, setShowBrandSettings] = useState(false);

    // Basic Validation
    const validationErrors = useMemo(() => {
        const errors: string[] = [];
        if (!draftConfig.brand.name.trim()) errors.push("Brand Name is required.");
        if (!draftConfig.goal) errors.push("Strategic Goal is required.");
        return errors;
    }, [draftConfig.brand.name, draftConfig.goal]);

    const isValid = validationErrors.length === 0;

    const filteredPosts = useMemo(() => {
        const start = new Date(2026, 0, 1);
        const end = new Date(start);

        if (activeConfig.timeframe === '2-weeks') {
            end.setDate(start.getDate() + 14);
        } else if (activeConfig.timeframe === '1-month') {
            end.setMonth(start.getMonth() + 1);
        } else {
            end.setMonth(start.getMonth() + 3);
        }

        return posts.filter(post => {
            const postDate = new Date(post.date);
            return postDate >= start && postDate < end;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [posts, activeConfig.timeframe]);

    const currentMix = useMemo(() => getCurrentMix(filteredPosts), [filteredPosts]);
    const recommendedMix = useMemo(() => getRecommendedMix(activeConfig.goal), [activeConfig.goal]);

    const handleApplyChanges = () => {
        setActiveConfig(draftConfig);
        setLastChanges(['Strategy applied successfully. Dashboard updated.']);
        setTimeout(() => setLastChanges([]), 5000);
    };

    const handleRebalance = () => {
        const { rebalancedPosts, changes } = rebalanceCalendar(posts, recommendedMix);
        setPosts(rebalancedPosts);
        setLastChanges(changes);
        setTimeout(() => setLastChanges([]), 5000);
    };

    const handleRegeneratePost = async (postId: string) => {
        setError(null);
        setGeneratingPostIds(prev => new Set(prev).add(postId));

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setPosts((currentPosts: SocialPost[]) => currentPosts.map((post: SocialPost) => {
                if (post.id === postId) {
                    const idea = generateContentIdea(activeConfig.brand, activeConfig.goal, post);
                    if (idea.coreMessage === "Post idea unavailable") {
                        throw new Error("AI failed to generate a valid idea.");
                    }
                    return { ...post, coreMessage: idea.coreMessage, hook: idea.hook };
                }
                return post;
            }));
        } catch (err: any) {
            setError(err.message || "Failed to regenerate post.");
        } finally {
            setGeneratingPostIds(prev => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    const handleGenerateAll = async () => {
        setError(null);
        setIsGeneratingAll(true);
        let successCount = 0;
        let failCount = 0;

        try {
            const updatedPosts = [...posts];
            for (let i = 0; i < updatedPosts.length; i++) {
                const post = updatedPosts[i];
                try {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    const idea = generateContentIdea(activeConfig.brand, activeConfig.goal, post);
                    if (idea.coreMessage === "Post idea unavailable") throw new Error("AI failed");
                    updatedPosts[i] = { ...post, coreMessage: idea.coreMessage, hook: idea.hook };
                    successCount++;
                } catch (err) {
                    failCount++;
                }
            }
            setPosts(updatedPosts);
            if (failCount > 0) {
                setLastChanges([`Bulk generation complete: ${successCount} updated, ${failCount} skipped.`]);
            } else {
                setLastChanges([`AI regenerated ideas for all ${successCount} posts.`]);
            }
            setTimeout(() => setLastChanges([]), 5000);
        } catch (err) {
            setError("Bulk generation encountered a critical error.");
        } finally {
            setIsGeneratingAll(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            setError("Please upload a valid CSV file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            try {
                const data = parseCSV(text);
                if (data.length === 0) throw new Error("File is empty or malformed.");
                setDraftConfig(prev => ({
                    ...prev,
                    performanceData: data,
                    uploadStatus: { filename: file.name, count: data.length }
                }));
                setError(null);
            } catch (err: any) {
                setError(`Failed to parse CSV: ${err.message}`);
            }
        };
        reader.readAsText(file);
    };

    const mixKeys: (keyof CohortMix)[] = ['education', 'promotional', 'personal', 'inspiration'];
    const getLabel = (key: keyof CohortMix) => {
        switch (key) {
            case 'education': return 'Education';
            case 'promotional': return 'Sales';
            case 'personal': return 'Community';
            case 'inspiration': return 'Awareness';
        }
    };
    const getColor = (key: keyof CohortMix) => {
        switch (key) {
            case 'education': return '#4f46e5';
            case 'promotional': return '#059669';
            case 'personal': return '#9333ea';
            case 'inspiration': return '#d97706';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', fontFamily: 'Inter, sans-serif', color: '#e4e4e7' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Content Calendar</h1>
                    <p style={{ color: '#a1a1aa', marginTop: '4px' }}>AI-Powered Strategy Planner</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowBrandSettings(!showBrandSettings)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#27272a',
                            color: 'white',
                            border: '1px solid #3f3f46',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {showBrandSettings ? 'Hide Settings' : 'Brand Profile'}
                    </button>
                    <button
                        onClick={handleGenerateAll}
                        disabled={isGeneratingAll || isDirty}
                        title={isDirty ? "Apply changes first to enable AI generation" : "Generate Ideas"}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: (isGeneratingAll || isDirty) ? '#134e4a' : '#059669',
                            color: (isGeneratingAll || isDirty) ? '#71717a' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (isGeneratingAll || isDirty) ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            opacity: (isGeneratingAll || isDirty) ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            minWidth: '130px',
                            justifyContent: 'center'
                        }}
                    >
                        {isGeneratingAll ? <Spinner /> : 'Generate Ideas'}
                    </button>
                    <button
                        onClick={handleRebalance}
                        disabled={isDirty}
                        title={isDirty ? "Apply changes first to enable rebalancing" : "Auto-Rebalance"}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: isDirty ? '#1e1b4b' : '#4f46e5',
                            color: isDirty ? '#71717a' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isDirty ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            opacity: isDirty ? 0.6 : 1
                        }}
                    >
                        Auto-Rebalance
                    </button>
                </div>
            </div>

            {/* Brand Settings Panel */}
            {showBrandSettings && (
                <div style={{
                    backgroundColor: '#18181b',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #3f3f46',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500', color: '#a1a1aa' }}>Brand Name</label>
                            <input
                                value={draftConfig.brand.name}
                                onChange={e => setDraftConfig(prev => ({ ...prev, brand: { ...prev.brand, name: e.target.value } }))}
                                placeholder="e.g. Acme Corp"
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#09090b',
                                    color: 'white',
                                    border: `1px solid ${!draftConfig.brand.name.trim() ? '#991b1b' : '#27272a'}`,
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                            {!draftConfig.brand.name.trim() && (
                                <span style={{ color: '#f87171', fontSize: '11px', marginTop: '-2px' }}>Brand name cannot be empty</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500', color: '#a1a1aa' }}>Category</label>
                            <input
                                value={draftConfig.brand.category}
                                onChange={e => setDraftConfig(prev => ({ ...prev, brand: { ...prev.brand, category: e.target.value } }))}
                                placeholder="e.g. SaaS, E-commerce"
                                style={{ padding: '10px', backgroundColor: '#09090b', color: 'white', border: '1px solid #27272a', borderRadius: '6px', fontSize: '14px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500', color: '#a1a1aa' }}>Target Audience</label>
                            <input
                                value={draftConfig.brand.audience}
                                onChange={e => setDraftConfig(prev => ({ ...prev, brand: { ...prev.brand, audience: e.target.value } }))}
                                placeholder="e.g. Startup Founders"
                                style={{ padding: '10px', backgroundColor: '#09090b', color: 'white', border: '1px solid #27272a', borderRadius: '6px', fontSize: '14px' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: '#a1a1aa' }}>Key Offers / USPs</label>
                        <textarea
                            value={draftConfig.brand.usp}
                            onChange={e => setDraftConfig(prev => ({ ...prev, brand: { ...prev.brand, usp: e.target.value } }))}
                            placeholder="Describe what makes your brand stand out..."
                            rows={3}
                            style={{
                                padding: '10px',
                                backgroundColor: '#09090b',
                                color: 'white',
                                border: '1px solid #27272a',
                                borderRadius: '6px',
                                fontSize: '14px',
                                resize: 'vertical',
                                minHeight: '80px',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid #27272a', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>Past Performance Data</span>
                                <span style={{ fontSize: '12px', color: '#71717a' }}>Upload CSV to optimize strategy based on history.</span>
                            </div>
                            <label style={{
                                padding: '8px 16px',
                                backgroundColor: '#27272a',
                                color: 'white',
                                border: '1px solid #3f3f46',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}>
                                Choose CSV File
                                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                        </div>
                        {draftConfig.uploadStatus && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                                <span>📄 {draftConfig.uploadStatus.filename} parsed successfully ({draftConfig.performanceData.length} rows).</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span><strong>Error:</strong> {error}</span>
                    <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
            )}

            {/* Staging Bar & Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#18181b',
                borderRadius: '8px',
                border: '1px solid #27272a'
            }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#71717a', fontSize: '13px' }}>Timeframe:</span>
                        <select
                            value={draftConfig.timeframe}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, timeframe: e.target.value as Timeframe }))}
                            style={{ padding: '6px 12px', backgroundColor: '#09090b', color: 'white', border: '1px solid #3f3f46', borderRadius: '6px' }}
                        >
                            <option value="2-weeks">2 Weeks</option>
                            <option value="1-month">1 Month</option>
                            <option value="3-months">3 Months</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#71717a', fontSize: '13px' }}>Goal:</span>
                        <select
                            value={draftConfig.goal}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, goal: e.target.value as ContentGoal }))}
                            style={{ padding: '6px 12px', backgroundColor: '#09090b', color: 'white', border: '1px solid #3f3f46', borderRadius: '6px' }}
                        >
                            <option value="engagement">Engagement</option>
                            <option value="followers-growth">Followers Growth</option>
                            <option value="traffic">Traffic</option>
                            <option value="lead-gen">Lead Generation</option>
                            <option value="sales">Sales</option>
                            <option value="thought-leadership">Thought Leadership</option>
                        </select>
                    </div>

                    <button
                        onClick={handleApplyChanges}
                        disabled={!isDirty || !isValid}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: (isDirty && isValid) ? '#3b82f6' : '#1e3a8a',
                            color: (isDirty && isValid) ? 'white' : '#71717a',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (isDirty && isValid) ? 'pointer' : 'not-allowed',
                            fontWeight: '600',
                            fontSize: '13px',
                            opacity: (isDirty && isValid) ? 1 : 0.6,
                            transition: 'all 0.2s',
                            boxShadow: (isDirty && isValid) ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none'
                        }}
                        title={!isValid ? validationErrors.join(' ') : (isDirty ? "Apply strategy updates" : "No changes to apply")}
                    >
                        Apply Changes
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '500', marginRight: '8px' }}>
                        {lastChanges.length > 0 && `✓ ${lastChanges[0]}`}
                    </div>
                    <div style={{ display: 'flex', backgroundColor: '#09090b', borderRadius: '6px', padding: '4px' }}>
                        <button onClick={() => setView('calendar')} style={{ padding: '6px 12px', backgroundColor: view === 'calendar' ? '#27272a' : 'transparent', color: view === 'calendar' ? 'white' : '#71717a', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Calendar</button>
                        <button onClick={() => setView('list')} style={{ padding: '6px 12px', backgroundColor: view === 'list' ? '#27272a' : 'transparent', color: view === 'list' ? 'white' : '#71717a', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>List</button>
                    </div>
                </div>
            </div>

            {/* Mix Analysis */}
            <div style={{ backgroundColor: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {mixKeys.map((key) => {
                        const current = currentMix[key] || 0;
                        const recommended = recommendedMix[key];
                        return (
                            <div key={key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                    <span>{getLabel(key)}</span>
                                    <span style={{ color: '#a1a1aa' }}>{current}% / {recommended}%</span>
                                </div>
                                <div style={{ height: '6px', backgroundColor: '#09090b', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${current}%`, height: '100%', backgroundColor: getColor(key) }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {view === 'calendar' ?
                <CalendarGrid posts={filteredPosts} /> :
                <ListView
                    posts={filteredPosts}
                    onRegenerate={handleRegeneratePost}
                    isGeneratingAll={isGeneratingAll}
                    generatingPostIds={generatingPostIds}
                />
            }
        </div>
    );
};

export default ContentCalendarPage;
