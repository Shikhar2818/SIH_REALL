"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ResourceSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['article', 'video', 'audio', 'document', 'link', 'exercise', 'guide'],
        required: true,
    },
    tags: [{
            type: String,
            trim: true,
        }],
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    downloadCount: {
        type: Number,
        default: 0,
    },
    fileUrl: {
        type: String,
    },
    thumbnailUrl: {
        type: String,
    },
    youtubeId: {
        type: String,
        trim: true,
    },
    youtubeUrl: {
        type: String,
        trim: true,
    },
    duration: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
ResourceSchema.index({ title: 'text', description: 'text', content: 'text' });
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ isPublished: 1 });
ResourceSchema.index({ featured: 1 });
ResourceSchema.index({ authorId: 1 });
exports.default = mongoose_1.default.model('Resource', ResourceSchema);
//# sourceMappingURL=Resource.js.map