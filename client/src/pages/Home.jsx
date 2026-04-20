import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-dark text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold text-primary">Nyan Movie</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Welcome, {user?.username}</span>
                        <button
                            onClick={logout}
                            className="bg-dark-lighter border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="bg-dark-card p-12 rounded-3xl border border-white/5 text-center">
                    <h2 className="text-4xl font-bold mb-4">Welcome to Nyan Movie!</h2>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        You have successfully logged in. This is your personal dashboard. 
                        In the next phase, we'll build the movie browsing experience.
                    </p>
                    
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-dark-lighter rounded-2xl border border-white/5">
                            <div className="text-primary text-2xl mb-2">🎬</div>
                            <h3 className="font-semibold mb-1">Browse Movies</h3>
                            <p className="text-xs text-gray-500">Explore latest releases</p>
                        </div>
                        <div className="p-6 bg-dark-lighter rounded-2xl border border-white/5 opacity-50">
                            <div className="text-primary text-2xl mb-2">⭐</div>
                            <h3 className="font-semibold mb-1">Watchlist</h3>
                            <p className="text-xs text-gray-500">Coming Soon</p>
                        </div>
                        <div className="p-6 bg-dark-lighter rounded-2xl border border-white/5 opacity-50">
                            <div className="text-primary text-2xl mb-2">⚙️</div>
                            <h3 className="font-semibold mb-1">Settings</h3>
                            <p className="text-xs text-gray-500">Coming Soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
