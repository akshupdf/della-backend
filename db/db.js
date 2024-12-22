const mongoose = require("mongoose")

const connectDatabase = () =>{

    mongoose.connect(process.env.DB_URL).then((data)=>{
        console.log("connected to db")
    })
}

module.exports = connectDatabase