const bcrypt = require("bcrypt");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const UserSchema = require("../models/userModel");
const ProductGroupSchema = require("../models/productGroupSchema");

const getAllCustomerList = async (req, res) => {
  try {
    const tempData = await UserSchema.find({}, "-_id -__v -password");
    const data = await Promise.all(
      tempData.map(async (item) => {
        const groupNames = await ProductGroupSchema.findOne(
          { id: item?.groupId },
          "groupName"
        );
        return {
          id: item?.id,
          customerName: item?.customerName,
          customerId: item?.customerId,
          groupId: item?.groupId,
          userRole: item?.userRole,
          purchaseLimit: item?.purchaseLimit,
          groupName: groupNames?.groupName,
        };
      })
    );
    res.status(200).json({ status: "200", count: data?.length, data: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addCustomer = async (req, res) => {
  try {
    const {
      customerName,
      customerId,
      password,
      groupId,
      userRole,
      purchaseLimit,
    } = req.body;

    const duplicateCustomer = await UserSchema.find({ customerId });
    if (duplicateCustomer) {
      return res
        .status(400)
        .json({ status: "200", error: "User with Customer Id already exists" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: uuidv4(),
      customerName,
      customerId,
      password: hashedPassword,
      groupId,
      userRole,
      purchaseLimit,
    };

    const addedUser = new UserSchema(user);
    await addedUser.save();

    res.status(201).json({ status: "200", message: "User added Successfully" });
  } catch (err) {
    res.status(500).json({ status: "200", error: err.message });
  }
};

module.exports = {
  addCustomer,
  getAllCustomerList,
};
