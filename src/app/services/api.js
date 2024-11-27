import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_URL; 

export const fetchUsers = async () => {
  try {
    console.log("Hello");

    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
};
