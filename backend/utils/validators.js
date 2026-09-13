const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 6;
};

module.exports = {
  isValidEmail,
  isValidPassword,
};