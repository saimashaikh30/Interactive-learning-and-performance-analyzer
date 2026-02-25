import { useState, useEffect } from "react";
import InputField from "components/fields/InputField";
import { HiMail } from "react-icons/hi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState("email");
  // email | otp | success | reset

  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ================= EMAIL ================= */
  const handleEmailSubmit = () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    setTimer(60); // start resend timer
    setStep("otp");
  };

  /* ================= RESEND CODE ================= */
  const handleResendCode = () => {
    setOtp("");
    setError("");
    setTimer(60); // restart timer

    // call resend OTP API here
    console.log("OTP resent to:", email);
  };

  /* ================= OTP ================= */
  const handleOtpSubmit = () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit verification code");
      return;
    }

    // backend verification should happen here
    setError("");
    setStep("success");
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    alert("Password reset successfully!");
  };

  return (
    <div className="w-full">
      {/* ================= STEP 1: EMAIL ================= */}
      {step === "email" && (
        <>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Forgot Password
          </h2>

          <p className="mb-8 text-sm text-gray-600">
            Enter your registered email address and we’ll send you a
            verification code.
          </p>

          <div className="mb-6">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              state={error}
            />
          </div>

          <button
            onClick={handleEmailSubmit}
            className="w-full rounded-xl bg-brand-500 py-3 text-white hover:bg-brand-600"
          >
            Send Verification Code
          </button>
        </>
      )}

      {/* ================= STEP 2: OTP ================= */}
      {step === "otp" && (
        <>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Verify Code
          </h2>

          <p className="mb-4 text-sm text-gray-600">
            Enter the 6-digit code sent to <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <div className="mb-4">
            <InputField
              label="Verification Code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              state={error}
              placeholder="123456"
            />
          </div>

          {/* Resend Code */}
          <div className="mb-6 text-sm text-gray-600">
            {timer > 0 ? (
              <span>Resend code in {timer}s</span>
            ) : (
              <button
                onClick={handleResendCode}
                className="font-medium text-brand-500 hover:text-brand-600"
              >
                Resend Code
              </button>
            )}
          </div>

          <button
            onClick={handleOtpSubmit}
            className="w-full rounded-xl bg-brand-500 py-3 text-white hover:bg-brand-600"
          >
            Verify Code
          </button>
        </>
      )}

      {/* ================= STEP 3: SUCCESS ================= */}
      {step === "success" && (
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <HiMail className="text-2xl text-green-600" />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-gray-900">
            Verification Successful
          </h3>

          <p className="mb-6 text-sm text-gray-600">
            Your email has been verified.
          </p>

          <button
            onClick={() => {
              setError("");
              setStep("reset");
            }}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-white hover:bg-brand-600"
          >
            Continue
          </button>
        </div>
      )}

      {/* ================= STEP 4: RESET PASSWORD ================= */}
      {step === "reset" && (
        <>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Reset Password
          </h2>

          <p className="mb-8 text-sm text-gray-600">
            Enter your new password below.
          </p>

          <div className="mb-5">
            <InputField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              state={error}
            />
          </div>

          <div className="mb-6">
            <InputField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              state={error}
            />
          </div>

          <button
            onClick={handleResetPassword}
            className="w-full rounded-xl bg-brand-500 py-3 text-white hover:bg-brand-600"
          >
            Reset Password
          </button>
        </>
      )}
    </div>
  );
}