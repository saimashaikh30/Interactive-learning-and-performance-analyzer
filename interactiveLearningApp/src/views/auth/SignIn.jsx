import { useState } from "react";
import InputField from "components/fields/InputField";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAuthData = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);

    if (data.user?.id) {
      localStorage.setItem("user_id", String(data.user.id));
    }
    if (data.user?.name) {
      localStorage.setItem("user_name", data.user.name);
    }
    if (data.user?.email) {
      localStorage.setItem("user_email", data.user.email);
    }
  };

  const redirectByRole = (role) => {
    if (role === "student" || role === "contributor") {
      navigate("/student", { replace: true });
    } else {
      navigate("/admin", { replace: true });
    }
  };

  const handleLocalLogin = async () => {
    setError("");
    if (!validate()) return;

    try {
      const res = await axios.post("http://127.0.0.1:5000/users/login", {
        email,
        password,
        authprovider: "local",
      });

      saveAuthData(res.data);
      redirectByRole(res.data.role);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        setError("");

        const res = await axios.post("http://127.0.0.1:5000/users/login", {
          access_token: tokenResponse.access_token,
          authprovider: "google",
        });

        saveAuthData(res.data);
        redirectByRole(res.data.role);
      } catch (err) {
        setError(err.response?.data?.message || "Google login failed");
      }
    },
    onError: () => {
      setError("Google login failed");
    },
  });

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-lg -mx-2">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Sign In
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your email and password to sign in!
        </p>

        <div
          onClick={() => googleLogin()}
          className="mb-6 flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-lightPrimary dark:bg-navy-800"
        >
          <div className="rounded-full text-xl">
            <FcGoogle />
          </div>
          <h5 className="text-sm font-medium text-navy-700 dark:text-white">
            Sign In with Google
          </h5>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
          <p className="text-base text-gray-600 dark:text-white">or</p>
          <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
        </div>

        <div className="w-full space-y-6">
          <InputField
            label="Email"
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            state={errors.email}
          />

          <InputField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            state={errors.password}
          />
        </div>

        <div className="mb-4 flex items-center justify-between px-2">
          <a
            className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
            href="/auth/forgot-password"
          >
            Forgot Password?
          </a>
        </div>

        <button
          onClick={handleLocalLogin}
          className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          Sign In
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}

        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Not registered yet?
          </span>
          <a
            href="/auth/sign-up"
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}