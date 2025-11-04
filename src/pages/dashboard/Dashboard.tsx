import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersService } from '../../services/users.service';
import { useToast } from '../../context/ToastContext';

interface DashboardStats {
    totalUsers: number;
    totalPlans: number;
    activePlans: number;
    totalAdmins: number;
    totalPlanEnquiries: number;
    totalEmailTemplates: number;
    totalSubscribers: number;
    totalBlogs: number;
}

interface RecentActivity {
    id: number;
    name: string;
    email: string;
    mobile: string;
    message: string;
    type: 'plan' | 'general';
    createdAt: string;
}

const Dashboard: React.FC = () => {
    const { showToast } = useToast();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalPlans: 0,
        activePlans: 0,
        totalAdmins: 0,
        totalPlanEnquiries: 0,
        totalEmailTemplates: 0,
        totalSubscribers: 0,
        totalBlogs: 0,
    });
    const [recentEnquiries, setRecentEnquiries] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch user stats
            const userStatsResponse = await usersService.getUserStats();
            const userStats = userStatsResponse.data;

            setStats(prevStats => ({
                ...prevStats,
                totalUsers: userStats.totalUsers,
                // Keep other stats as mock for now since APIs don't exist
                totalPlans: 8,
                activePlans: 6,
                totalAdmins: 3,
                totalPlanEnquiries: 45,
                totalEmailTemplates: 15,
                totalSubscribers: 890,
                totalBlogs: 25,
            }));

            // Mock enquiries data
            setRecentEnquiries([
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com',
                    mobile: '+1234567890',
                    message: 'Interested in premium plan',
                    type: 'plan',
                    createdAt: '5 min ago'
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    mobile: '+1987654321',
                    message: 'Need more information about services',
                    type: 'general',
                    createdAt: '10 min ago'
                },
                {
                    id: 3,
                    name: 'Mike Johnson',
                    email: 'mike@example.com',
                    mobile: '+1122334455',
                    message: 'Custom plan request for enterprise',
                    type: 'plan',
                    createdAt: '15 min ago'
                },
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load dashboard data'
            });

            // Fallback to mock data
            setStats({
                totalUsers: 0,
                totalPlans: 8,
                activePlans: 6,
                totalAdmins: 3,
                totalPlanEnquiries: 45,
                totalEmailTemplates: 15,
                totalSubscribers: 890,
                totalBlogs: 25,
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: 'bx bx-group',
            color: 'primary',
            link: '/users',
        },
        {
            title: 'Total Plans',
            value: stats.totalPlans,
            icon: 'bx bx-package',
            color: 'success',
            link: '/plans',
        },
        {
            title: 'Active Plans',
            value: stats.activePlans,
            icon: 'bx bx-user-check',
            color: 'success',
            link: '/plans?filter=active',
        },
        {
            title: 'Total Admins',
            value: stats.totalAdmins,
            icon: 'bx bx-user-circle',
            color: 'secondary',
            link: '/admins',
        },
        {
            title: 'Plan Enquiries',
            value: stats.totalPlanEnquiries,
            icon: 'bx bx-envelope',
            color: 'warning',
            link: '/enquiries',
        },
        {
            title: 'Email Templates',
            value: stats.totalEmailTemplates,
            icon: 'bx bx-mail-send',
            color: 'info',
            link: '/email-templates',
        },
        {
            title: 'Total Subscribers',
            value: stats.totalSubscribers,
            icon: 'bx bx-bell',
            color: 'info',
            link: '/subscribers',
        },
        {
            title: 'Total Blogs',
            value: stats.totalBlogs,
            icon: 'bx bx-news',
            color: 'danger',
            link: '/blogs',
        },
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

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
            <div className="row g-6 mb-6">
                {statCards.map((card, index) => (
                    <div key={index} className="col-sm-6 col-xl-3">
                        <Link to={card.link} className="text-decoration-none">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-start justify-content-between">
                                        <div className="content-left">
                                            <span className="text-heading">{card.title}</span>
                                            <div className="d-flex align-items-center my-1">
                                                <h4 className="mb-0 me-2">{card.value}</h4>
                                            </div>
                                        </div>
                                        <div className="avatar">
                                            <span className={`avatar-initial rounded bg-label-${card.color}`}>
                                                <i className={`icon-base ${card.icon} icon-lg`}></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="row">
                <div className="col-md-6 col-lg-8 col-xl-8 order-0 mb-4">
                    <div className="card">
                        <div className="d-flex align-items-end row">
                            <div className="col-sm-7">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">Welcome to Blurry Admin! 🎉</h5>
                                    <p className="mb-4">
                                        You have done <span className="fw-bold">72%</span> more sales today. Check your new badge in
                                        your profile.
                                    </p>
                                    <a href="#" className="btn btn-sm btn-outline-primary">View Badges</a>
                                </div>
                            </div>
                            <div className="col-sm-5 text-center text-sm-left">
                                <div className="card-body pb-0 px-0 px-md-4">
                                    <img
                                        src="/assets/img/illustrations/man-with-laptop-light.png"
                                        height="140"
                                        alt="View Badge User"
                                        data-app-dark-img="/assets/img/illustrations/man-with-laptop-dark.png"
                                        data-app-light-img="/assets/img/illustrations/man-with-laptop-light.png"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4 order-1 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex align-items-center justify-content-between pb-0">
                            <div className="card-title mb-0">
                                <h5 className="m-0 me-2">Order Statistics</h5>
                                <small className="text-muted">42.82k Total Sales</small>
                            </div>
                            <div className="dropdown">
                                <button
                                    className="btn p-0"
                                    type="button"
                                    id="orederStatistics"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    <i className="bx bx-dots-vertical-rounded"></i>
                                </button>
                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="orederStatistics">
                                    <a className="dropdown-item" href="#">Select All</a>
                                    <a className="dropdown-item" href="#">Refresh</a>
                                    <a className="dropdown-item" href="#">Share</a>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex flex-column align-items-center gap-1">
                                    <h2 className="mb-2">8,258</h2>
                                    <span>Total Orders</span>
                                </div>
                                <div id="orderStatisticsChart"></div>
                            </div>
                            <ul className="p-0 m-0">
                                <li className="d-flex mb-4 pb-1">
                                    <div className="avatar flex-shrink-0 me-3">
                                        <span className="avatar-initial rounded bg-label-primary">
                                            <i className="bx bx-mobile-alt"></i>
                                        </span>
                                    </div>
                                    <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                                        <div className="me-2">
                                            <h6 className="mb-0">Electronic</h6>
                                            <small className="text-muted">Mobile, Earbuds, TV</small>
                                        </div>
                                        <div className="user-progress">
                                            <small className="fw-semibold">82.5k</small>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Enquiries Table */}
            <div className="col-sm-12 col-xl-12">
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex mb-3">
                            <h5 className="card-title">Enquiries</h5>
                            <Link to="/enquiries" className="btn btn-primary ms-auto">
                                View All
                            </Link>
                        </div>
                        <div className="table-responsive">
                            <table id="data_table" className="table table-striped table-bordered dt-responsive nowrap w-100">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Message</th>
                                        <th>Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEnquiries.length > 0 ? (
                                        recentEnquiries.map((enquiry, index) => (
                                            <tr key={enquiry.id}>
                                                <td>{index + 1}</td>
                                                <td>{enquiry.name}</td>
                                                <td>{enquiry.email}</td>
                                                <td>{enquiry.mobile}</td>
                                                <td>{enquiry.message}</td>
                                                <td>
                                                    <span className={`badge ${enquiry.type === 'plan' ? 'bg-primary' : 'bg-info'}`}>
                                                        {enquiry.type === 'plan' ? 'Plan' : 'General'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm mb-1"
                                                        title="Delete"
                                                        onClick={() => {
                                                            // Handle delete
                                                            console.log('Delete enquiry:', enquiry.id);
                                                        }}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center">No data available in table</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;