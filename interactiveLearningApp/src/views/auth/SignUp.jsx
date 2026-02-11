import InputField from "components/fields/InputField";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
  return (
    <div className="mt-8 w-full max-w-[420px] px-4">

      <h4 className="mb-2 text-3xl font-bold text-navy-700 dark:text-white">
        Register
      </h4>

      <p className="mb-6 text-sm text-gray-600">
        Create your account to get started
      </p>

      {/* Google */}
      <div className="mb-4 flex h-[45px] items-center justify-center gap-2 rounded-xl bg-lightPrimary dark:bg-navy-800">
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

      <InputField
        variant="auth"
        extra="mb-2"
        label="Full Name*"
        placeholder="John Doe"
        id="name"
        type="text"
      />

      <InputField
        variant="auth"
        extra="mb-2"
        label="Email*"
        placeholder="mail@example.com"
        id="email"
        type="email"
      />

      <InputField
        variant="auth"
        extra="mb-2"
        label="Password*"
        placeholder="Min. 8 characters"
        id="password"
        type="password"
      />

      <InputField
        variant="auth"
        extra="mb-3"
        label="Confirm Password*"
        placeholder="Repeat password"
        id="confirmPassword"
        type="password"
      />

      <button className="w-full rounded-xl bg-brand-500 py-[10px] text-sm font-medium text-white hover:bg-brand-600">
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
