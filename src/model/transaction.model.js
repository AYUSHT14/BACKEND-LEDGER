const mongoose  = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true,"Transaction must be associated with a from account"],
        index: true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true,"Transaction must be associated with a to account"],
        index: true
    },
    status:{
        type:String,
        required: [true,"Transaction status is required"],
        enum: {
            values: ["PENDING","COMPLETED","FAILED","REVERSED"],
            message: "Status can be either PENDING, COMPLETED, FAILED or REVERSED",
        },
        default: "PENDING"
    },
    amount:{
        type:Number,
        required: [true,"Transaction amount is required"],
        validate:{
            validator: function(v){
                return v > 0
            },
            message: "Transaction amount must be greater than 0"
        }
    },
    idempotencyKey:{
        type:String,
        required: [true,"Idempotency key is required"],
        index: true,
        unique: true
    }
    // currency:{
    //     type:String,
    //     required: [true,"Transaction currency is required"],
    //     enum: ["INR","USD","EUR"]
    // },
    // transactionId:{
    //     type:String,
    //     required: [true,"Transaction ID is required"],
    //     unique: true
    // }
}, { timestamps: true });
const transactionModel = mongoose.model("transaction",transactionSchema)
module.exports = transactionModel