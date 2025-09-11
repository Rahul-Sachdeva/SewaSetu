import mongoose from "mongoose" // to connect with mongoDB
const DB_NAME = "sewaSetu";

// This function is used to connect with mongoDB using mongoose and connection URL
// Since it is a request on database, we preferably always use try and catch for error handling and await since request may take time
// Finally we print Successful connection or Error
const connectDB = async() => {
    try{
        const dbInstance = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
        console.log("Database connected successfully on HOST: ", dbInstance.connection.host);
    }
    catch(error){
        console.log(error);
        throw new Error(500, "Error in connecting Database");
    }
}

export {connectDB};
