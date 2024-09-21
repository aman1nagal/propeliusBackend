const ProductGroupSchema = require("./../models/productGroupSchema");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const getAllProductsGroupList = async (req, res) => {
  try {
    const data = await ProductGroupSchema.find({}, "-_id -__v");
    res.status(200).json({ status: "200", count: data?.length, data: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addProductGroupList = async (req, res) => {
  console.log(req.body, "req.body");
  const { id } = req?.body;
  if (id) {
    try {
      const updatedProductGroup = await ProductGroupSchema.findOneAndUpdate(
        { id: id },
        { $set: { ...req.body } },
        { new: true }
      );
      if (!updatedProductGroup) {
        return res.status(404).json({ message: "Product Group not found" });
      }
      res.status(200).json({
        status: "200",
        message: "Products Group updated successfully",
        productsGroup: updatedProductGroup,
      });
    } catch (err) {
      res.status(500).json({ status: 500, error: err.message });
    }
  } else {
    try {
      const body = { ...req.body, id: uuidv4() };
      const duplicateExist = await ProductGroupSchema.findOne({
        name: body?.groupName,
      });

      if (duplicateExist) {
        return res
          .status(400)
          .json({ status: "200", error: "Group name already exists" });
      }

      const addedProductGroup = new ProductGroupSchema(body);
      await addedProductGroup.save();
      res.status(201).json({
        status: "200",
        message: "Products Group added successfully",
        productsGroup: addedProductGroup,
      });
    } catch (err) {
      res.status(500).json({ status: "200", error: err.message });
    }
  }
};

module.exports = {
  addProductGroupList,
  getAllProductsGroupList,
};
