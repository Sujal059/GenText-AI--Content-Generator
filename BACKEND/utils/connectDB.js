const mongoose = require('mongoose');


//connect
const dbConnect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("db connect successfully");
    } catch (error) {
        console.log(error.message);
        process.exit(1);   //use to exit the server
    }
};

dbConnect();

module.exports = dbConnect;