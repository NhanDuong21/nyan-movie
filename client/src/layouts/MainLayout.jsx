import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark flex flex-col">
            <Header />
            <main className="flex-grow pt-8 pb-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
