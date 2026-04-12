import { BookData } from "./useBookManager";

interface UseFileUploadProps {
  addBook: (name: string, fileUrl: string) => Promise<BookData>;
}

export const useFileUpload = ({ addBook }: UseFileUploadProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        const fileUrl = reader.result as string;
        await addBook(file.name, fileUrl);
      };

      reader.onerror = () => {
        console.error("FileReader encountered an error.");
      };

      reader.readAsDataURL(file);
    }
  };

  return { handleFileChange };
};
