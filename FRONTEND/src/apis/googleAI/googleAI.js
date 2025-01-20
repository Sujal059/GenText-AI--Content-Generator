import axios from "axios";
//=======Registration=====

export const generateContentAPI = async (userPrompt) => {
  const response = await axios.post(
    "https://gentext-ai-content-generator.onrender.com/api/v1/googleai/generate-content" ||
    "http://localhost:8090/api/v1/googleai/generate-content",
    {
      prompt: userPrompt,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
