const Footer = () => {
    return (
        <footer className="bg-dark border-t border-white/5 py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="text-2xl font-bold text-primary mb-4">
                            NYAN <span className="text-white font-light lowercase">movie</span>
                        </div>
                        <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                            Nyan Movie - Nền tảng xem phim trực tuyến đa dạng, chất lượng cao và hoàn toàn miễn phí. Đồ án xây dựng trên nền tảng MERN Stack.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Thể loại</h4>
                        <ul className="text-gray-400 text-sm space-y-2">
                            <li className="hover:text-primary cursor-pointer transition-colors">Phim Hành Động</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Phim Tình Cảm</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Phim Kinh Dị</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Phim Hài Hước</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Kết nối</h4>
                        <ul className="text-gray-400 text-sm space-y-2">
                            <li className="hover:text-primary cursor-pointer transition-colors">Facebook</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">YouTube</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Telegram</li>
                            <li className="hover:text-primary cursor-pointer transition-colors">Email Support</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 text-center">
                    <p className="text-gray-500 text-xs italic">
                        © {new Date().getFullYear()} Nyan Movie Project. All rights reserved. 
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
