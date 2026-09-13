require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully ✅");

    const email = "tejas@test.com";
    const newPassword = "Tejas@123";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found ❌");
      process.exit(1);
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    console.log("Password reset successfully ✅");
    console.log("--------------------------------");
    console.log("Email:", email);
    console.log("Password:", newPassword);
    console.log("--------------------------------");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Password reset failed ❌");
    console.error(error);
    process.exit(1);
  }
}

resetPassword();