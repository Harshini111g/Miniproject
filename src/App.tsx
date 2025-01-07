import React, { useState } from "react";
import Spline from "@splinetool/react-spline";
import { Heart, Clock } from "lucide-react";

const apiEndpoint = "https://api.groq.com/openai/v1/chat/completions";
const apiKey = "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"; // Replace with your actual API key
const model = "llama-3.3-70b-versatile";
const maxTokens = 1024;

const App = () => {
  const [activeTab, setActiveTab] = useState("chatbot");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am an AI assistant. How can I help you today?",
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null); // To track current article being uploaded
  const [description, setDescription] = useState(""); // Store description

  // Login/Register states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registeredUser, setRegisteredUser] = useState(null);

  // Register handler
  const handleRegister = () => {
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters long and include a special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setRegisteredUser({ username, password });
    alert("Registration successful! You can now log in.");
    setIsRegistering(false);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  // Login handler
  const handleLogin = () => {
    if (
      registeredUser &&
      username === registeredUser.username &&
      password === registeredUser.password
    ) {
      setIsLoggedIn(true);
    } else {
      alert("Invalid username or password!");
    }
  };

  // Function to get response from the API
  const getResponse = async (userInput) => {
    try {
      const payload = {
        model: model,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userInput },
        ],
        max_tokens: maxTokens,
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content; // Assuming the response structure matches OpenAI's API
    } catch (error) {
      console.error("Error fetching response:", error.message);
      return "Sorry, I couldn’t fetch a response. Please try again later.";
    }
  };

  // Handle sending messages for chatbot
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    try {
      const response = await getResponse(newMessage);
      const responseParagraphs = response.split("\n").filter(Boolean); // Split response into paragraphs

      // Add the user message and each paragraph as separate messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: newMessage, isUser: true },
        ...responseParagraphs.map((para, index) => ({
          id: prevMessages.length + 2 + index,
          text: para,
          isUser: false,
        })),
      ]);
      setNewMessage("");
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: newMessage, isUser: true },
        {
          id: prevMessages.length + 2,
          text: "Error: Unable to fetch response.",
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle uploading articles
  const handleArticleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Track the uploaded article and trigger description input
        const newArticle = {
          id: articles.length + 1,
          name: file.name,
          pdf: reader.result,
        };
        setCurrentArticle(newArticle); // Set the current article being uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle saving article description
  const handleSaveDescription = () => {
    if (description && currentArticle) {
      const updatedArticle = {
        ...currentArticle,
        description, // Add the description to the article
      };
      setArticles((prevArticles) => [...prevArticles, updatedArticle]);
      setCurrentArticle(null); // Reset current article state
      setDescription(""); // Clear description input
    }
  };

  // Handle uploading PDFs for materials
  const handleMaterialUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newPdf = {
          id: pdfs.length + 1,
          name: file.name,
          pdf: reader.result,
        };
        setPdfs((prevPdfs) => [...prevPdfs, newPdf]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show the login/register form or the main content based on login status
  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        {/* Spline 3D Background */}
        <Spline
          scene="https://prod.spline.design/t1jD7IKZJrp8aiQt/scene.splinecode"
          className="absolute inset-0 z-0"
        />

        {/* Login/Register Form */}
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-md w-full relative z-10">
          {isRegistering ? (
            <div>
              <h2 className="text-2xl mb-4">Register</h2>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              />
              <button
                onClick={handleRegister}
                className="w-full p-2 bg-blue-500 rounded mt-4"
              >
                Register
              </button>
              <p className="mt-4 text-center">
                Already have an account?{" "}
                <span
                  onClick={() => setIsRegistering(false)}
                  className="text-blue-400 cursor-pointer"
                >
                  Login here
                </span>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl mb-4">Login</h2>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              />
              <button
                onClick={handleLogin}
                className="w-full p-2 bg-blue-500 rounded mt-4"
              >
                Login
              </button>
              <p className="mt-4 text-center">
                Don't have an account?{" "}
                <span
                  onClick={() => setIsRegistering(true)}
                  className="text-blue-400 cursor-pointer"
                >
                  Register here
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* 3D Background */}
      <Spline
        className="absolute inset-0 z-0"
        scene="https://prod.spline.design/PwWEW8GMNt6pXgrw/scene.splinecode"
      />

      {/* Content */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div
          className={`w-64 bg-gradient-to-b from-gray-900/80 to-gray-900 text-white p-4 fixed top-0 left-0 h-screen transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ul>
            <li
              className={`p-2 rounded-lg transition-all duration-200 hover:bg-blue-600 ${
                activeTab === "chatbot" ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setActiveTab("chatbot")}
            >
              Chatbot
            </li>
            <li
              className={`p-2 rounded-lg transition-all duration-200 hover:bg-blue-600 ${
                activeTab === "materials" ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setActiveTab("materials")}
            >
              Materials
            </li>
            <li
              className={`p-2 rounded-lg transition-all duration-200 hover:bg-blue-600 ${
                activeTab === "articles" ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setActiveTab("articles")}
            >
              Articles
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 ml-64">
          <button
            className="p-2 rounded-lg bg-blue-500 text-white fixed top-4 left-4 z-20 transition-all duration-300 hover:bg-blue-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Close" : "Open"}
          </button>

          {/* Chatbot Tab */}
          {activeTab === "chatbot" && (
            <div className="max-w-3xl mx-auto p-4 pt-6 bg-gray-900/80 text-white rounded-lg shadow-lg">
              <div className="overflow-y-scroll max-h-80 mb-4 p-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg mb-2 shadow-lg ${
                      message.isUser
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-700 text-white mr-auto"
                    }`}
                  >
                    {/* Render response text as paragraphs */}
                    {message.text.split("\n").map((para, index) => (
                      <p key={index}>{para}</p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  className={`p-2 rounded-lg bg-blue-500 text-white ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  } transition-all duration-300 hover:bg-blue-400`}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Send"}
                </button>
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="bg-gray-900/80 text-white p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold">Materials</h1>
              <ul>
                {pdfs.map((pdf) => (
                  <li key={pdf.id} className="mb-2">
                    <a
                      href={pdf.pdf}
                      className="text-blue-400 underline"
                      download
                    >
                      {pdf.name}
                    </a>
                  </li>
                ))}
              </ul>
              <input
                type="file"
                onChange={handleMaterialUpload}
                className="text-gray-200"
              />
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === "articles" && (
            <div className="bg-gray-900/80 text-white p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold">Articles</h1>
              <ul>
                {articles.map((article) => (
                  <li key={article.id} className="mb-4">
                    <h2 className="font-semibold">{article.name}</h2>
                    <p className="text-gray-400">{article.description}</p>
                    <a
                      href={article.pdf}
                      download
                      className="text-blue-400 underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
              <input
                type="file"
                onChange={handleArticleUpload}
                className="text-gray-200"
              />

              {/* Show description input box when article is uploaded */}
              {currentArticle && (
                <div className="mt-4">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
                    placeholder="Enter article description"
                  />
                  <button
                    onClick={handleSaveDescription}
                    className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
                  >
                    Save Description
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
