import React from "react";
import { User } from "../../services/users.service";
import { StatusBadge } from "../../components/common";

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
    isOpen,
    onClose,
    user,
}) => {
    // Helper function to get full image URL
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http")) return imagePath;
        const baseUrl =
            (import.meta as any).env.VITE_API_URL || "http://localhost:4002";
        return `${baseUrl.replace("/api/admin", "")}/${imagePath}`;
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal fade show"
            style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)",
            }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
                    {/* Header */}
                    <div className="modal-header bg-primary text-white py-3">
                        <h5 className="modal-title fw-semibold mb-0 text-white">
                            User Details — {user.name}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        {/* User Header */}
                        <div className="text-center mb-4">
                            {user.avatar ? (
                                <img
                                    src={getImageUrl(user.avatar)}
                                    alt="User Avatar"
                                    className="rounded-circle shadow-sm mb-3"
                                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                />
                            ) : (
                                <div
                                    className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{ width: "100px", height: "100px" }}
                                >
                                    <i className="bx bx-user fs-1 text-muted"></i>
                                </div>
                            )}
                            <h4 className="fw-semibold mb-1">{user.name}</h4>
                            <p className="text-muted mb-2">{user.email}</p>
                            <div className="d-flex justify-content-center flex-wrap gap-2">
                                <span
                                    className={`badge ${user.isActive ? "bg-success" : "bg-danger"
                                        }`}
                                >
                                    {user.isActive ? "Active" : "Inactive"}
                                </span>
                                <span
                                    className={`badge ${user.role === "admin" ? "bg-primary" : "bg-secondary"
                                        }`}
                                >
                                    {user.role}
                                </span>
                                <StatusBadge
                                    status={user.isEmailVerified}
                                    trueLabel="Verified"
                                    falseLabel="Unverified"
                                    trueVariant="success"
                                    falseVariant="warning"
                                />
                            </div>
                        </div>

                        {/* Basic Info Cards */}
                        <div className="row">
                            {/* Personal Information */}
                            <div className="col-md-6 mb-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="p-3 bg-light">
                                        <h6 className="mb-0 fw-semibold">Personal Information</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Full Name</small>
                                            <span className="fw-medium">{user.name}</span>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Email</small>
                                            <span className="fw-medium">{user.email}</span>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Mobile</small>
                                            <span className="fw-medium">
                                                {user.mobile || "Not provided"}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Date of Birth</small>
                                            <span className="fw-medium">
                                                {user.dateOfBirth
                                                    ? new Date(user.dateOfBirth).toLocaleDateString()
                                                    : "Not provided"}
                                            </span>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Gender</small>
                                            <span className="fw-medium">
                                                {user.gender || "Not specified"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Details */}
                            <div className="col-md-6 mb-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="p-3 bg-light">
                                        <h6 className="mb-0 fw-semibold">Account Information</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Status</small>
                                            <span
                                                className={`badge ${user.isActive ? "bg-success" : "bg-danger"
                                                    }`}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Email Status</small>
                                            <StatusBadge
                                                status={user.isEmailVerified}
                                                trueLabel="Email Verified"
                                                falseLabel="Email Unverified"
                                                trueVariant="success"
                                                falseVariant="warning"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Role</small>
                                            <span
                                                className={`badge ${user.role === "admin"
                                                    ? "bg-primary"
                                                    : "bg-secondary"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Created</small>
                                            <span className="fw-medium">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString()
                                                    : "Unknown"}
                                            </span>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Last Updated</small>
                                            <span className="fw-medium">
                                                {user.updatedAt
                                                    ? new Date(user.updatedAt).toLocaleDateString()
                                                    : "Unknown"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
