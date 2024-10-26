const Product = require('../models/Product');

const generateProductCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000);
    return 'P-'+code;
}

exports.createProduct = async (req, res) => {
    const {
        name,
        category,
        price,
        description,
        unit,
        stock,
        status = 1
    } = req.body
    try {
        if (!name || !category || !price) {
            return res.status(400).json({ message: 'name category and price are required', status: 400 });
        }

        const code = generateProductCode();

        const product = new Product({
            code,
            name,
            category,
            price,
            description,
            unit,
            stock,
            status
        });

        await product.save();

        return res.status(200).json({
            message: 'Product created successfully',
            status: 200
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
};

exports.updateProduct = async (req, res) => {
    const {
        name,
        category,
        price,
        description,
        unit,
        stock,
        status
    } = req.body
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: 'product id is required', status: 400 });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'product not found', status: 404 });
        }

        product.name = name || product.name;
        product.category = category || product.category;
        product.price = price || product.price;
        product.unit = unit || product.unit;
        product.description = description || product.description;
        product.stock = stock || product.stock;
        product.status = status || product.status;

        await product.save();

        return res.status(201).json({
            message: 'Product updated successfully',
            status: 201
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
};

exports.getProducts = async (req, res) => {
    const { page = 1, limit = 50, category, name, status } = req.query;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };
    try {
        let query = {};
        if (category) {
            query.category = category;
        }
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }
        const products = await Product.find(query).skip((options.page - 1) * options.limit).limit(options.limit).sort({ createdAt: -1 }).select('-__v');
        return res.status(200).json({
            message: 'Products retrieved successfully',
            status: 200,
            data: products
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}

exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ message: 'product id is required', status: 400 });
        }
        const product = await Product.findById(id).select('-__v');
        if (!product) {
            return res.status(404).json({ message: 'product not found', status: 404 });
        }
        
        return res.status(200).json({
            message: 'Products retrieved successfully',
            status: 200,
            data: product
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ message: 'product id is required', status: 400 });
        }
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'product not found', status: 404 });
        }
        return res.status(200).json({
            message: 'Product deleted successfully',
            status: 200
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}