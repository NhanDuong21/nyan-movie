import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AISearchModal from '../components/AISearchModal';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-black">
            <Header />
            <main className="flex-grow w-full flex flex-col">
                <Outlet />
            </main>
            <div className="mt-auto w-full">
                <Footer />
            </div>
            
            {/* Global AI Chat Widget */}
            <AISearchModal />
        </div>
    );
};

export default MainLayout;
