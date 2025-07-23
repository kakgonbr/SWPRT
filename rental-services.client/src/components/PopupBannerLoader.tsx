import { useState, useEffect } from "react";
import type { PopupBanner } from "../types/admin";
import PopupPreview from "./PopupPreview";

const API = import.meta.env.VITE_API_BASE_URL;


const PopupBannerLoader: React.FC = () => {
    const [data, setData] = useState<Partial<PopupBanner> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopupData = async () => {
            try {
                const res = await fetch(`${API}/api/serverinfo/banners`);
                if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

                const json = await res.json();

                const isValid =
                    json.title && json.message && json.background && json.textColor;

                if (!isValid) throw new Error('Invalid or incomplete popup data');

                setData(json);
            } catch (err: any) {
                console.error('PopupBannerLoader error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPopupData();
    }, []);

    if (loading) return <div>Loading</div>;
    if (error || !data) return null;

    return (
        <>
            <PopupPreview formData={data} />
        </>
    );
};

export default PopupBannerLoader;