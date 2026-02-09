import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const ShowMessage = (type: number, message: string) => {
    if (type === 1) {
        toast.success(message);
    } else if (type === 2) {
        toast.error(message);
    } else {
        toast.info(message);
    }
};
