import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminHeader from './AdminHeader';

export default function Layout({ children }) {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <AdminHeader />
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-700">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
