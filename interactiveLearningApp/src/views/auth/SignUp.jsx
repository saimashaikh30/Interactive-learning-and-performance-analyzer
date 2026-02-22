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

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(""); // ✅ global error

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ================= VALIDATION =================
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.name)) {
      newErrors.name = "Name should contain only letters";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (form.name.length > 30) {
      newErrors.name = "Name cannot exceed 30 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Must contain at least 1 uppercase letter";
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "Must contain at least 1 lowercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Must contain at least 1 number";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= LOCAL REGISTER =================
  const handleRegister = async () => {
    setError("");
    if (!validate()) return;

    try {
      const res = await axios.post("http://127.0.0.1:5000/users/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        authprovider: "local",
        role: "user",
      });

      localStorage.setItem("access_token", res.data.access_token);
      navigate("/user", { replace: true }); // ✅ silent redirect
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          role: "user",
        });

        localStorage.setItem("access_token", res.data.access_token);
        navigate("/user", { replace: true }); // ✅ silent redirect
      } catch (err) {
        setError(err.response?.data?.message || "Google registration failed");
      }
    },
    onError: () => {
      setError("Google registration failed");
    },
  });

  return (
    <div className="w-full flex justify-center">
    <div className="w-full max-w-lg -mx-2">
      <h4 className="mb-2 text-3xl font-bold text-navy-700">
        Register
      </h4>
      <p className="mb-6 text-sm text-gray-600">
        Create your account to get started
      </p>

      {/* GOOGLE BUTTON */}
      <div
        onClick={() => googleRegister()}
        className="mb-4 flex h-[45px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200"
      >
        <FcGoogle className="text-xl" />
        <span className="text-sm font-medium text-gray-700">
          Sign up with Google
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px w-full bg-gray-200" />
        <span className="text-sm text-gray-500">or</span>
        <div className="h-px w-full bg-gray-200" />
      </div>

      <div className="flex flex-col gap-5 mb-6">
        <InputField
          label="User Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          state={errors.name}
        />

        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          state={errors.email}
        />

        <InputField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          state={errors.password}
        />

        <InputField
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            handleChange("confirmPassword", e.target.value)
          }
          state={errors.confirmPassword}
        />
      </div>

      <button
        onClick={handleRegister}
        className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
      >
        Create Account
      </button>

      {/* Inline error */}
      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?
        <a
          href="/auth/sign-in"
          className="ml-1 font-medium text-brand-500 hover:text-brand-600"
        >
          Sign In
        </a>
      </p>
    </div>
    </div>
  );
}