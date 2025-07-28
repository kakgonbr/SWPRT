
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
            const imagePath = imageData.name || '';
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

    return { submitReport };
}