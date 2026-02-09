export const openReport = (
  reportUrl: string,
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    window.open(reportUrl, "_blank");

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
