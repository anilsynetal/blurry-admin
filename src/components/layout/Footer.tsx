import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="content-footer footer bg-footer-theme">
            <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
                <div className="mb-2 mb-md-0">
                    © {currentYear}, made with ❤️ by{' '}
                    <a href="https://themeselection.com" target="_blank" rel="noopener noreferrer" className="footer-link fw-bolder">
                        Blurry Team
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;