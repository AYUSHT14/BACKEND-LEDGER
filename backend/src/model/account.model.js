const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");
const accountSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: [true,"Account must be associated with a user"],
        index: true
    },
    status:{
        type: String,
        required: true,
        enum:{
            values: ["ACTIVE","FROZEN","CLOSED"],
            message:"Status must be ACTIVE,FROZEN or CLOSED"
        },
        default: "ACTIVE"
    },
    currency:{
        type: String,
        required: true,
        enum:{
            values: ["INR","USD","EUR"],
            message:"Currency must be INR,USD or EUR"
        }
    }
},
{
    timestamps: true
})

accountSchema.index({userId: 1, status: 1})

accountSchema.methods.getBalance = async function(){
    //aggregate ek best cheaj h mongodb k jo custom query ko run krne k liye use hota h
   const balanceData = await ledgerModel.aggregate([
    {$match:{account:this._id}},
    {$group:
        {_id:null,
        totalDebit:{
            $sum:{
                $cond:[
                    {$eq:["$type","DEBIT"]},
                    "$amount",
                    0
                ]
            }
        },
        totalCredit:{
            $sum:{
                $cond:[
                    {$eq:["$type","CREDIT"]},
                    "$amount",
                    0
                ]
            }
        }
        }
    },
    {
        $project:{
            balance:{$subtract:["$totalCredit","$totalDebit"]}
        }
    }
   ]);
   return balanceData.length == 0 ? 0 : balanceData[0].balance;
}

    const accountModel = mongoose.model("account",accountSchema)
    module.exports = accountModel