const Footer = () => {
    return (
        <footer className="bg-white border-t text-center py-4">
            <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} MyWebsite. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;