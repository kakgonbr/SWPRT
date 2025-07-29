import type { PopupBanner } from "../types/admin";

interface PopupPreviewProps {
    formData: Partial<PopupBanner>;
}

const PopupPreview: React.FC<PopupPreviewProps> = ({ formData }) => {
    return (
        <div className="border rounded-lg p-4 mt-2">
            <div
                className="p-4 rounded text-center"
                style={{
                    backgroundColor: formData.background,
                    color: formData.textColor,
                }}
            >
                <h4 className="font-semibold mb-2">{formData.title}</h4>
                <p className="mb-3">{formData.message}</p>
                {formData.buttonText && (
                    <button
                        className="px-4 py-2 rounded border border-current hover:bg-white/10 transition-colors"
                        style={{ borderColor: formData.textColor }}
                        onClick={() => {
                            const targetUrl = `${window.location.protocol}//${window.location.host}${formData.buttonLink}`;
                            window.location.href = targetUrl;
                        }}
                    >
                        {formData.buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PopupPreview;