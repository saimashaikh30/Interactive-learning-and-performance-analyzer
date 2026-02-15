import { useState } from "react";
import InputField from "components/fields/InputField";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ================= LOCAL REGISTER =================
  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:5000/users/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        authprovider: "local",
      });

      localStorage.setItem("access_token", res.data.access_token);
      alert("Registration successful");
      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  // ================= GOOGLE REGISTER =================
  const googleRegister = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post("http://127.0.0.1:5000/users/register", {
          access_token: tokenResponse.access_token,
          authprovider: "google",
        });

        localStorage.setItem("access_token", res.data.access_token);
        alert("Google registration successful");
        navigate("/admin");
      } catch (err) {
        alert(err.response?.data?.message || "Google registration failed");
      }
    },
  });

  return (
    <div className="mt-8 w-full max-w-[420px] px-4">
      <h4 className="mb-2 text-3xl font-bold text-navy-700 dark:text-white">
        Register
      </h4>
      <p className="mb-6 text-sm text-gray-600">
        Create your account to get started
      </p>

      {/* GOOGLE BUTTON */}
      <div
        onClick={() => googleRegister()}
        className="mb-4 flex h-[45px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-lightPrimary dark:bg-navy-800"
      >
        <FcGoogle className="text-xl" />
        <span className="text-sm font-medium text-navy-700 dark:text-white">
          Sign up with Google
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
        <span className="text-sm text-gray-600 dark:text-white">or</span>
        <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
      </div>

      {/* LOCAL INPUT FIELDS */}
      <InputField
        variant="auth"
        extra="mb-2"
        label="Full Name*"
        placeholder="John Doe"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />

      <InputField
        variant="auth"
        extra="mb-2"
        label="Email*"
        placeholder="mail@example.com"
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />

      <InputField
        variant="auth"
        extra="mb-2"
        label="Password*"
        placeholder="Min. 8 characters"
        type="password"
        value={form.password}
        onChange={(e) => handleChange("password", e.target.value)}
      />

      <InputField
        variant="auth"
        extra="mb-3"
        label="Confirm Password*"
        placeholder="Repeat password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="w-full rounded-xl bg-brand-500 py-[10px] text-sm font-medium text-white hover:bg-brand-600"
      >
        Create Account
      </button>

      <p className="mt-4 text-center text-sm text-navy-700 dark:text-gray-600">
        Already have an account?
        <a
          href="/auth/sign-in"
          className="ml-1 font-medium text-brand-500 hover:text-brand-600"
        >
          Sign In
        </a>
      </p>
    </div>
  );
}
