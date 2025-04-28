
import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!password.trim() || !confirmPassword.trim()) {
            setError("Vui lòng nhập đầy đủ mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("token", token);
            formData.append("password", password);

            const response = await axios.post('http://localhost:8080/api/v1/auth/reset-password', formData);
            console.log(response);
            setSuccess(response.data?.message || "Đặt lại mật khẩu thành công!");
        } catch (err) {
            const res = err.response?.data;
            setError(res?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-6">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Đặt lại mật khẩu</h2>
                {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
                {success && <div className="text-green-500 text-sm mb-2 text-center">{success}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">Mật khẩu mới</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                        Xác nhận đặt lại mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
