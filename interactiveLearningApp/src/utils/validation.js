export const validateSignUp = (form) => {
  const errors = {};

  // Name
  if (!form.name.trim()) {
    errors.name = "Name is required";
  } else if (!/^[A-Za-z ]+$/.test(form.name)) {
    errors.name = "Only letters allowed";
  } else if (form.name.length < 3) {
    errors.name = "Minimum 3 characters";
  } else if (form.name.length > 20) {
    errors.name = "Maximum 20 characters";
  }

  // Email
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Invalid email format";
  }

  // Password
  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Minimum 6 characters";
  }

  return errors;
};

export const validateSignIn = (form) => {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = "Email is required";
  }

  if (!form.password) {
    errors.password = "Password is required";
  }

  return errors;
};