import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:8080/smart_village/api";

const apiClient = axios.create({
	baseURL: API_BASE,
});

// แนบ token ทุก request อัตโนมัติ
apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// ดักจับ 401 → ขอ token ใหม่ → retry request เดิม
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const expiredToken = localStorage.getItem("token");
				const res = await axios.post(
					`${API_BASE}/auth/refresh`,
					{},
					{ headers: { Authorization: `Bearer ${expiredToken}` } }
				);

				const { token, role, scopeId } = res.data;
				localStorage.setItem("token", token);
				localStorage.setItem("role", role);
				localStorage.setItem("scopeId", String(scopeId));

				// retry request เดิมด้วย token ใหม่
				originalRequest.headers.Authorization = `Bearer ${token}`;
				return apiClient(originalRequest);
			} catch {
				// refresh ล้มเหลว → ล้าง localStorage + redirect login
				localStorage.removeItem("token");
				localStorage.removeItem("role");
				localStorage.removeItem("scopeId");

				await Swal.fire({
					icon: "warning",
					title: "เซสชันหมดอายุ",
					text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
					confirmButtonText: "ตกลง",
				});

				window.location.href = "/signin";
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;
