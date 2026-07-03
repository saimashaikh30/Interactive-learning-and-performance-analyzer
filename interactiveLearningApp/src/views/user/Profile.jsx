import { useEffect, useState } from "react";
import axios from "axios";
import InputField from "components/fields/InputField";

export default function Profile() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    authprovider: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:5000/users/getProfile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = res.data.user;

      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        role: user.role,
        authprovider: user.authprovider,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z ]+$/.test(formData.name)) {
      newErrors.name = "Only letters and spaces are allowed";
    }

    if (formData.authprovider === "local") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "Enter a valid email";
      }

      if (formData.password) {
        if (
          !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
            formData.password
          )
        ) {
          newErrors.password =
            "Minimum 8 characters with letter, number & special character";
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword =
            "Passwords do not match";
        }
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");

    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        email: formData.email,
      };

      if (
        formData.authprovider === "local" &&
        formData.password
      ) {
        payload.password = formData.password;
      }

      const res = await axios.put(
        "http://127.0.0.1:5000/users/editProfile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem(
        "user_name",
        res.data.user.name
      );

      localStorage.setItem(
        "user_email",
        res.data.user.email
      );

      setSuccess("Profile updated successfully.");

      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
        if (err.response?.status === 401) {
            localStorage.clear();
            window.location.href = "/auth/sign-in";
            return;
        }

        setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setSaving(false);
    }
  };

    if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="rounded-3xl bg-white p-8 shadow-lg">

        {/* Header */}
        <div className="mb-8 flex flex-col items-center">

          <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-brand-500 text-4xl font-bold text-white">
            {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
          </div>

          <h2 className="text-3xl font-bold text-navy-700">
            My Profile
          </h2>

          <p className="mt-2 text-gray-500">
            View and update your profile information
          </p>

        </div>

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

          {/* Left Side */}
          <div className="space-y-6">

            <InputField
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              state={errors.name}
            />

            <div className={formData.authprovider === "google" ? "pointer-events-none opacity-70" : ""}>
                <InputField
                    label="Email"
                    type="email"
                    value={formData.email}
                    disabled={formData.authprovider === "google"}
                    onChange={(e) => handleChange("email", e.target.value)}
                    state={errors.email}
                />
            </div>
            {/* {formData.authprovider === "google" && (
              <p className="text-sm text-gray-500">
                Google users cannot change email.
              </p>
            )} */}

          </div>

          {/* Right Side */}
          <div className="space-y-6">

            
              
            <div className="pointer-events-none opacity-70">
              <InputField
                label="Role"
                value={
                    formData.role
                    ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
                    : ""
                }
                disabled
                />
           </div>

            
              
            <div className="pointer-events-none opacity-70">
              <InputField
                label="Login Provider"
                value={
                    formData.authprovider
                    ? formData.authprovider.charAt(0).toUpperCase() + formData.authprovider.slice(1)
                    : ""
                }
                disabled
                />
                </div>
            
          </div>

        </div>

        {formData.authprovider === "local" && (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">

            <InputField
              label="New Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                handleChange("password", e.target.value)
              }
              state={errors.password}
            />

            <InputField
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
              state={errors.confirmPassword}
            />

          </div>
        )}

        <div className="mt-10 flex justify-end">

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="rounded-xl bg-brand-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Profile"}
          </button>

        </div>

      </div>
    </div>
  );
}