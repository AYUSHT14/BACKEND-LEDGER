const mongoose  = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: [ true,"Email is required for creating a user"],
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
        unique: [true,'Email already exists']
    },
    name:{
        type: String,
        required: [ true,"Name is required for creating a account"],
        trim: true,
    },
    password:{
        type: String,
        required:[true,"Password is required fro creating an account"],
        minlength:[6,"Password must be at least 6 characters long"],
        maxlength:[20,"Password must be at most 20 characters long"],
        select:false
    },
    systemUser:{
        type: Boolean,
        default: false,
        immutable:true,
        select:false
    }
},{
    timestamps:true
})

//Iska main kaam h password ko Hash krna...
userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return;
    }
    const hash = await bcrypt.hash(this.password,10);
    this.password = hash;
})

//Iska main kaam h password ko Compare krna...
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateToken = function(){
    return jwt.sign(
        {id:this._id},
        process.env.JWT_SECRET,
        {
            expiresIn:"3d"
        }
    );
}
const userModel = mongoose.model("User",userSchema);
module.exports = userModel;