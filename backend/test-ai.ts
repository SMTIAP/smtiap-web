import axios from 'axios';

async function test() {
  try {
    console.log("Sending request to backend...");
    const res = await axios.post('http://localhost:5000/api/ai/chat', { prompt: "surveys" });
    console.log("Response:", res.data);
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
  }
}

test();
