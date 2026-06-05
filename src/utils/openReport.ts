import axios from "axios";

export const openReport = async (
  reportUrl: string,
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    const response = await axios.get(reportUrl, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");


    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      console.error("Failed to open report:", error);
    }
  }
};