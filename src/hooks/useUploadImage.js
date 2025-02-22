// src/hooks/useUploadImage.js
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase";

export const useUploadImage = () => {
  const uploadImage = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    try {
      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw error;
    }
  };

  return uploadImage;
};
