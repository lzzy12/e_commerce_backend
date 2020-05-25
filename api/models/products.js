const { Schema, model, Types } = require('mongoose');

const productSchema = new Schema({
    name: {
        maxLength: 30,
        required: true,
        type: String,
        trim: true
    },
    description: {
        minlength: 20,
        type: String,
        trim: true,
        required: true,
    },
    price: {
        required: true,
        type: Number,
        trim: true,
        min: 0,
    },
    discount: {
        default: 0,
        trim: true,
        type: Number,
        min: 0,
    },
    medias: [{
        url: {
            required: true,
            validate: new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi),
            type: String,
        },
        type: {
            required: true,
            type: String,
            enum: ['image', 'video']
        }
    }],
    stock: {
        type: Number,
        required: true,
    },
    categories: [{ type: Types.ObjectId, ref: 'Category' }],
    sizes: [{
        type: String,
        enum: [
            'XS',
            'S',
            'M',
            'L',
            'XL',
            'XXL',
            'XXXL',
        ]
    }],
    colors: [{
        color: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    }
    ],

}, { timestamps: true, });

module.exports = model('Product', productSchema);
