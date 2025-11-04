import React from "react";
import { Lounge } from "../../services/lounges.service";
import { StatusBadge } from "../../components/common";

interface LoungeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lounge: Lounge;
}

const LoungeDetailsModal: React.FC<LoungeDetailsModalProps> = ({
    isOpen,
    onClose,
    lounge,
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
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-semibold mb-3 text-white">
                            Lounge Details — {lounge.name}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">

                        {/* Basic Info */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-light mb-3">
                                <h6 className="mb-0 fw-semibold">Basic Information</h6>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-sm-4 fw-medium">Name:</div>
                                    <div className="col-sm-8">{lounge.name}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-sm-4 fw-medium">Description:</div>
                                    <div className="col-sm-8">{lounge.description}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-sm-4 fw-medium">Status:</div>
                                    <div className="col-sm-8">
                                        <StatusBadge status={lounge.isActive} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4 fw-medium">Sort Order:</div>
                                    <div className="col-sm-8">{lounge.sortOrder || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="p-3 bg-light mb-3">
                                <h6 className="mb-0 fw-semibold">Images</h6>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {lounge.image && (
                                        <div className="col-md-6 mb-3">
                                            <div className="card border-0 shadow-sm">
                                                <img
                                                    src={getImageUrl(lounge.image)}
                                                    alt={lounge.name}
                                                    className="card-img-top"
                                                    style={{
                                                        height: "150px",
                                                        objectFit: "cover",
                                                        borderRadius: "0.5rem 0.5rem 0 0",
                                                    }}
                                                />
                                                <div className="card-body py-2 text-center">
                                                    <span className="badge bg-primary">Main Image</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {lounge.bannerImage && (
                                        <div className="col-md-6 mb-3">
                                            <div className="card border-0 shadow-sm">
                                                <img
                                                    src={getImageUrl(lounge.bannerImage)}
                                                    alt={`${lounge.name} Banner`}
                                                    className="card-img-top"
                                                    style={{
                                                        height: "150px",
                                                        objectFit: "cover",
                                                        borderRadius: "0.5rem 0.5rem 0 0",
                                                    }}
                                                />
                                                <div className="card-body py-2 text-center">
                                                    <span className="badge bg-secondary">Banner Image</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!lounge.image && !lounge.bannerImage && (
                                        <div className="col-12 text-center py-4">
                                            <i className="bx bx-image display-4 text-muted"></i>
                                            <p className="text-muted mb-0">No images available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tags Section */}
                        {lounge.tags && lounge.tags.length > 0 && (
                            <div className="card border-0 shadow-sm">
                                <div className="p-3 bg-light mb-3">
                                    <h6 className="mb-0 fw-semibold">Tags</h6>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex flex-wrap gap-2">
                                        {lounge.tags.map((tag, index) => (
                                            <span key={index} className="badge bg-primary">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
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

export default LoungeDetailsModal;
