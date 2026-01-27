import { type SocialPost, type Cohort } from '../data/mockPosts';

interface ListViewProps {
    posts: SocialPost[];
    onRegenerate?: (postId: string) => void;
    isGeneratingAll?: boolean;
    generatingPostIds?: Set<string>;
}

const Spinner = ({ size = 12, color = '#a1a1aa' }) => (
    <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${color}`,
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'listViewSpin 0.8s linear infinite',
        display: 'inline-block'
    }}>
        <style>{`
            @keyframes listViewSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

const ListView = ({ posts, onRegenerate, isGeneratingAll, generatingPostIds = new Set() }: ListViewProps) => {
    const getCohortColor = (cohort: Cohort) => {
        switch (cohort) {
            case 'Founders': return '#4f46e5';
            case 'Creators': return '#9333ea';
            case 'Marketers': return '#059669';
            default: return '#52525b';
        }
    };

    return (
        <div style={{ padding: '20px', color: '#e4e4e7', fontFamily: 'Inter, sans-serif' }}>
            <div style={{
                overflowX: 'auto',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                opacity: isGeneratingAll ? 0.6 : 1,
                pointerEvents: isGeneratingAll ? 'none' : 'auto',
                transition: 'opacity 0.2s'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#18181b', borderBottom: '1px solid #3f3f46' }}>
                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#a1a1aa' }}>Date</th>
                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#a1a1aa' }}>Platform</th>
                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#a1a1aa' }}>Cohort</th>
                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#a1a1aa' }}>Pillar</th>
                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#a1a1aa' }}>Message</th>
                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#a1a1aa' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post: SocialPost, index) => {
                            const isRegenerating = generatingPostIds.has(post.id);

                            return (
                                <tr
                                    key={post.id}
                                    style={{
                                        backgroundColor: index % 2 === 0 ? '#09090b' : '#18181b',
                                        borderBottom: index !== posts.length - 1 ? '1px solid #27272a' : 'none',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <td style={{ padding: '16px', fontSize: '14px' }}>{post.date}</td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            color: '#d4d4d8'
                                        }}>
                                            {post.platform}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            backgroundColor: getCohortColor(post.cohort),
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            color: 'white'
                                        }}>
                                            {post.cohort}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#d4d4d8' }}>{post.pillar}</td>
                                    <td style={{ padding: '16px', fontSize: '14px' }}>
                                        <div style={{ color: isRegenerating ? '#71717a' : '#e4e4e7', fontWeight: '500' }}>{post.coreMessage}</div>
                                        <div style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>{post.hook}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => onRegenerate?.(post.id)}
                                            disabled={isRegenerating || isGeneratingAll}
                                            title={isRegenerating ? "Generating..." : "AI Regenerate"}
                                            style={{
                                                backgroundColor: isRegenerating ? '#18181b' : '#27272a',
                                                border: '1px solid #3f3f46',
                                                color: isRegenerating ? '#71717a' : '#a1a1aa',
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                cursor: (isRegenerating || isGeneratingAll) ? 'not-allowed' : 'pointer',
                                                fontSize: '12px',
                                                opacity: (isRegenerating || isGeneratingAll) ? 0.6 : 1,
                                                minWidth: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {isRegenerating ? <Spinner /> : '✨'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListView;
