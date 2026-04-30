import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Footer = () => {
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await axiosClient.get('/categories/genres');
                setGenres(res.data.data);
            } catch (err) {
                console.error('Failed to fetch genres for footer', err);
            }
        };
        fetchGenres();
    }, []);

    return (
        <footer className="bg-dark border-t border-white/5 py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="text-2xl font-black italic tracking-tighter text-white mb-4 uppercase">
                            NYAN <span className="text-primary tracking-[0.2em] not-italic">movie</span>
                        </div>
                        <p className="text-gray-400 text-sm max-w-sm leading-relaxed font-medium">
                            Nyan Movie - Nền tảng xem phim trực tuyến đa dạng, chất lượng cao và hoàn toàn miễn phí. Đồ án xây dựng trên nền tảng MERN Stack với thiết kế hiện đại, cao cấp.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Thể loại</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            {genres.slice(0, 12).map(genre => (
                                <Link 
                                    key={genre.id} 
                                    to={`/browse?genre=${genre.slug}`}
                                    className="text-gray-400 text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-colors truncate"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Kết nối</h4>
                        <ul className="text-gray-400 text-[11px] font-bold uppercase tracking-widest space-y-4">
                            <li>
                                <a href="https://www.facebook.com/nyanprofile" className="hover:text-primary transition-colors">
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href="https://t.me/XieChugLing" className="hover:text-primary transition-colors">
                                    Telegram
                                </a>
                            </li>
                            <li>
                                <a href="mailto:sgoku4880@gmail.com" className="hover:text-primary transition-colors">
                                    Email Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-white/5 pt-8 text-center">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        © {new Date().getFullYear()} Nyan Movie Project. All rights reserved. 
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
