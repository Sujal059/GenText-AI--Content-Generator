const asyncHandler = require("express-async-handler");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ContentHistory = require("../models/ContentHistory");
const User = require("../models/User");

//----googleAI Controller----

const googleAIController = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  console.log("prompt:", prompt);
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const result = await model.generateContent(prompt);
    console.log("result:", result.response.text());

    //send the response
    // const content = response?.data?.choices[0].text?.trim();
    const content = result.response.text();
    console.log("content:",content);
    //Create the history
    const newContent = await ContentHistory.create({
      user: req?.user?._id,
      content,
    });
    //Push the content into the user
    const userFound = await User.findById(req?.user?.id);
    userFound.contentHistory.push(newContent?._id);
    //Update the api Request count
    userFound.apiRequestCount += 1;
    await userFound.save();
    res.status(200).json(content);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  googleAIController,
};
