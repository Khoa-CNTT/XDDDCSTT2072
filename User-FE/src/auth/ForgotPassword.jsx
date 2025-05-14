import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
    
        if (!email.trim()) {
            setError("Vui lòng nhập email.");
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append("email",email)
            const response = await axios.post('http://localhost:8080/api/v1/auth/forgot-password', formData);
            console.log(response)
            setSuccess(response.data?.message || "Vui lòng kiểm tra email.");
        } catch (err) {
            const res = err.response?.data;
            setError(res?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-6">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Quên mật khẩu</h2>
                {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
                {success && <div className="text-green-500 text-sm mb-2 text-center">{success}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                        Gửi link đặt lại mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
