import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/smart_village/api";

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

// ── Refresh Queue Lock ──────────────────────────────────────────────────────
// ป้องกัน race condition: ถ้ามีหลาย request ได้ 401 พร้อมกัน
// จะ refresh แค่ครั้งเดียว ที่เหลือรอ token ใหม่
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) reject(error);
		else resolve(token!);
	});
	failedQueue = [];
}
// ───────────────────────────────────────────────────────────────────────────

// ดักจับ 401 → ขอ token ใหม่ → retry request เดิม
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			// ถ้ากำลัง refresh อยู่ → ใส่ request นี้เข้า queue แล้วรอ
			if (isRefreshing) {
				return new Promise<string>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((newToken) => {
						originalRequest.headers.Authorization = `Bearer ${newToken}`;
						return apiClient(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			isRefreshing = true;

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

				// แจ้ง queue ว่าได้ token ใหม่แล้ว
				processQueue(null, token);

				// retry request เดิมด้วย token ใหม่
				originalRequest.headers.Authorization = `Bearer ${token}`;
				return apiClient(originalRequest);
			} catch (refreshError) {
				// refresh ล้มเหลว → แจ้ง queue ให้ reject ทั้งหมด
				processQueue(refreshError, null);

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
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;
