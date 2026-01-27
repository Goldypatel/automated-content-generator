import { useMemo } from 'react';
import { type SocialPost, type Cohort } from '../data/mockPosts';

interface CalendarGridProps {
    posts: SocialPost[];
    isGeneratingAll?: boolean;
    generatingPostIds?: Set<string>;
}

const CalendarGrid = ({ posts, isGeneratingAll }: CalendarGridProps) => {
    // Determine the months to render based on posts
    const monthsToRender = useMemo(() => {
        if (posts.length === 0) return [{ year: 2026, month: 0 }]; // Fallback

        const months = new Map<string, { year: number, month: number }>();
        posts.forEach(post => {
            const d = new Date(post.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!months.has(key)) {
                months.set(key, { year: d.getFullYear(), month: d.getMonth() });
            }
        });

        return Array.from(months.values()).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
    }, [posts]);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getCohortColor = (cohort: Cohort) => {
        switch (cohort) {
            case 'Founders': return '#4f46e5';
            case 'Creators': return '#9333ea';
            case 'Marketers': return '#059669';
            default: return '#52525b';
        }
    };

    return (
        <div style={{ padding: '20px', color: '#e4e4e7', fontFamily: 'Inter, sans-serif', opacity: isGeneratingAll ? 0.6 : 1, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {monthsToRender.map(({ year, month }) => {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDayOfMonth = new Date(year, month, 1).getDay();
                const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

                const days = [];
                for (let i = 0; i < startDay; i++) days.push(null);
                for (let i = 1; i <= daysInMonth; i++) days.push(i);

                const getPostsForDate = (day: number) => {
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    return posts.filter((post) => post.date === dateString);
                };

                return (
                    <div key={`${year}-${month}`}>
                        <header style={{ marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                {monthNames[month]} {year}
                            </h2>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#3f3f46', border: '1px solid #3f3f46', borderRadius: '8px', overflow: 'hidden' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                <div key={day} style={{ padding: '12px', textAlign: 'center', backgroundColor: '#18181b', fontWeight: '600', fontSize: '14px', color: '#a1a1aa' }}>
                                    {day}
                                </div>
                            ))}

                            {days.map((day, index) => {
                                const dailyPosts = day ? getPostsForDate(day) : [];
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            minHeight: '120px',
                                            padding: '8px',
                                            backgroundColor: day ? '#18181b' : '#09090b',
                                            borderTop: '1px solid #27272a',
                                            borderRight: (index + 1) % 7 !== 0 ? '1px solid #27272a' : 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}
                                    >
                                        {day && (
                                            <>
                                                <div style={{ fontWeight: '500', fontSize: '13px', color: '#71717a', marginBottom: '4px' }}>{day}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {dailyPosts.map((post) => (
                                                        <div
                                                            key={post.id}
                                                            style={{
                                                                backgroundColor: '#27272a',
                                                                padding: '6px',
                                                                borderRadius: '6px',
                                                                fontSize: '11px',
                                                                border: '1px solid #3f3f46'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#d4d4d8', opacity: 0.7 }}>
                                                                    {post.platform.slice(0, 2)}
                                                                </span>
                                                                <span style={{
                                                                    fontSize: '9px',
                                                                    backgroundColor: getCohortColor(post.cohort),
                                                                    color: 'white',
                                                                    padding: '1px 4px',
                                                                    borderRadius: '3px'
                                                                }}>
                                                                    {post.cohort}
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                color: '#e4e4e7',
                                                                lineHeight: '1.3',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}>
                                                                {post.coreMessage}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CalendarGrid;
