import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
} from 'chart.js';
import {
    dashboardService,
    DashboardStats as IDashboardStats,
    RecentUser,
    PlatformWiseUsers,
    UserRegistrationChart,
    UserActivityChart,
    DatingStats
} from '../../services/dashboard.service';
import { useToast } from '../../context/ToastContext';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard: React.FC = () => {
    const { showToast } = useToast();
    const [stats, setStats] = useState<IDashboardStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [platformUsers, setPlatformUsers] = useState<PlatformWiseUsers | null>(null);
    const [registrationChart, setRegistrationChart] = useState<UserRegistrationChart | null>(null);
    const [activityChart, setActivityChart] = useState<UserActivityChart | null>(null);
    const [datingStats, setDatingStats] = useState<DatingStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all dashboard data in parallel
            const [
                statsResponse,
                recentUsersResponse,
                platformResponse,
                registrationResponse,
                activityResponse,
                datingResponse
            ] = await Promise.all([
                dashboardService.getDashboardStats(),
                dashboardService.getRecentUsers(10),
                dashboardService.getPlatformWiseUsers(),
                dashboardService.getUserRegistrationChart(30),
                dashboardService.getUserActivityChart(7),
                dashboardService.getDatingStats()
            ]);

            setStats(statsResponse.data);
            setRecentUsers(recentUsersResponse.data);
            setPlatformUsers(platformResponse.data);
            setRegistrationChart(registrationResponse.data);
            setActivityChart(activityResponse.data);
            setDatingStats(datingResponse.data);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load dashboard data'
            });
        } finally {
            setLoading(false);
        }
    };

    // Prepare stat cards data
    const statCards = stats ? [
        {
            title: 'Total Users',
            value: stats.users.total,
            icon: 'bx bx-group',
            color: 'primary',
            link: '/users',
            subtitle: `${stats.users.online} online`
        },
        {
            title: 'Active Users',
            value: stats.users.active,
            icon: 'bx bx-user-check',
            color: 'success',
            link: '/users?filter=active',
            subtitle: `${stats.users.engagementRate}% engagement`
        },
        {
            title: 'Total Matches',
            value: stats.matches.total,
            icon: 'bx bx-heart',
            color: 'danger',
            link: '/matches',
            subtitle: `${stats.matches.successRate}% success rate`
        },
        {
            title: 'Active Plans',
            value: stats.plans.active,
            icon: 'bx bx-package',
            color: 'warning',
            link: '/plans',
            subtitle: `${stats.plans.total} total plans`
        },
        {
            title: 'Date Plans',
            value: stats.activity.datePlans,
            icon: 'bx bx-calendar',
            color: 'info',
            link: '/date-plans',
            subtitle: 'Created by users'
        },
        {
            title: 'Lounges',
            value: stats.activity.lounges,
            icon: 'bx bx-buildings',
            color: 'secondary',
            link: '/lounges',
            subtitle: 'Available venues'
        },
        {
            title: 'Transactions',
            value: stats.activity.transactions,
            icon: 'bx bx-money',
            color: 'success',
            link: '/transactions',
            subtitle: 'Payment records'
        },
        {
            title: 'Notifications',
            value: stats.activity.notifications,
            icon: 'bx bx-bell',
            color: 'primary',
            link: '/notifications',
            subtitle: 'Sent to users'
        },
    ] : [];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Chart configurations
    const registrationChartData = registrationChart ? {
        labels: registrationChart.labels,
        datasets: [{
            label: 'New Registrations',
            data: registrationChart.data,
            borderColor: '#696cff',
            backgroundColor: 'rgba(105, 108, 255, 0.1)',
            tension: 0.4
        }]
    } : null;

    const platformChartData = platformUsers ? {
        labels: platformUsers.platforms.map(p => p.platform.charAt(0).toUpperCase() + p.platform.slice(1)),
        datasets: [{
            data: platformUsers.platforms.map(p => p.count),
            backgroundColor: ['#696cff', '#8592a3', '#71dd37', '#ff3e1d', '#ffab00']
        }]
    } : null;

    const activityChartData = activityChart ? {
        labels: activityChart.labels,
        datasets: [
            {
                label: 'Active Users',
                data: activityChart.activeUsers,
                backgroundColor: 'rgba(105, 108, 255, 0.8)',
            },
            {
                label: 'Online Users',
                data: activityChart.onlineUsers,
                backgroundColor: 'rgba(113, 221, 55, 0.8)',
            }
        ]
    } : null;

    return (
        <div>
            <div className="row mb-4">
                <div className="col-12">
                    <h4 className="fw-bold py-3 mb-4">
                        <span className="text-muted fw-light">Admin /</span> Dashboard
                    </h4>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                {statCards.map((card, index) => (
                    <div key={index} className="col-sm-6 col-xl-3">
                        <Link to={card.link} className="text-decoration-none">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex align-items-start justify-content-between">
                                        <div className="content-left">
                                            <span className="text-heading">{card.title}</span>
                                            <div className="d-flex align-items-center my-1">
                                                <h4 className="mb-0 me-2">{card.value}</h4>
                                            </div>
                                            <small className="text-muted">{card.subtitle}</small>
                                        </div>
                                        <div className="avatar">
                                            <span className={`avatar-initial rounded bg-label-${card.color}`}>
                                                <i className={`${card.icon} fs-4`}></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="row mb-4">
                {/* User Registration Chart */}
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">User Registrations (Last 30 Days)</h5>
                            <small className="text-muted">New sign-ups trend</small>
                        </div>
                        <div className="card-body">
                            {registrationChartData ? (
                                <Line
                                    data={registrationChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Platform Distribution */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Platform Distribution</h5>
                        </div>
                        <div className="card-body">
                            {platformChartData ? (
                                <Doughnut
                                    data={platformChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Chart and Recent Users */}
            <div className="row">
                {/* User Activity Chart */}
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">User Activity (Last 7 Days)</h5>
                        </div>
                        <div className="card-body">
                            {activityChartData ? (
                                <Bar
                                    data={activityChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Recent Users</h5>
                            <Link to="/users" className="btn btn-sm btn-outline-primary">View All</Link>
                        </div>
                        <div className="card-body">
                            {recentUsers.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {recentUsers.map((user) => (
                                        <div key={user._id} className="list-group-item px-0">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar me-3">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="rounded-circle" />
                                                    ) : (
                                                        <span className="avatar-initial rounded-circle bg-label-primary">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-0">{user.name}</h6>
                                                    <small className="text-muted d-block">{user.email}</small>
                                                    <div className="d-flex align-items-center mt-1">
                                                        <span className={`badge badge-sm me-2 ${user.isOnline ? 'bg-success' : 'bg-secondary'}`}>
                                                            {user.isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                        {user.platform && (
                                                            <span className="badge badge-sm bg-label-info me-2">
                                                                {user.platform.charAt(0).toUpperCase() + user.platform.slice(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <small className="text-muted">{user.timeAgo}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dating Statistics */}
            {datingStats && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Dating & Engagement Statistics</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-3 text-center">
                                        <h4 className="text-primary">{datingStats.matches.total}</h4>
                                        <p className="text-muted mb-0">Total Matches</p>
                                        <small className="text-success">{datingStats.matches.active} active</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h4 className="text-info">{datingStats.datePlans.total}</h4>
                                        <p className="text-muted mb-0">Date Plans</p>
                                        <small className="text-success">{datingStats.datePlans.completed} completed</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h4 className="text-warning">{datingStats.unblurRequests.total}</h4>
                                        <p className="text-muted mb-0">Unblur Requests</p>
                                        <small className="text-success">{datingStats.unblurRequests.approvalRate}% approved</small>
                                    </div>
                                    <div className="col-md-3 text-center">
                                        <h4 className="text-success">{stats?.users.recentSignups || 0}</h4>
                                        <p className="text-muted mb-0">Recent Signups</p>
                                        <small className="text-muted">Last 7 days</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;