export interface SubmitReportParams {
    userId: number;
    typeId: number;
    title: string;
    body: string;
    image: File;
}

const API = import.meta.env.VITE_API_BASE_URL;

export const useCustomerReport = (token: string) => {

    const submitReport = async (params: SubmitReportParams) => {
        try {
            // 1. Upload image
            const formData = new FormData();
            formData.append('file', params.image);
            const imageRes = await fetch(`${API}/api/images`, {
                headers: { Authorization: `Bearer ${token}` },
                method: 'POST',
                body: formData
            });
            if (!imageRes.ok) {
                return { success: false, message: 'Upload image failed.' };
            }
            const imageData = await imageRes.json();
            const imagePath = imageData.url || '';
            if (!imagePath) {
                return { success: false, message: 'No image url returned.' };
            }
            // 2. Submit report
            const reportDTO = {
                userId: params.userId,
                typeId: params.typeId,
                title: params.title,
                body: params.body,
                imagePath,
                reportTime: new Date().toISOString(),
                status: 'Unresolved'
            };
            const reportRes = await fetch(`${API}/api/report`, {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(reportDTO)
            });
            if (reportRes.ok) {
                return { success: true };
            } else {
                return { success: false, message: 'Create report failed.' };
            }
        } catch (error) {
            return { success: false, message: 'Error occurred while submitting report.' };
        }
    };

    const fetchReportsPaginated = async (page: number) => {
        try {
            const res = await fetch(`${API}/api/report/paginated?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) 
                return { success: false, message: 'Failed to fetch reports.' };
            const data = await res.json();
            return { success: true, data };
        } catch {
            return { success: false, message: 'Error fetching reports.' };
        }
    };

    const fetchReportById = async (id: number) => {
        try {
            const res = await fetch(`${API}/api/report/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) 
                return { success: false, message: 'Failed to fetch report.' };
            const data = await res.json();
            return { success: true, data };
        } catch {
            return { success: false, message: 'Error fetching report.' };
        }
    };

    const updateReportStatus = async (reportDTO: any) => {
        try {
            const res = await fetch(`${API}/api/report/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(reportDTO)
            });
            if (!res.ok) 
                return { success: false, message: 'Failed to update report.' };
            return { success: true };
        } catch {
            return { success: false, message: 'Error updating report.' };
        }
    };

    return { submitReport, fetchReportsPaginated, fetchReportById, updateReportStatus };
}