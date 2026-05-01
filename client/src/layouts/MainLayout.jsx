import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
        </div>
    );
};

export default MainLayout;
