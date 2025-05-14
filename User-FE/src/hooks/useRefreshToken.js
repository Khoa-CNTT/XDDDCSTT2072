import axios from 'axios';
import useAuth from './useAuth';

const API_URL = 'http://localhost:8080/api/v1';

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
                withCredentials: true
            });

            setAuth(prev => {
                console.log('Token được làm mới');
                return { 
                    ...prev, 
                    accessToken: response.data.accessToken 
                }
            });
            
            return response.data.accessToken;
        } catch (error) {
            console.error('Lỗi khi làm mới token:', error);
            // Không thay đổi auth state nếu lỗi
            return null;
        }
    };
    
    return refresh;
};

export default useRefreshToken; 