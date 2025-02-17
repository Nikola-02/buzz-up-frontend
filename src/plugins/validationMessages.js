export const rules = {
  required: (v) => !!v || "Field is required",
  email: (v) => /.+@.+\..+/.test(v) || "Invalid email format",
  password: (v) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v) ||
    "Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number",
};
